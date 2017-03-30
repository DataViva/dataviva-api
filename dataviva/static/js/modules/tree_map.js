var tree_map = document.getElementById('tree_map'),
    dataset = tree_map.getAttribute('dataset'),
    squares = tree_map.getAttribute('squares'),
    size = tree_map.getAttribute('size'),
    apiFilters = tree_map.getAttribute('filters'),
    baseTitle = tree_map.getAttribute('graph-title'),
    baseSubtitle = tree_map.getAttribute('graph-subtitle');

var args = getUrlArgs(),
    yearRange = args.hasOwnProperty('year') ? [0, +args['year']] : [0, 0],
    depths = args.hasOwnProperty('depths') ? args['depths'].split('+') : DEPTHS[dataset][squares] || [squares],
    hierarchy = args.hasOwnProperty('hierarchy') && args['hierarchy'] == 'false' ? false : true;
    group = depths[0],
    sizes = args['sizes'] || SIZES[dataset][squares] || [size],
    filters = args.hasOwnProperty('filters') ? args['filters'].split('+') : [],
    basicValues = BASIC_VALUES[dataset] || [],
    calcBasicValues = CALC_BASIC_VALUES[dataset] || {},
    currentFilters = {};

var buildData = function(apiResponse, squaresMetadata, otherMetadata) {

    var getAttrByName = function(item, attr) {
        var index = headers.indexOf(attr);
        return item[index];
    };

    var data = [];
    var headers = apiResponse.headers;

    apiResponse.data.forEach(function(item) {
        try {
            var dataItem = {};

            headers.forEach(function(header) {
                dataItem[header] = getAttrByName(item, header);
                if (['wage', 'average_wage'].indexOf(header) >= 0)
                    dataItem[header] = +dataItem[header]
                
                if (COLORS[header]) {
                    dataItem['color'] = COLORS[header][dataItem[header]];
                }
            });

            if (group && HAS_ICONS.indexOf(group) >= 0)
                dataItem['icon'] = '/static/img/icons/' + group + '/' + group + '_' + dataItem[group] + '.png';
            
            if (DICT.hasOwnProperty(dataset) && DICT[dataset].hasOwnProperty('item_id') && DICT[dataset]['item_id'].hasOwnProperty(squares))
                dataItem[DICT[dataset]['item_id'][squares]] = dataItem[squares];
            else
                dataItem['id'] = dataItem[squares];

            for (key in calcBasicValues)
                dataItem[key] = calcBasicValues[key](dataItem);


            if (dataset.match(/^cnes_/)) {
                for (d in otherMetadata)
                    dataItem[d] = otherMetadata[d][dataItem[d]]['name_' + lang];
            } else if (depths.length > 1) {
                depths.forEach(function(depth) {
                    if (depth != squares)
                        dataItem[depth] = squaresMetadata[dataItem[squares]][depth]['name_' + lang];
                });      
            }
           
            dataItem[squares] = squaresMetadata[dataItem[squares]]['name_' + lang];
            data.push(dataItem);
        } catch(e) {

        };
    });

    return data;
}

var loadViz = function(data) {
    var uiBuilder = function() {
        var ui = [],
            config = {
                'id': 'id',
                'text': 'label',
                'font': {'size': 11},
                'container': d3.select('#controls'),
                'search': false
            };

        // Adds depth selector
        if (depths.length > 1) {
            var options = [];
            if (hierarchy) {
                depths.forEach(function(item) {
                    options.push({'id': item, 'label': dictionary[item]});
                });

                d3plus.form()
                    .config(config)
                    .data(options)
                    .title(dictionary['depth'])
                    .type(options.length > 3 ? 'drop' : 'toggle')
                    .focus(squares, function(value) {
                        viz.depth(depths.indexOf(value));
                        viz.title(titleHelper(value));
                        viz.draw();
                    })
                    .draw();
            } else {
                depths.forEach(function(item) {
                    if (item != squares)
                        options.push({'id': item, 'label': dictionary[item]});
                });

                d3plus.form()
                    .config(config)
                    .data(options)
                    .title(dictionary['drawer_color_by'])
                    .type(depths.length > 3 ? 'drop' : 'toggle')
                    .focus(options[0]['id'], function(value) {
                        viz.data(data);
                        viz.id([value, squares]);
                        viz.color(value);
                        viz.draw();
                    })
                    .draw();

                d3plus.form()
                    .config(config)
                    .data([{'id': 0, 'label': dictionary['yes']}, {'id': 1, 'label': dictionary['no']}])
                    .title(dictionary['drawer_group'])
                    .type('toggle')
                    .focus(1, function(value) {
                        viz.depth(value);
                        viz.draw();
                    })
                    .draw();
            }
        }

        // Adds size selector
        if (sizes.length > 1) {
            var options = [];
            sizes.forEach(function(item) {
                options.push({'id': item, 'label': dictionary[item]});
            });

            d3plus.form()
                .config(config)
                .data(options)
                .title(dictionary['sizing'])
                .type('toggle')
                .focus(size, function(value) {
                    viz.size(value);
                    viz.draw();
                })
                .draw();
        }

        // Adds year selector
        if (args['year']) {
            d3plus.form()
                .config(config)
                .data([{'id': 1, 'label': args['year']}, {'id': 0, 'label': dictionary['all']}])
                .title(dictionary['year'])
                .type('toggle')
                .focus(args['year'] ? 1 : 0, function(value) {
                     if (value) {
                        loadViz(data);
                    } else {
                        var loadingData = dataviva.ui.loading('#tree_map').text(dictionary['Downloading Additional Years'] + '...');
                        window.location.href = window.location.href.replace(/&year=[0-9]{4}/, '').replace(/\?year=[0-9]{4}/, '?');
                    }
                })
                .draw();
        }

        // Adds filters selector        
        var filteredData = function(filter, value) {
            currentFilters[filter] = value;
            return data.filter(function(item) {
                var valid = true,
                    keys = Object.keys(currentFilters);
                
                for (var i = 0; i < keys.length; i++) {
                    if (currentFilters[keys[i]] == -1)
                        continue;
                    if (item[keys[i]] != currentFilters[keys[i]]) {
                        valid = false;
                        break;
                    }
                }

                return valid;
            });
        };

        filters.forEach(function(filter, j) {
            currentFilters[filter] = -1;
            var options = [];
            for (id in otherMetadata[filter]) {
                options.push({'id': otherMetadata[filter][id]['name_' + lang], 'label': otherMetadata[filter][id]['name_' + lang]})
            }
            options.unshift({'id': -1, 'label': dictionary['all']});
            
            d3plus.form()
                .config(config)
                .container(d3.select('#controls'))
                .data(options)
                .title(dictionary[filter])
                .type('drop')
                .font({'size': 11})
                .focus(-1, function(value) {
                    viz.data(filteredData(filter, value));
                    viz.draw();
                })
                .draw();
        });

        return ui;
    }

    var titleHelper = function(depth) {
        if (!baseTitle)
            baseTitle = dictionary[size] + ' ' + dictionary['per'] + ' ' + dictionary[squares];
        var title = titleBuilder(depth, dataset, getUrlArgs(), yearRange);

        return {
            'value': title['title'],
            'font': {'size': 22, 'align': 'left'},
            'sub': {'font': {'align': 'left'}, 'value': title['subtitle']},
            'total': {'font': {'align': 'left'}, 'value': true}
        }
    };

    var hasIdLabel = function() {
        return DICT.hasOwnProperty(dataset) && DICT[dataset].hasOwnProperty('item_id') && DICT[dataset]['item_id'].hasOwnProperty(squares);
    }

    var tooltipBuilder = function() {
        return {
            'short': {
                '': hasIdLabel() ? DICT[dataset]['item_id'][squares] : 'id',
                [dictionary['basic_values']]: [size]
            },
            'long': {
                '': hasIdLabel() ? DICT[dataset]['item_id'][squares] : 'id',
                [dictionary['basic_values']]: basicValues.concat(Object.keys(calcBasicValues))
            }
        }
    };

    var timelineCallback = function(years) {
        if (!years.length)
            yearRange = [0, 0];
        else if (years.length == 1)
            yearRange = [0, years[0].getFullYear()];
        else
            yearRange = [years[0].getFullYear(), years[years.length - 1].getFullYear()]
        toolsBuilder(viz, data, titleHelper().value, uiBuilder());
        viz.title(titleHelper());
    };

    var viz = d3plus.viz()
        .container('#tree_map')
        .data({'value': data, 'padding': 0})
        .type('tree_map')
        .size(size)
        .labels({'align': 'left', 'valign': 'top'})
        .background('transparent')
        .time({'value': 'year', 'solo': {'callback': timelineCallback}})
        .icon(group == 'state' ? {'value': 'icon'} : {'value': 'icon', 'style': 'knockout'})
        .legend({'filters': true, 'order': {'sort': 'desc', 'value': 'size'}})
        .footer(dictionary['data_provided_by'] + ' ' + (dictionary[dataset] || dataset).toUpperCase())
        .messages({'branding': true, 'style': 'large'})
        .title(titleHelper(squares))
        .tooltip(tooltipBuilder())
        .format(formatHelper())
        .ui(uiBuilder());

    if (hierarchy) {
        viz.id(depths); 
        viz.depth(args['depth'] || depths.indexOf(squares));
        viz.zoom(false);
    } else {
        viz.id([args['depth'] || depths[0], squares]);
        viz.depth(1);
        viz.zoom(true);
    }

    viz.color({'scale':'category20', 'value': args['color'] || depths[0]});

    $('#tree_map').css('height', (window.innerHeight - $('#controls').height() - 40) + 'px');
    
    viz.draw();

    toolsBuilder(viz, data, titleHelper().value, uiBuilder());
};


var getUrls = function() {
    var dimensions = [dataset, 'year', squares];
    var metadata = [];
    
    depths.concat(filters).forEach(function(attr) {
        if (attr != squares && dimensions.indexOf(attr) == -1) {
            dimensions.push(attr);
            metadata.push(attr);
        }
    });

    var urls = [API_DOMAIN + '/' + dimensions.join('/') + '?' + apiFilters,
        API_DOMAIN + '/metadata/' + squares
    ];

    if (dataset.match(/^cnes_/)) {
        metadata.forEach(function(attr) {
            urls.push(API_DOMAIN + '/metadata/' + attr)
        });
    }

    return urls;
};

var squaresMetadata = [];

var loading = dataviva.ui.loading('.loading').text(dictionary['Building Visualization']);

$(document).ready(function() {
    ajaxQueue(
        getUrls(), 
        function(responses) {
            var data = responses[0];
            squaresMetadata = responses[1],
            otherMetadata = {};

            if (dataset.match(/^cnes_/)) {
                var offset = 0;
                depths.concat(filters).forEach(function(attr, i) {
                    if (attr != squares && !otherMetadata.hasOwnProperty(attr))
                        otherMetadata[attr] = responses[2+i-offset];
                    else
                        offset++;
                });
            }

            data = buildData(data, squaresMetadata, otherMetadata);

            loadViz(data);

            loading.hide();
            d3.select('#mask').remove();
        }
    );
});
