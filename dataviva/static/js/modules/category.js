$(document).ready(function () {
    $('.tab-content a[data-toggle="tab"]').click(function() {
        $('.nav-tabs a[data-toggle="tab"]').parent().removeClass('active');
        $('.nav-tabs a[href="'+$(this).attr('href')+'"]').parent().addClass('active');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', Category.changeTab);

    $('.list-group.panel a[target]').on('click', Category.updateGraphUrl);

    Category.expandMenu();
    Category.updateClassSelected();
});

var Category = (function() {

    function getUrlBeforePageTab(){
        var url = window.location.href.split('?')[0];

        if(url.split('/').length == 6)
            return url;
        else{
            url = url.split('/');
            url.pop();
            url = url.join('/');
            return url;
        }
    }

    function updateUrl(tab){
        var url = getUrlBeforePageTab();
        var bra_id = getBraidFromUrl();

        if(tab != 'general')
            url += '/' + tab;
        
        if(bra_id)
            url += '?bra_id=' + bra_id;

        window.history.pushState('', '', url);
    }

    function updateGraphUrl(){
        var parent = $(this).data('parent').slice(1);
        var graphType = $(this).attr('href').split('/')[3];
        var menuOption = parent + '-' + graphType;

        var graphUrl = $(this).attr('href').split('/').slice(3).join('/');
        graphUrl = encodeURIComponent(graphUrl);

        url = window.location.href.split('?')[0] + '?menu=' + menuOption + '&url=' + graphUrl;

        var bra_id = getBraidFromUrl();
        
        if(bra_id)
            url += '&bra_id=' + bra_id;

        window.history.pushState('', '', url);
    }

    function getBraidFromUrl(){
        var params = window.location.href.split('?')[1];

        if(params){
            params = params.split(/=|&/);
            var bra_id_index = params.indexOf('bra_id');

            if(bra_id_index != -1)
                return params[bra_id_index + 1];
            else
                return null;
        }

    }

    function changeTab() {
        var location = this.dataset.location,
            tab = $(this).attr('aria-controls');

        updateUrl(tab);

        if ($(this).attr('graph') != null)
            showGraph(tab, location);
        else
            $('#graphs').hide();
    }

    function showGraph(tab, location) {
        var url = getUrlBeforePageTab() + "/graphs/" + tab;

        if(location)
            url += "?bra_id=" + location;


        if ($('#graphs #graphs-' + tab).length === 0) {
            $.ajax({
                method: "POST",
                url: url,
                success: function (graphs) {
                    $('#graphs').append(graphs);
                    $('.list-group.panel a[target]').on('click', Category.updateGraphUrl);
                    expandMenu();
                    updateClassSelected();
                }
            });
        }

        $('#graphs').show();
        $("#graphs").children().hide();
        $('#graphs #graphs-' + tab).show();
    }

    function expandMenu(){
        if($('#graphs .list-group.panel .selected').parent().hasClass('collapse'))
            $('#graphs .list-group.panel .selected').parent().attr('class', 'collapse in');
    }

    function updateClassSelected(){
        $('.category .nav-graph .list-group-item').on('click', function() {
            $(this).closest('nav').find('.selected').removeClass('selected');
            $(this).addClass('selected');
        });
    }

    return {
        changeTab : changeTab,
        updateGraphUrl : updateGraphUrl,
        expandMenu : expandMenu,
        updateClassSelected : updateClassSelected,
    }

})();


