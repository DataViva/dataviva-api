var unique = function(item, i, arr){
    return arr.indexOf(item) == i;
}

var stacked = document.getElementById('stacked'),
    dataset = stacked.getAttribute('dataset'),
    filters = stacked.getAttribute('filters'),
    area = stacked.getAttribute('area'),
    args = getUrlArgs(),
    values = stacked.getAttribute('values').split(' '),
    type = stacked.getAttribute('type').split(' '),
    lang = document.documentElement.lang;
    basicValues = BASIC_VALUES[dataset],
    calcBasicValues = CALC_BASIC_VALUES[dataset],
    yearRange = args.hasOwnProperty('year') ? [0, +args['year']] : [0, 0],
    metadata = {},
    currentFilters = {},
    currentTitleAttrs = {'size': values[0]}
    baseTitle = stacked.getAttribute('graph-title'),
    baseSubtitle = stacked.getAttribute('graph-subtitle'),
    stackedFilters = args['filters'] ? args['filters'].split('+') : [],
    attentionLevelFilter = false;

if(stackedFilters.indexOf('attention_level') != -1) {
    var i = stackedFilters.indexOf('attention_level');
    stackedFilters.splice(i, 1);
    attentionLevelFilter = true;
}

// We can have many aggretation options. e.g:
// ?depths=region+municipality
//    depthList = [[region, municipality]]
// ?depths=region+municipality,mesoregion+state
//    depthList = [[region, municipality], [mesoregionstate]]
// This will create a form to select the aggregation.

var depthsList = [];

if(args['depths'] != undefined) {
    depthsList = args['depths'].split(',').map(function(item){
        return item.split('+');
    });
}
else {
    depthsList = DEPTHS[dataset][area] || [area];
}

var depths = depthsList[0],
    group = depths[0],
    allDepths = depthsList.reduce(function(item, arr){ return arr.concat(item)}, []).filter(unique),
    dimensions = [].concat(allDepths, stackedFilters, [area]).filter(unique);

if(attentionLevelFilter){
    dimensions.push('ambulatory_attention', 'hospital_attention');
}

var buildData = function(apiData) {
    
    var getAttrByName = function(item, attr) {
        var index = headers.indexOf(attr);
        return item[index];
    }

    var data = [];
    var headers = apiData.headers;

    apiData.data.forEach(function(item) {
        try {
            var dataItem = {};

            headers.forEach(function(header){
                dataItem[header] = getAttrByName(item, header);
                if (['wage', 'average_wage'].indexOf(header) >= 0)
                    dataItem[header] = +dataItem[header]
            });


            if (ID_LABELS.hasOwnProperty(area))
                dataItem[dictionary[ID_LABELS[area]]] = dataItem[area];
            else
                dataItem['id'] = dataItem[area];

            if (COLORS.hasOwnProperty(group))
                dataItem['color'] = COLORS[group][dataItem[group]];

            for (key in calcBasicValues) {
                dataItem[key] = calcBasicValues[key](dataItem);   
            }
            
            if (HAS_ICONS.indexOf(group) >= 0)
                dataItem['icon'] = '/static/img/icons/' + group + '/' + group + '_' + dataItem[group] + '.png';

            dimensions.forEach(function(dimension) {
                dataItem[dimension] = metadata[dimension][dataItem[dimension]]['name_' + lang];
            });
            
            if (dataItem.microregion){
                dataItem.microregion = dataItem.microregion + ' ';
            } else if (dataItem.state){
                dataItem.state = ' ' + dataItem.state;
            }
            if (dataItem.month){
                dataItem.month = dataItem.year + "/" + dataItem.month + "/01";
            }

            data.push(dataItem);
        } catch(e) {
        };
    });

    return data;
}

var loadViz = function (data){
    var tooltipBuilder = function() {
        return {
            'short': {
                '': ID_LABELS.hasOwnProperty(area) ? dictionary[ID_LABELS[area]] : 'id',
                [dictionary['basic_values']]: [values[0]]
            },
            'long': {
                '': ID_LABELS.hasOwnProperty(area) ? dictionary[ID_LABELS[area]] : 'id',
                [dictionary['basic_values']]: basicValues.concat(Object.keys(calcBasicValues))
            }
        }
    };

    var uiBuilder = function() {
        ui = [];
        var config = {
            'id': 'id',
            'text': 'label',
            'font': {'size': 11},
            'container': d3.select('#controls'),
            'search': false
        };

        ui.push( {
            "label": "Layout",
            "type" : "drop",
            "value" : [
                {
                    [dictionary['value']]: "linear"
                }, 
                {
                    [dictionary['market-share']]: "share"
                }
            ],
            "method" : function(value, viz){
                viz.y({
                    "scale": value
                })
                .draw();
            }
        });

        ui.push({
            "label": dictionary['sort'],
            "type": "drop",
            "value": [
                {
                    [dictionary['desc']] : "desc"
                },
                {
                    [dictionary['asc']] : "asc"
                }
            ],
            "method": function(value, viz){
                viz.order({
                    "sort": value
                }).draw();
            }
        });

        ui.push({
            "label": dictionary['Order'],
            "type": "drop",
            "value": [
                {
                    [dictionary['value']] : "value"
                },
                {
                    [dictionary['name']] : "name"
                }
            ],
            "method": function(value, viz){

                if (value == "value"){
                    value = viz.y();
                }
                else {
                    value = viz.id();
                }

                viz.order({
                    "value": value
                }).draw();
            }
        });

        if (dataset == 'secex'){
            ui.push({
                "label": dictionary['time-resolution'],
                "value": [
                    {
                        [dictionary['year']]: "year"
                    },
                    {
                        [dictionary['month']]: "month"
                    }
                ],
                "method": function(value, viz){
                    viz.x({
                            "value": value,
                            "label": value
                    });
                    viz.time({
                        "value": value
                    }).draw();
                }
            });
        }

        if (dataset == 'rais'){
            var axis_values = [];

            for (var i = 0, len = values.length; i < len; i++) {
              axis_values.push({[dictionary[values[i]]] : values[i]})
            }

            ui.push({
                "label": dictionary['y-axis'],
                "type": "drop",
                "value": axis_values,
                "method": function(value, viz){

                    viz.y({
                        "value": value,
                        "label": yAxisLabelBuilder(value)
                    });

                    viz.order({
                        "value": value
                    }).draw();
                }
            });
        }

        if (values.length > 1) {
            d3plus.form()
                .config(config)
                .container(d3.select('#controls'))
                .data(values.map(function(value){
                    return {
                        id: value,
                        label: dictionary[value]
                    };
                }))
                .title(dictionary['value'])
                .type('drop')
                .font({'size': 11})
                .focus(-1, function(value) {
                    currentTitleAttrs['value'] = value;
                    viz.y(value)
                        .title({'total': {'prefix': dictionary[value] + ': '}})
                        .title(titleHelper())
                        .draw();
                })
                .draw();
        }

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

        stackedFilters.forEach(function(filter, j) {
            currentFilters[filter] = -1;
            var options = [];
            for (id in metadata[filter]) {
                options.push({'id': metadata[filter][id]['name_' + lang], 'label': metadata[filter][id]['name_' + lang]})
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

        if (depthsList.length > 1) {
            var options = depthsList.map(function(list, i){
                return {
                    label: dictionary[list[0]],
                    id: i
                };
            })

            d3plus.form()
                .config(config)
                .container(d3.select('#controls'))
                .data(options)
                .title(dictionary['drawer_group'])
                .type('drop')
                .font({'size': 11})
                .focus(-1, function(value) {
                    viz.id(depthsList[value])
                       .color(depthsList[value][0])
                       .draw();
                })
                .draw();
        }

        // Custom filter to Attention Level
        // To use, add: filters=attention_level
        if(attentionLevelFilter) {

            currentFilters['ambulatory_attention'] = -1;
            currentFilters['hospital_attention'] = -1;

            var filterValues = [
                [-1, -1], // Todos
                [metadata['ambulatory_attention'][0]['name_' + lang], metadata['hospital_attention'][0]['name_' + lang]],   // Nenhum
                [metadata['ambulatory_attention'][0]['name_' + lang], metadata['hospital_attention'][1]['name_' + lang]],   // Hospitalar
                [metadata['ambulatory_attention'][1]['name_' + lang], metadata['hospital_attention'][0]['name_' + lang]],   // Ambulatorial
                [metadata['ambulatory_attention'][1]['name_' + lang], metadata['hospital_attention'][1]['name_' + lang]]    // Ambulatorial/Hospitalar
            ];

            var menuOptions = [
                {
                    id: 0,
                    label: dictionary['all']
                },
                {
                    id: 1,
                    label: dictionary['none']
                },
                {
                    id: 2,
                    label: dictionary['hospital']
                },
                {
                    id: 3,
                    label: dictionary['ambulatory']
                },
                {
                    id: 4,
                    label: dictionary['ambulatory/hospital']
                },
            ];

            d3plus.form()
                .config(config)
                .container(d3.select('#controls'))
                .data(menuOptions)
                .title('Nível de Atenção')
                .type('drop')
                .font({'size': 11})
                .focus(-1, function(pos) {
                    viz.data(filteredData('ambulatory_attention', filterValues[pos][0]))
                    viz.data(filteredData('hospital_attention', filterValues[pos][1]))
                    viz.draw();
                })
                .draw();
        }

        return ui;
    }


    var titleHelper = function() {
        var header = titleBuilder(baseTitle, baseSubtitle, currentTitleAttrs, dataset, getUrlArgs(), yearRange);

        return {
            'value': header['title'],
            'font': {'size': 22, 'align': 'left'},
            'padding': 5,
            'sub': {'font': {'align': 'left'}, 'value': header['subtitle']},
            'width': window.innerWidth - d3.select('#tools').node().offsetWidth - 20
        };
    };


    var yAxisLabelBuilder = function (type) {
        if (type == 'export')
        {
            (value = 'value_per_kg') ? dictionary['exports_weight'] : dictionary['exports'];  
        }   
        if (type == 'import') 
        {
            (value = 'value_per_kg') ? dictionary['imports_weight'] : dictionary['imports']; 
        } 
        if (type == 'balance') 
        {
            return dictionary['trade_value']
        } 
        if (type == 'jobs')
        { 
            return dictionary['total_jobs']
        } 
        if (type == 'wage')
        {
            return dictionary['wage']
        }
        if (type == 'establishment_count')
        {
            return dictionary['establishment_count']
        }

    }
    
    data_type = { "value": values[0], "label": (type == "" ? yAxisLabelBuilder(values[0]) : yAxisLabelBuilder(type))}

    var viz = d3plus.viz()
        .title({"value": "Inserir título", "font": {"family": "Times", "size": "24","align": "left"}})
        .axes({"background": {"color": "white"}})
        .container("#stacked")
        .type("stacked")
        .data(data)
        .y(data_type)  
        .x({"value": "year", "label": ""})
        .time({'value': 'year'})
        .background("transparent")
        .shape({"interpolate": "monotone"})
        .tooltip(tooltipBuilder())
        .messages({'branding': true, 'style': 'large'})
        .ui(uiBuilder())
        .icon(group == 'state' ? {'value': 'icon'} : {'value': 'icon', 'style': 'knockout'})
        .footer(dictionary['data_provided_by'] + ' ' + (dictionary[dataset] || dataset).toUpperCase())
        .format(formatHelper())
        .legend({'filters': true})
        .depth(0, function(d) {
            currentTitleAttrs['shapes'] = depths[d];
            viz.title(titleHelper());
        })

        if (COLORS.hasOwnProperty(group)) {
            viz.attrs(COLORS[group]);
            viz.color('color');
        } else {
            viz.color({'scale':'category20', 'value': args['color'] || depths[0] || area});
        }

        if (depths[0] == '') {
            viz.id({'value': area})
            currentTitleAttrs['shapes'] = area;
        } else {
            viz.id(depths);
            currentTitleAttrs['shapes'] = depths[0];
        }

        viz.title(titleHelper())
            .title({'total': {'prefix': dictionary[values[0]] + ': '}})
            .title({'total': {'font': {'align': 'left'}}})

        $('#stacked').css('height', (window.innerHeight - $('#controls').height() - 40) + 'px');

        viz.draw();
        toolsBuilder(stacked.id, viz, data, titleHelper().value);
}

var getUrls = function() {
    var urls = [
        'http://api.staging.dataviva.info/' + [dataset, (dataset == 'secex' ? 'month/year' : 'year')].concat(dimensions).join('/') + '?' + filters
    ];

    dimensions.forEach(function(dimension) {
        urls.push('http://api.staging.dataviva.info/metadata/' + dimension);
    });
    
    return urls;
};

var loading = dataviva.ui.loading('.loading').text(dictionary['Building Visualization'] + '...');

$(document).ready(function() {
    ajaxQueue(
        getUrls(), 
        function(responses) {
            var data = responses.shift();

            dimensions.forEach(function(attr, i) {
                metadata[attr] = responses[i];
            });

            data = buildData(data);

            loadViz(data);

            loading.hide();
            d3.select('#mask').remove();
        }
    );
});
