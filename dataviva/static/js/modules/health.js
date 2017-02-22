$(document).ready(function(){
    var filters = location.search.slice(1);

    if(filters.split('=').indexOf('municipality') == -1){
        // BlueBox.add({
        //     url: 'http://api.staging.dataviva.info/cnes_bed/municipality/?order=beds&direction=desc&limit=1&' + filters,
        //     title: 'Município com Maior',
        //     subtitle: 'Número de Leitos',
        //     label: {
        //         metadata: true,
        //         value: 'municipality'
        //     },
        //     value: 'beds',
        //     suffix: 'Leitos',
        //     tab: 'beds'
        // });

    }

    // ESTABLISHMENTS

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_establishment/year/?year=2015&" + filters,
        title: 'Total de Estabelecimentos',
        label: 'Total de Estabelecimentos',
        value: 'establishments',
        tab: 'establishments'
    });

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_establishment/municipality/?year=2015&order=establishments&direction=desc&limit=1&' + filters,
        title: 'Município com Maior',
        subtitle: 'Número de Estabelecimentos',
        label: {
            metadata: true,
            value: 'municipality'
        },
        value: 'establishments',
        suffix: 'Estabelecimentos',
        tab: 'establishments'
    });

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_establishment/establishment_type/?year=2015&" + filters,
        title: 'Principal Tipo Estabelecimento',
        subtitle: 'por Quantidade',
        label: {
            metadata: true,
            value: 'establishment_type'
        },
        value: 'establishments',
        tab: 'establishments'
    });

    // BEDS

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_bed/municipality/?year=2015&order=beds&direction=desc&limit=1&' + filters,
        title: 'Município com Maior',
        subtitle: 'Número de Leitos',
        label: {
            metadata: true,
            value: 'municipality'
        },
        value: 'beds',
        suffix: 'Leitos',
        tab: 'beds'
    });

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_bed/year/bed_type/?year=2015&order=beds&direction=desc&limit=1&' + filters,
        title: 'Principal Tipo Leito',
        subtitle: 'por Quantidade',
        label: {
            metadata: true,
            value: 'bed_type'
        },
        value: 'beds',
        tab: 'beds'
    });

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_bed/year/?year=2015&" + filters,
        title: 'Total de Leitos',
        label: 'Total de Leitos',
        value: 'beds',
        tab: 'beds'
    });

    // PROFESSIONALS

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_professional/municipality/?year=2015&order=professionals&direction=desc&limit=1&' + filters,
        title: 'Município com Maior',
        subtitle: 'Número de Profissionais',
        label: {
            metadata: true,
            value: 'municipality'
        },
        value: 'professionals',
        suffix: 'Profissionais',
        tab: 'professionals'
    });

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_professional/year/occupation_family/?year=2015&order=professionals&direction=desc&limit=1&' + filters,
        title: 'Principal Ocupação',
        subtitle: 'por Empregos',
        label: {
            metadata: true,
            value: 'occupation_family'
        },
        value: 'professionals',
        tab: 'professionals'
    });

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_professional/year/?year=2015&" + filters,
        title: 'Total de Profissionais',
        label: 'Total de Profissionais',
        value: 'professionals',
        tab: 'professionals'
    });

    // EQUIPMENTS

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_equipment/year/?year=2015&" + filters,
        title: 'Total de Equipamentos',
        label: 'Total de Equipamentos',
        value: 'equipments',
        tab: 'equipments'
    });

    BlueBox.add({
        url: 'http://api.staging.dataviva.info/cnes_equipment/municipality/?year=2015&order=equipments&direction=desc&limit=1&' + filters,
        title: 'Município com Maior',
        subtitle: 'Número de Equipamentos',
        label: {
            metadata: true,
            value: 'municipality'
        },
        value: 'equipments',
        suffix: 'Equipamentos',
        tab: 'equipments'
    });

    BlueBox.add({
        url: "http://api.staging.dataviva.info/cnes_equipment/equipment_type/?year=2015&" + filters,
        title: 'Principal Equipamento',
        subtitle: 'por Quantidade',
        label: {
            metadata: true,
            value: 'equipment_type'
        },
        value: 'equipments',
        suffix: 'Equipamentos',
        tab: 'equipments'
    });

    // Indicator.add({
    //     url: '/',
    //     title: 'Numero de Leitos',
    //     value:  'beds', 
    //     preffix: 'R$'
    // });
})

var buildData = function(responseApi){
    var getAttrByName = function(item, attr){
        var index = headers.indexOf(attr);
        return item[index];
    }

    var data = [];
    var headers = responseApi.headers;

    responseApi.data.forEach(function(item){
        var dataItem = {};

        headers.forEach(function(header){
            dataItem[header] = getAttrByName(item, header);
        });

        data.push(dataItem);
    });

    return data;
}

var getMetadata = function(key){
    return new Promise(function(resolve, reject) {
        if (localStorage.getItem(key)) {
            resolve(JSON.parse(localStorage.getItem(key)));
        }
        else {
            $.ajax({
                url: "http://api.staging.dataviva.info/metadata/" + key,
                success: function (data) {
                    localStorage.setItem(key, JSON.stringify(data));
                    resolve(JSON.parse(localStorage.getItem(key)));
                }
            });
        }
    });
}

var Indicator = (function(){
    var template = '' +
    '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' +
        '<div class="widget">' +
            '<h2 class="text-left text-uppercase">{{title}}</h2>' +
            '<div class="number">' +
                '{{preffix}} <strong class="counter">{{value}}</strong><br/>' +
                '<small class="magnitude">{{magnitude}}</small>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    var add = function(data){
        $.ajax({
            url: data.url,
            type: 'GET',
            success: function(response){
                var formattedValue = Magnitude(123456);
                var value = formattedValue.split(' ')[0].replace('.', ',');
                var magnitude = formattedValue.split(' ')[1] || '';
                
                var filledTemplate = template.replace('{{title}}', data.title || '')
                                    .replace('{{value}}', value)
                                    .replace('{{magnitude}}', magnitude)
                                    .replace('{{preffix}}', data.prefix || '' );

                $('#header .indices .row').append(filledTemplate);
            }
        });
    };

    return {
        add: add
    };
})();

var BlueBox = (function(){
    var template = '' +
    '<div class="col-xs-12 col-sm-6 col-md-4">' +
        '<div class="blue-box title">' +
            '{{title}}' +
            '<small>{{subtitle}}</small>' +
        '</div>' +
        '<div class="blue-box">' +
            '<p class="label">{{label}}</p>' +
            '<div class="number">' +
                '<strong class="counter">{{value}}</strong><span>{{magnitude}} {{suffix}}</span>' +
            '</div>' +
        '</div>' +
    '</div>';

    var add = function(data){

        var api;
        var metadata;

        $.when(
            $.ajax({
                url: data.url, 
                type: 'GET',    
                success: function(response){
                    api = buildData(response)[0];
                }           
            }),

            !data.label.metadata ? undefined : $.ajax({
                url: 'http://api.staging.dataviva.info/metadata/' + data.label.value, 
                type: 'GET',      
                success: function(response){                          
                    metadata = response;
                }           
            })
        ).then(function() {
            var label = data.label;
            if (typeof data.label == 'object')
                label = metadata[api[data.label.value]].name_pt;

            var formattedValue = Magnitude(api[data.value]);
            var value = formattedValue.split(' ')[0].replace('.', ',');
            var magnitude = formattedValue.split(' ')[1] || '';

            var filledTemplate = template.replace('{{title}}', data.title || '')
                                .replace('{{subtitle}}', data.subtitle || '')
                                .replace('{{label}}', label.toUpperCase() || '')
                                .replace('{{value}}', value)
                                .replace('{{magnitude}}', magnitude)
                                .replace('{{prefix}}', data.prefix || '' )
                                .replace('{{suffix}}', data.suffix || '');

            $('#' + data.tab + ' .row').append(filledTemplate);
        });       
    }

    return {
        add: add
    };
})();

var Magnitude = function(n){
    if (n < 1000)
        return n + '';
    if (n < 1000000)
        return (n/1000).toPrecision(3) + ' Mil';
    if (n < 1000000000)
        return n < 2000000 ? (n/1000000).toPrecision(3) + ' Milhão' : (n/1000000).toPrecision(3) + ' Milhões';
    if (n < 1000000000000)
        return n < 2000000000 ? (n/1000000000).toPrecision(3) + ' Bilhão' : (n/1000000000).toPrecision(3) + ' Bilhões';
    if (n < 1000000000000000)
        return n < 2000000000000 ? (n/1000000000000).toPrecision(3) + ' Trilhão' : (n/1000000000000).toPrecision(3) + ' Trilhões';
};
