$(document).ready(function() {
    var selectedCity = null;
    var selectedLatitude = null;
    var selectedLongitude =  null;

    $.ajax({
        type: 'GET',
        url: 'https://api.staging.clustertruck.com/api/kitchens/',
        success: function(cluster) {
            // $.each(cluster, function(i, cluster){
            //     console.log(cluster.location.lat, cluster.location.lng);
            // });

            console.log(cluster);

            $('.citySelection').on('click', function() {
                var cityId = $(this).attr('id');
                var cityElement = $(this).attr('data-id-number');
                selectedCity = $('#'+cityId).html();
                selectedLatitude = cluster[cityElement].location.lat;
                selectedLongitude = cluster[cityElement].location.lng;

                console.log(selectedCity, selectedLatitude, selectedLongitude);
            }) 

            $('.daySelection').on('click', function() {
                var dayId = $(this).attr('id');
                var content = $('#'+dayId).html();
                $('.selectedDayDate').html(content);
            })

        }
    });   
});