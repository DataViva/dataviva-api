var lang = document.documentElement.lang;

var DICT = {
    'secex': {
        'item_id': {
            'municipality': 'ibge_id',
            'product': 'hs_id',
            'country': 'wld_id'
        },
        'kg': {
            'export': 'export_kg',
            'import': 'import_kg'
        },
        'value': {
            'export': 'exports',
            'import': 'imports'
        },
        'value_per_kg': {
            'export': 'export_val_kg',
            'import': 'import_val_kg'
        }
    },
    'rais': {
        'item_id': {
            'industry_class': 'cnae_id',
            'municipality': 'ibge_id',
            'occupation_family': 'cbo_id'
        },
        'jobs': 'total_jobs'
    }
};

var DEPTHS = {
    'secex': {
        'municipality': ['region', 'state', 'mesoregion', 'microregion', 'municipality'],
        'product': ['product_section', 'product'],
        'country': ['continent', 'country'],
        'port': ['port']
    },
    'rais': {
        'industry_class': ['industry_section', 'industry_division', 'industry_class'],
        'municipality': ['state', 'mesoregion', 'microregion', 'municipality'],
        'occupation_family': ['occupation_group', 'occupation_family']
    }
};

var SIZES = {
    'secex': {
        'municipality': ['value', 'kg'],
        'product': ['value', 'kg'],
        'country': ['value', 'kg'],
        'port': ['value', 'kg']
    },
    'rais': {
        'industry_class': ['jobs', 'wage', 'establishment_count'],
        'municipality': ['jobs', 'wage', 'establishment_count'],
        'occupation_family': ['jobs', 'wage']
    }
};

var BASIC_VALUES = {
    'secex': ['value', 'kg'],
    'rais': ['jobs', 'wage', 'average_wage', 'establishment_count', 'average_establishment_size']
};

if (document.getElementById('rings'))
    BASIC_VALUES['secex'] = ['exports_value', 'exports_weight', 'imports_value', 'imports_weight']

var CALC_BASIC_VALUES = {
    'secex': {
        'exports_per_weight': function(dataItem) {
            return getUrlArgs()['type'] == 'export' ? dataItem['value'] / dataItem['kg'] : undefined;
        },
        'imports_per_weight': function(dataItem) {
            return getUrlArgs()['type'] == 'import' ? dataItem['value'] / dataItem['kg'] : undefined;
        }
    },
    'rais': {}
};

var HAS_ICONS = ['continent', 'industry_section', 'product_section', 'occupation_group'];

// Temporarily translates text until dictionary is updated
dictionary['state'] = lang == 'en' ? 'State' : 'Estado';
dictionary['states'] = lang == 'en' ? 'States' : 'Estados';
dictionary['municipality'] = lang == 'en' ? 'Municipality' : 'Município';
dictionary['municipalities'] = lang == 'en' ? 'Municipalities' : 'Municípios';
dictionary['product_section'] = lang == 'en' ? 'Section' : 'Seção';
dictionary['product'] = lang == 'en' ? 'Product' : 'Produto';
dictionary['data_provided_by'] = lang == 'en' ? 'Data provided by' : 'Dados fornecidos por';
dictionary['by'] = lang == 'en' ? 'by' : 'por';
dictionary['that trade'] = lang == 'en' ? 'that trade' : 'que comercializam';
dictionary['of'] = lang == 'en' ? 'of' : 'de';
dictionary['port'] = lang == 'en' ? 'Port' : 'Porto';
dictionary['country'] = lang == 'en' ? 'Country' : 'País';
dictionary['countries'] = lang == 'en' ? 'Countries' : 'Países';
dictionary['continent'] = lang == 'en' ? 'Continent' : 'Continente';
dictionary['continents'] = lang == 'en' ? 'Continents' : 'Continentes';
dictionary['mesoregion'] = lang == 'en' ? 'Mesoregion' : 'Mesorregião';
dictionary['mesoregions'] = lang == 'en' ? 'Mesoregions' : 'Mesorregiões';
dictionary['microregion'] = lang == 'en' ? 'Microregion' : 'Microrregião';
dictionary['microregions'] = lang == 'en' ? 'Microregions' : 'Microrregiões';
dictionary['region'] = lang == 'en' ? 'Region' : 'Região';
dictionary['regions'] = lang == 'en' ? 'Regions' : 'Regiões';
dictionary['basic_values'] = lang == 'en' ? 'Basic Values' : 'Valores Básicos';
dictionary['market_share'] = lang == 'en' ? 'Market Share' : 'Participação de Mercado';
dictionary['item_id'] = 'ID';
dictionary['ibge_id'] = lang == 'en' ? 'IBGE ID' : 'ID IBGE';
dictionary['per'] = lang == 'en' ? 'per' : 'por';
dictionary['exports_value'] = lang == 'en' ? 'Export Value' : 'Valor das Exportações';
dictionary['imports_value'] = lang == 'en' ? 'Import Value' : 'Valor das Importações';
dictionary['exports_weight'] = lang == 'en' ? 'Export Weight' : 'Peso das Exportações';
dictionary['imports_weight'] = lang == 'en' ? 'Import Weight' : 'Peso das Importações';
dictionary['imports_per_weight'] = lang == 'en' ? 'Imports per kg' : 'Importações por peso';
dictionary['exports_per_weight'] = lang == 'en' ? 'Exports per kg' : 'Exportações por peso';
dictionary['industry_section'] = lang == 'en' ? 'Section' : 'Seção';
dictionary['industry_division'] = lang == 'en' ? 'Division' : 'Divisão';
dictionary['establishment_count'] = lang == 'en' ? 'Total Establishments' : 'Total de Estabelecimentos';
dictionary['wage'] = lang == 'en' ? 'Total Monthly Wages' : 'Renda Mensal Total';
dictionary['average_wage'] = lang == 'en' ? 'Average Monthly Wages' : 'Renda Mensal Média';
dictionary['industry_class'] = lang == 'en' ? 'Class' : 'Classe';
dictionary['total_jobs'] = lang == 'en' ? 'Total Jobs' : 'Total de Empregos';
dictionary['average_establishment_size'] = lang == 'en' ? 'Jobs per Establishment' : 'Empregos por Estabelecimento';
dictionary['occupation_family'] = lang == 'en' ? 'Family' : 'Família';
dictionary['occupation_group'] = lang == 'en' ? 'Main Group' : 'Grande Grupo';
dictionary['Creating URL'] = lang == 'en' ? 'Creating URL' : 'Criando URL';
dictionary['kg'] = 'KG';

var PLURAL = {
    'municipality': dictionary['municipalities'],
    'state': dictionary['states'],
    'microregion': dictionary['microregions'],
    'mesoregion': dictionary['mesoregions'],
    'region': dictionary['regions'],
    'country': dictionary['countries'],
    'product': dictionary['products'],
    'industry_class': dictionary['industries'],
    'industry_section': dictionary['industries'],
    'industry_division': dictionary['industries'],
    'industry_division': dictionary['industries'],
    'occupation_group': dictionary['occupations'],
    'occupation_family': dictionary['occupations']
};

var titleBuilder = function(shapes, dataset, filters, yearRange) {
    var title = baseTitle,
        subtitle = baseSubtitle;

    var formatYearRange = function() {
        if (yearRange[0] && yearRange[1])
            return '(' + yearRange[0] + '-' + yearRange[1] + ')';
        if (yearRange[1])
            return '(' + yearRange[1] + ')';
    };

    if (yearRange[0] || yearRange[1])
        title += ' ' + formatYearRange();

    title = title.replace('<shapes>', PLURAL[shapes]);
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {'title': title, 'subtitle': subtitle};
};

var getUrlArgs = function() {
    var args = {};
    if (window.location.search) {
        window.location.search.split('?')[1].split('&').forEach(function(arg) {
            args[arg.split('=')[0]] = arg.split('=')[1];
        });
    }
    return args;
};

var formatHelper = function() {
    var args = getUrlArgs();

    return {
        'text': function(text, key) {
            switch (text) {
                case 'item_id':
                    return dictionary[DICT[dataset][text][squares]] || dictionary[text];
                case 'value':
                case 'kg':
                case 'value_per_kg':
                    return dictionary[DICT[dataset][text][args['type']]];
                case 'jobs':
                    return dictionary[DICT[dataset][text]];
                case 'primary connections':
                    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
                default:
                    return dictionary[text] || text;
            };

        },
        'number': function(value, opts) {
            var result;

            if (value.toString().split('.')[0].length > 3) {

                var symbol = d3.formatPrefix(value).symbol;
                symbol = symbol.replace('G', 'B');

                value = d3.formatPrefix(value).scale(value);
                value = parseFloat(d3.format('.3g')(value));

                if (symbol && lang === 'pt') {
                    var digit = parseFloat(value.toString().split('.')[0]);
                    switch (symbol) {
                        case 'T':
                            symbol = digit < 2 ? ' Trilh\u00e3o' : ' Trilh\u00f5es';
                            break;
                        case 'B':
                            symbol = digit < 2 ? ' Bilh\u00e3o' : ' Bilh\u00f5es';
                            break;
                        case 'M':
                            symbol = digit < 2 ? ' Milh\u00e3o' : ' Milh\u00f5es';
                            break;
                        case 'k':
                            symbol = ' Mil';
                    }
                }

                result = value + symbol;
            }

            if (!result) {
                result = d3.round(value, 3);
            }

            if (result > 0 && result < 1) {
                result = d3.round(result, 3);
            }

            switch (opts.key) {
                case 'share':
                    result = d3.round(value, 1) + '%';
                    break;
                case 'value':
                case 'imports_per_weight':
                case 'exports_per_weight':
                    result = '$' + result + ' USD';
                    break;
                case 'kg':
                    result += ' kg';
                    break;
                case 'average_wage':
                case 'wage':
                    result = '$' + result + ' BRL';
                    break;
                case 'jobs_per_establishments':
                    result = d3.round(value, 0)
                    break;
            };

            if (result && lang == 'pt') {
                var n = result.toString().split('.')
                n[0] = n[0].replace(',', '.')
                result = n.join(',')
            }

            return result || value;
        }
    }
};
