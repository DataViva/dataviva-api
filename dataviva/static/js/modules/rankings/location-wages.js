var headers = {
    0: "year",
    1: "wage",
    2: "num_emp",
    3: "num_jobs",
    4: "num_est",
    5: "wage_avg",
    6: "age_avg",
    7: "wage_growth",
    8: "wage_growth_5",
    9: "num_emp_growth",
    10: "num_emp_growth_5",
    11: "bra_id",
    12: "cnae_diversity",
    13: "cnae_diversity_eff",
    14: "cbo_diversity",
    15: "cbo_diversity_eff",
    16: "hist",
    17: "gini"
}

var LocationWages = function () {
    this.tableId = '#location-wages-table';

    this.table = $(this.tableId).DataTable({
        "dom": '<"rankings-control">frtip',
        "sAjaxSource": "/rais/all/show.9/all/all/?order=num_jobs.desc",
        "sAjaxDataProp": "data",
        "order": [],
        "columns": [
            {data: 0},
            {
                render: function (data, type, row, meta){
                    if (dataviva.bra[row[11]].id_ibge === false){
                        return '-'
                    }
                    else {
                        return dataviva.bra[row[11]].id_ibge
                    }
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.bra[row[11]].name.truncate(35);
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[3], {"key": headers[3]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[1], {"key": headers[1]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[4], {"key": headers[4]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[5], {"key": headers[5]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[9], {"key": headers[9]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[10], {"key": headers[10]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[7], {"key": headers[7]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[8], {"key": headers[8]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[12], {"key": headers[12]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[13], {"key": headers[13]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[14], {"key": headers[14]});
                }
            },
            {
                render: function (data, type, row, meta){
                    return dataviva.format.number(row[15], {"key": headers[15]});
                }
            }
        ],
        "deferRender": true,
        "language": dataviva.datatables.language,
        "scrollY": 500,
        "scrollX": true,
        "scrollCollapse": true,
        "scroller": true,
        initComplete: function () {
            var select = $("<select></select>").attr("id", 'year-selector').addClass("year-selector form-control"),
                buttons = $("<div></div>").addClass("btn-group");

            var bra_1 = dataviva.dictionary['bra_1'],
                bra_3 = dataviva.dictionary['bra_3'],
                bra_5 = dataviva.dictionary['bra_5'],
                bra_7 = dataviva.dictionary['bra_7'],
                bra_9 = dataviva.dictionary['bra_9'],
                year = dataviva.dictionary['year'];

            select.append($('<option value="">'+year+'</option>'));
            buttons.append($("<button>"+bra_1+"</button>").attr("id", 'location-wages-regions').addClass("btn btn-white"));
            buttons.append($("<button>"+bra_3+"</button>").attr("id", 'location-wages-states').addClass("btn btn-white"));
            buttons.append($("<button>"+bra_5+"</button>").attr("id", 'location-wages-mesoregions').addClass("btn btn-white"));
            buttons.append($("<button>"+bra_7+"</button>").attr("id", 'location-wages-microregions').addClass("btn btn-white"));
            buttons.append($("<button>"+bra_9+"</button>").attr("id", 'location-wages-municipalities').addClass("btn btn-white"));

            $('.rankings-content .rankings-control').append(buttons);
            $('.rankings-content .rankings-control').append(select);

            locationWages.table
                .column( 0 )
                .cache( 'search' )
                .sort()
                .unique()
                .each( function ( d ) {
                    select.append( $('<option value="'+d+'">'+d+'</option>') );
                } );

            select.on( 'change', function () {
               locationWages.table
                    .column( 0 )
                    .search( $(this).val() )
                    .draw();
            });

            $('#location-wages-table_filter input').removeClass('input-sm');
            $('#location-wages-table_filter').addClass('pull-right');
            $('#location-wages-municipalities').addClass('active');

            $('#location-wages-regions').click(function() {
                locationWages.table.ajax.url("/rais/all/show.1/all/all/?order=num_jobs.desc").load();
                $(this).addClass('active').siblings().removeClass('active');
            });

            $('#location-wages-states').click(function() {
                locationWages.table.ajax.url("/rais/all/show.3/all/all/?order=num_jobs.desc").load();
                $(this).addClass('active').siblings().removeClass('active');
            });

            $('#location-wages-mesoregions').click(function() {
                locationWages.table.ajax.url("/rais/all/show.5/all/all/?order=num_jobs.desc").load();
                $(this).addClass('active').siblings().removeClass('active');
            });

            $('#location-wages-microregions').click(function() {
                locationWages.table.ajax.url("/rais/all/show.7/all/all/?order=num_jobs.desc").load();
                $(this).addClass('active').siblings().removeClass('active');
            });

            $('#location-wages-municipalities').click(function() {
                locationWages.table.ajax.url("/rais/all/show.9/all/all/?order=num_jobs.desc").load();
                $(this).addClass('active').siblings().removeClass('active');
            });

            var lastYear = $('#year-selector option').last().val();
            $('#year-selector').val(lastYear);
            locationWages.table
                    .column( 0 )
                    .search(lastYear)
                    .draw();
        }
    });
};

$(document).ready(function() {
    dataviva.requireAttrs(['bra'], function() {
        window.locationWages = new LocationWages();
    });
});
