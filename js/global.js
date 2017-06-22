$(document).ready(function() {
    // Tried to use this to avoid Cross-origin resource sharing error
    // response.addHeader("Access-Control-Allow-Origin", "*");
    var selectedLatitude = null;
    var selectedLongitude =  null;
    var dayValue = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 3,
        "Sunday": 3
    };
    var weatherValue = {
        "clear-day": -2,
        "clear-night": -2,
        "partly-cloudy-day": 0,
        "partly-cloudy-night": 0,
        "cloudy": 1,
        "rain": 4,
        "sleet": 4,
        "snow": 5
    };
    var specialValue = null;
    var demandValue = dayValue + weatherValue + specialValue;

    var weekDays = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    }

    $.get("https://api.staging.clustertruck.com/api/kitchens/").done(function(cluster) {
        console.log(cluster);

        // get locational data from Kitchen API
        $('.citySelection').on('click', function() {
            var cityId = $(this).attr('id');
            var cityElement = $(this).attr('city-id-number');
            var selectedCity = $('#'+cityId).html();
            selectedLatitude = cluster[cityElement].location.lat;
            selectedLongitude = cluster[cityElement].location.lng;
            console.log(selectedCity, selectedLatitude, selectedLongitude);
        }) 

        // using Dark Sky API
        // get weather forecast
        $('.getReportButton').on('click', function(){ 
        // A solid work around for the access error, found at https://stackoverflow.com/questions/28104251/xmlhttprequest-cannot-load-no-access-control-allow-origin-header-is-present
            $.ajax({
                type: 'POST',
                url: "https://api.darksky.net/forecast/496761701d0d263e29a5dd53794ee3dc/"+selectedLatitude+","+selectedLongitude,
                dataType: 'jsonp',
                success: function (forecast) {
                    for(i=0;i<forecast.daily.data.length-1;i++){
                        // converting unix timestamp to javascript time
                        var d = new Date(forecast.daily.data[i].time*1000).getDay();

                        // updating html
                        var content = $("[day-id-number="+i+"]").html(weekDays[d]);
                        
                        console.log(i, d, weekDays[d] +': '+forecast.daily.data[i].summary);
                    }
                    $('.daySelection').on('click', function() {
                        var dayId = $(this).attr('id');
                        var dayElement = $(this).attr('day-id-number');
                        var weekDay = $('#'+dayId).html();

                        demandValue = dayValue[weekDay] + weatherValue[forecast.daily.data[dayElement].icon];

                        // updating cityReportRowTwo
                        $('.selectedDayDate').html(weekDay);
                        $('.selectedDaySummary').html(forecast.daily.data[dayElement].summary);
                        $('.selectedDayDemand').html(demandValue);
                    })
                }
            });
        });
    });  
});