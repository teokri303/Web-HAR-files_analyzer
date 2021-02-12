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
        //console.log(result)
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

        console.log("locations success")

      }
    });
  }

  function getLinesInfo() {
    $.ajax({
      type: "GET",
      url: "/admin/map/lines",
      success: function (result) {
        
        console.log(result)

        for (var i = 0; i < result.length; i++) {
          var polyline = L.polyline([[result[i].geolat, result[i].geolong], [result[i].serverlat, result[i].serverlong]],
            { color: 'black' }).addTo(mymap);
        }

        console.log("lines info success")


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


  pieChartGet();
  $("#link1").click(function () {
    pieChartImage();
  });
  $("#reset").click(function () {
    pieChartGet();
  });

  $("#application_javascript").click(function(){
    pieChartJavascript();
  });


  $("#font").click(function(){
    pieChartFont();
  });

})


// GET PIE CHART
function pieChartGet() {
  $.ajax({
    type: "GET",
    url: "/admin/pie",
    success: function (result) {
      if(window.chart){
          window.chart.destroy();
      }
      getchart(result);
      }
    });
}

//GET pie chart for content type: image
function pieChartImage() {
  $.ajax({
    type: "GET",
    url: "/admin/pie/image",
    success: function (result) {
      console.log("pie info")
      console.log(result)
      //update data 
      //addData(window.chart, result);
      window.chart.destroy();
      getchart(result);

    }
  });
}

//GET pie chart for content type: application Javascript
function pieChartJavascript() {
  $.ajax({
    type: "GET",
    url: "/admin/pie/text_javascript",
    success: function (result) {
      window.chart.destroy();
      getchart(result);
    }
  });
}

//GET pie chart for content type: font
function pieChartFont() {
  $.ajax({
    type: "GET",
    url: "/admin/pie/font",
    success: function (result) {
      window.chart.destroy();
      getchart(result);
    }
  });
}

function getchart(result) {
  var ctx = document.getElementById('myChart').getContext('2d');
  ctx.canvas.width = 500;
  ctx.canvas.height = 350;
  window.chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'pie',

    // The data for our dataset
    data: {
      labels: ['PRIVATE', 'PUBLIC', 'NO-CACHE', 'NO-STORE'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: [
          'rgb(50, 205, 102)',
          'rgb(50, 153, 205)',
          'rgb(205, 50, 153)',
          'rgb(205, 102, 50)'
        ],
        borderColor: 'rgba(88, 88, 88, 0.2)',
        data: [result[0].private, result[0].public, result[0].no_catch, result[0].no_store]
      }]
    },

    // Configuration options 
    options: {
      responsive:false
    }
  });
}

//NO USE
function addData(chart, data) {
  //chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  chart.update();
}



//AVERAGE AGE OF WEB OBJECT PER CONTENT TYPE
$(document).ready(function () {

  uniqueDomainsGet();
  ageOfElements_all();
  ageOfElements_application();
  ageOfElements_image();
  ageOfElements_text();


  function uniqueDomainsGet() {
    $.ajax({
      type: "GET",
      url: "/admin/info/domains",
      success: function (result) {
        //console.log(result[0].count)

        $('#domains_col').append(result[0].count);

      }
    });
  }

  function ageOfElements_all() {
    $.ajax({
      type: "GET",
      url: "/admin/info/age",
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].cache_control.indexOf(',') == -1 || result[i].cache_control.indexOf(',') > 5) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf('=') + 10);
          }
          if ((result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('='))) > 0) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('=')));
          }

        }
        //console.log(result)
        var sum = 0
        for (var i = 0; i < result.length; i++) {
          sum = sum + parseInt(result[i].cache_control);
        }
        //console.log(sum)
        var waiting_time = ((sum / result.length) / 86400); //metatroph se meres 
        var avg_time = waiting_time.toFixed(0); //afairesh twn dekadikwn
        //console.log(avg_time + " days")

        $('#avg_all').append(avg_time + " days");


      }
    });
  }

  function ageOfElements_application() {
    $.ajax({
      type: "GET",
      url: "/admin/info/age/application",
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].cache_control.indexOf(',') == -1 || result[i].cache_control.indexOf(',') > 5) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf('=') + 10);
          }
          if ((result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('='))) > 0) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('=')));
          }

        }
        //console.log(result)
        var sum = 0
        for (var i = 0; i < result.length; i++) {
          sum = sum + parseInt(result[i].cache_control);
        }
        //console.log(sum)
        var waiting_time = ((sum / result.length) / 86400); //metatroph se meres 
        var avg_time = waiting_time.toFixed(0); //afairesh twn dekadikwn
        //console.log(avg_time + " days")

        $('#avg_app').append(avg_time + " days");


      }
    });
  }

  function ageOfElements_image() {
    $.ajax({
      type: "GET",
      url: "/admin/info/age/image",
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].cache_control.indexOf(',') == -1 || result[i].cache_control.indexOf(',') > 5) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf('=') + 10);
          }
          if ((result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('='))) > 0) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('=')));
          }

        }
        //console.log(result)
        var sum = 0
        for (var i = 0; i < result.length; i++) {
          sum = sum + parseInt(result[i].cache_control);
        }
        //console.log(sum)
        var waiting_time = ((sum / result.length) / 86400); //metatroph se meres 
        var avg_time = waiting_time.toFixed(0); //afairesh twn dekadikwn
        //console.log(avg_time + " days")

        $('#avg_image').append(avg_time + " days");


      }
    });
  }

  function ageOfElements_text() {
    $.ajax({
      type: "GET",
      url: "/admin/info/age/text",
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].cache_control.indexOf(',') == -1 || result[i].cache_control.indexOf(',') > 5) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf('=') + 10);
          }
          if ((result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('='))) > 0) {
            result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('=')));
          }

        }
        //console.log(result)
        var sum = 0
        for (var i = 0; i < result.length; i++) {
          sum = sum + parseInt(result[i].cache_control);
        }
        //console.log(sum)
        var waiting_time = ((sum / result.length) / 86400); //metatroph se meres 
        var avg_time = waiting_time.toFixed(0); //afairesh twn dekadikwn
        //console.log(avg_time + " days")

        $('#avg_text').append(avg_time + " days");


      }
    });
  }

})


$(document).ready(function () {
  chartInfo();

  function chartInfo() {
    $.ajax({
      type: "GET",
      url: "/admin/info/chart/info",
      success: function (result) {
        //console.log(result)
        var xLabels = []
        var dataset = []
        for (var i =0; i< result.length; i++){
          dataset.push(result[i].avg)
          xLabels.push(result[i].date_part + ":00")
          
        }

        
        var ctx = document.getElementById('myChart2').getContext('2d');
        ctx.canvas.width = 500;
        ctx.canvas.height = 350;
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'bar',

          // The data for our dataset
          data: {
            labels: xLabels,
            datasets: [{
              label: 'My First dataset',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: dataset
            }]
          },
          options:{
            responsive:false,
            aspectRatio:1,
            scales: {
              xAxes: [{
                  gridLines: {
                      display:false,
                  }
              }],
              yAxes: [{
                  gridLines: {
                      display:false,
                  }   
              }]
          }
           
          }
          
        });
      }
    });
  }

}) 