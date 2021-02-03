
//USER HEATMAP AJAX CALL
$(document).ready(function () {
 // https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw

  ajaxGet();
  // DO GET
  function ajaxGet() {
    $.ajax({
      type: "GET",
      url: "/geo",
      success: function (result) {
        var mymap = L.map('mapid').setView([51.505, -0.09], 3);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 513,
          zoomOffset: -1
        }).addTo(mymap);

        var heatMapPoint = []
        
        for (var i = 0; i < result.length; i++) {
          if (result[i].serverlat != null && result[i].serverlong != null){
            heatMapPoint.push([result[i].serverlat, result[i].serverlong, 0.7])
          }
        }
        console.log(heatMapPoint)

        var heat = L.heatLayer(heatMapPoint, {
          radius: 25,
          maxZoom: 3,
          gradient: {0.4: 'blue', 0.6: 'lime', 0.9: 'red'},
          blur: 25,
        }).addTo(mymap);




        console.log("Success: ")
      }
    });
  }
})

