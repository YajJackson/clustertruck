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
    var weekDays = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    }
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

    // create last of month to be referenced when checking for end of month special
    var today = new Date();
    var lastOfMonth = new Date( today.getFullYear(), today.getMonth()+1, 0 ).getDate();

    // hides report container until it is needed
    $('.cityReportContainer').hide();
    
    // this will be used to map our demandValue to a color scale
    // helpful for visualizing demand
    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    // send kitchen API request
    $.get("https://api.staging.clustertruck.com/api/kitchens/").done(function(cluster) {

        // get locational data from Kitchen API
        $('.citySelection').on('click', function() {
            // adjust selection background
            $('.citySelection').css('background-color','#5D6D7E');
            $(this).css('background-color', 'black');

            var cityId = $(this).attr('id');
            var cityElement = $(this).attr('city-id-number');
            var selectedCity = $('#'+cityId).html();

            // set latitude and longitude
            selectedLatitude = cluster[cityElement].location.lat;
            selectedLongitude = cluster[cityElement].location.lng;
        }) 

        // using Dark Sky API
        // get weather forecast report
        $('.getReportButton').on('click', function(){

            // reset colors and positions after a new report is generated
            $('.selectedDayReport').css('background-color', '#5D6D7E');
            $('.selectedDayDate').css('background-color', '#5D6D7E');
            $('.selectedDaySummary').css('background-color', '#5D6D7E');
            $('.daySelection').css('background-color','#5D6D7E');
            $('.selectedDayDate').html('Day of the Week');
            $('.selectedDaySummary').html('Forecast Summary');
            $('.cityReportContainer').hide(500);

            // A solid work around for the access error, found at https://stackoverflow.com/questions/28104251/xmlhttprequest-cannot-load-no-access-control-allow-origin-header-is-present
            $.ajax({
                type: 'POST',
                url: "https://api.darksky.net/forecast/496761701d0d263e29a5dd53794ee3dc/"+selectedLatitude+","+selectedLongitude,
                dataType: 'jsonp',
                success: function (forecast) {
                    for(i=0;i<forecast.daily.data.length-1;i++){

                        // converting unix timestamp to javascript time
                        var d = new Date(forecast.daily.data[i].time*1000).getDay();
                        var m = new Date(forecast.daily.data[i].time*1000).getDate();

                        // checking if last day of month, if so then add 5 to demand value
                        if(m == lastOfMonth){
                            dayValue[weekDays[d]] += 5;
                        }

                        // updating html
                        $("[day-id-number="+i+"]").html(weekDays[d]);
                    }

                    // expand information about selected day within forecast
                    $('.daySelection').on('click', function() {

                        // update color to indicate selection
                        $('.daySelection').css('background-color','#5D6D7E');
                        $(this).css('background-color', 'black');

                        var dayId = $(this).attr('id');
                        var dayElement = $(this).attr('day-id-number');
                        var weekDay = $('#'+dayId).html();

                        // calculate demandValue prediction
                        var demandValue = dayValue[weekDay] + weatherValue[forecast.daily.data[dayElement].icon] + specialValue;
                        
                        // calculate color to visually represent the demand for the day 
                        scaledColor = 'rgb(0,' + Math.round(map_range(demandValue, -1, 13, 0, 255)) + ',40)';

                        // setting scaled background-color
                        $('.selectedDayReport').css('background-color', scaledColor);
                        $('.selectedDayDate').css('background-color', scaledColor);
                        $('.selectedDaySummary').css('background-color', scaledColor);
                        
                        // updating cityReportRowTwo
                        $('.selectedDayDate').html(weekDay);
                        $('.selectedDaySummary').html(forecast.daily.data[dayElement].summary);
                        $('.selectedDayDemand').html(demandValue);
                    })
                }
            });

            // in the case of switching city selections, this animates the change
            $('.cityReportContainer').show(500);
        });
    });  
});