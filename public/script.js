jQuery(document).ready(function($){
    $('.clickable-row').click(function () {
        window.location = $(this).data('href');
    });

    var searchBox = $('#searchBox');

    $('#searchButton').click(function () {
        $('#searchForm').submit(function (event) {
            sessionStorage.setItem('prev', searchBox.val());
        });
    });

    if (searchBox.val() != null) {
        searchBox.attr('value', sessionStorage.getItem('prev'));
    }

    let tradeFilter = $('#tradeFilter');
    tradeFilter.submit(function (event) {
        console.log($('#filterShoeSize').val());
    });
});
