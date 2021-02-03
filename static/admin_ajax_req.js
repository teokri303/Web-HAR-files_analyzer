
//ADMIN MAP AJAX CALL
$(document).ready(function () {


  userLocationsGet();
  serverLocationsGet();
  getLinesInfo();
  // DO GET
  function userLocationsGet() {
    $.ajax({
      type: "GET",
      url: "/admin/map/users",
      success: function (result) {
        console.log("users success")
        console.log(result)
        const users = result;

        var myIcon = L.icon({
          iconUrl: "/human-icon.png",
          iconSize: [38, 60]
        });

        for (var i = 0; i < result.length; i++) {
          marker = new L.marker([result[i].geolat, result[i].geolong],
            { icon: myIcon })
            .addTo(mymap);
        }
      }
    });
  }

  function serverLocationsGet() {
    $.ajax({
      type: "GET",
      url: "/admin/map/server",
      success: function (result) {
        console.log("locations success")
        console.log(result)
        var users_array = []

        for (var i = 0; i < result.length; i++) {
          var n = users_array.includes(result[i].user_id);
          if (n == false) {
            users_array.push(result[i].user_id)
          }
        };
        //console.log(users_array)

        for (var i = 0; i < result.length; i++) {

          marker = new L.marker([result[i].serverlat, result[i].serverlong])
            .addTo(mymap);
        }

      }
    });
  }

  function getLinesInfo() {
    $.ajax({
      type: "GET",
      url: "/admin/map/lines",
      success: function (result) {
        console.log("lines info success")
        console.log(result)

        for (var i = 0; i < result.length; i++) {
          var polyline = L.polyline([[result[i].geolat, result[i].geolong], [result[i].serverlat, result[i].serverlong]],
            { color: 'black' }).addTo(mymap);
        }


      }
    });
  }



  var mymap = L.map('mapid').setView([51.505, -0.09], 3);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 513,
    zoomOffset: -1
  }).addTo(mymap);


})


$(document).ready(function () {


  pieChartGet();
  // DO GET
  function pieChartGet() {
    $.ajax({
      type: "GET",
      url: "/admin/pie",
      success: function (result) {
        console.log("pie info")
        console.log(result)

        var ctx = document.getElementById('myChart').getContext('2d');

        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'pie',

          // The data for our dataset
          data: {
            labels: ['PRIVATE', 'PUBLIC', 'NO-CACHE', 'NO-STORE'],
            datasets: [{
              label: 'My First dataset',
              backgroundColor: [
                'rgba(33, 99, 255, 0.8)',
                'rgba(11, 255, 11, 0.8)',
                'rgba(245, 0, 253, 0.8)',
                'rgba(112, 112, 112, 0.8)'
              ],
              borderColor: 'rgba(88, 88, 88, 0.2)',
              data: [result[0].private, result[0].public, result[0].no_catch, result[0].no_store]
            }]
          },

          // Configuration options go here
          options: {}
        });

      }
    });
  }
})