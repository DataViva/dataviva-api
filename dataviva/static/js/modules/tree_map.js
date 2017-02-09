var tree_map = document.getElementById('tree_map'),
    dataset = tree_map.getAttribute('dataset'),
    squares = tree_map.getAttribute('squares'),
    size = tree_map.getAttribute('size'),
    filters = tree_map.getAttribute('filters'),
    controls = true,
    depths = DEPTHS[dataset][squares],
    group = depths[0],
    sizes = SIZES[dataset][squares],
    basicValues = BASIC_VALUES[dataset],
    calcBasicValues = CALC_BASIC_VALUES[dataset];

var buildData = function(apiResponse, squaresMetadata, groupMetadata) {

    var getAttrByName = function(item, attr) {
        var index = headers.indexOf(attr);
        return item[index];
    };

    var data = [];
    var headers = apiResponse.headers;

    apiResponse.data.forEach(function(item) {
        try {
            var dataItem = {};

            headers.forEach(function(header){
                dataItem[header] = getAttrByName(item, header);
                if (['wage', 'average_wage'].indexOf(header) >= 0)
                    dataItem[header] = +dataItem[header]
            });

            dataItem[DICT[dataset]['item_id'][squares]] = dataItem[squares];

            for (key in calcBasicValues) {
                dataItem[key] = calcBasicValues[key](dataItem);   
            }

            depths.forEach(function(depth) {
                if (depth != squares && depth != group) {
                    dataItem[depth] = squaresMetadata[dataItem[squares]][depth]['name'];
                }
            });
           
            dataItem[squares] = squaresMetadata[dataItem[squares]]['name_' + lang];
            
            if (group) {
                if (HAS_ICONS.indexOf(group) >= 0)
                    dataItem['icon'] = '/static/img/icons/' + group + '/' + group + '_' + dataItem[group] + '.png';
                dataItem[group] = groupMetadata[dataItem[group]]['name_' + lang];
            }

            data.push(dataItem);
        } catch(e) {

        };
    });

    return data;
}

var loadViz = function(data) {

    var depthSelectorBuilder = function() {
        var array = depths.slice(0);
        array.splice(array.indexOf(squares), 1);
        array.splice(0, 0, squares);
        array.forEach(function(item, i){
            array[i] = {[dictionary[item]] : item};
        });

        return {
            'method': function(value) {
                viz.id(value == group ? group : [group, value]);
                viz.depth(value == group ? 0 : 1);
                viz.draw();
            },
            'type': array.length > 3 ? 'drop' : '',
            'label': dictionary['depth'],
            'value': array
        };
    };

    var sizeSelectorBuilder = function() {
        var options = [];
        sizes.forEach(function(item) {
            options.push({[dictionary[item]]: item});
        });
        return {
            'method' : 'size',
            'type': options.length > 3 ? 'drop' : '',
            'label': dictionary['value'],
            'value' : options
        };
    };

    var uiBuilder = function() {
        ui = [];
        if (depths.length)
            ui.push(depthSelectorBuilder());
        if (sizes.length)
            ui.push(sizeSelectorBuilder());
        return ui;
    }

    var titleBuilder = function() {
        return {
            'value': 'Title',
            'font': {'size': 22, 'align': 'left'},
            'sub': {'font': {'align': 'left'}, 'value': 'Subtitle'},
            'total': {'font': {'align': 'left'}, 'value': true}
        }
    };

    var tooltipBuilder = function() {
        return {
            'short': {
                '': DICT[dataset]['item_id'][squares],
                [dictionary['basic_values']]: [size]
            },
            'long': {
                '': ['item_id'],
                [dictionary['basic_values']]: basicValues.concat(Object.keys(calcBasicValues))
            }
        }
    };

    var viz = d3plus.viz()
        .container('#tree_map')
        .data(data)
        .type('tree_map')
        .size(size)
        .labels({'align': 'left', 'valign': 'top'})
        .background('transparent')
        .time('year')
        .icon(group == 'state' ? {'value': 'icon'} : {'value': 'icon', 'style': 'knockout'})
        .legend({'filters': true, 'order': {'sort': 'desc', 'value': 'size'}})
        .footer(dictionary['data_provided_by'] + ' ' + dataset.toUpperCase())
        .messages({'branding': true, 'style': 'large' })
        .title(titleBuilder())
        .id(group ? [group, squares] : squares)
        .depth(1)
        .tooltip(tooltipBuilder())
        .format(formatHelper())
        .ui(uiBuilder());

    if (group)
        viz.color({'scale':'category20', 'value': group});

    viz.draw();

    toolsBuilder(viz, data, titleBuilder().value, uiBuilder());
};

var loading = dataviva.ui.loading('.loading').text(dictionary['loading'] + '...');

var getUrls = function() {
    var dimensions = [dataset, 'year', squares];
    if (group && depths.length && depths.indexOf(group) == -1 || !depths.length)
        dimensions.push(group);
    depths.forEach(function(depth) {
        if (depth != squares)
            dimensions.push(depth);
    });

    var urls = ['http://api.staging.dataviva.info/' + dimensions.join('/') + '?' + filters,
        'http://api.staging.dataviva.info/metadata/' + squares
    ];

    if (group)
        urls.push('http://api.staging.dataviva.info/metadata/' + group);
    return urls;
};

var squaresMetadata = [],
    groupMetadata = [];

$(document).ready(function() {
    ajaxQueue(
        getUrls(), 
        function(responses) {
            var data = responses[0];
            squaresMetadata = responses[1];
            if (group)
                groupMetadata = responses[2];

            data = buildData(data, squaresMetadata, groupMetadata);

            loading.hide();
            loadViz(data);
        }
    );
});
