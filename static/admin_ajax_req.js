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

        var weight = 1;
        var geos = []
        var max = 0;

        for (var i = 0; i < result.length; i++) {
          geos.push([[result[i].geolat, result[i].geolong], [result[i].serverlat, result[i].serverlong]])
          present = ([[result[i].geolat, result[i].geolong], [result[i].serverlat, result[i].serverlong]]);
          var sum = 0;

          for (var j = 0; j < result.length; j++) {
            if(result[i].geolat == result[j].geolat && result[i].geolong == result[j].geolong && result[i].serverlat == result[j].serverlat && result[i].serverlong == result[j].serverlong){
              sum = sum +1;
            }
          }
          
          if(sum < 10){
            weight = 0.5
          }
          else if(sum >= 10 && sum < 20){
            weight = 1
          }
          else if(sum >= 20 && sum < 30){
            weight = 1.5
          }
          else if(sum >= 30 && sum < 40){
            weight = 2
          }
          else if(sum >= 40 && sum < 50){
            weight = 2.5
          }
          else if(sum >= 50 && sum < 60){
            weight = 3
          }
          else if(sum >= 60 && sum < 70){
            weight = 3.5
          }
          else if(sum >= 70 && sum < 80){
            weight = 4
          }
          else if(sum >= 80 && sum < 90){
            weight = 4.5
          }
          else if(sum >= 90 && sum < 100){
            weight = 5
          }
          else if(sum >= 100 && sum < 110){
            weight = 5.5
          }
          else if(sum >= 110 && sum < 120){
            weight = 6
          }
          else if(sum >= 120 && sum < 130){
            weight = 7
          }
          else{
            weight = 8
          }
          
        

          var polyline = L.polyline([[result[i].geolat, result[i].geolong], [result[i].serverlat, result[i].serverlong]],
            { color: 'black', weight:weight}).addTo(mymap);
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
    zoomOffset: -1,

  }).addTo(mymap);


  pieChartGet();
  $("#pie_image").click(function () {
    pieChartImage();
  });
  $("#pie_reset").click(function () {
    pieChartGet();
  });

  $("#pie_application_javascript").click(function(){
    pieChartJavascript();
  });


  $("#pie_font").click(function(){
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

$(document).ready(function () {
  
  getUsersNumber();
  getInternerProvidersNumber();
  getResponseStatusCount();
  getMethodStatusCount();

  function getUsersNumber() {
    $.ajax({
      type: "GET",
      url: "/admin/info/users/count",
      success: function (result) {
        //console.log(result)
        $('#user_count').append(result);
      }
    });
  }
  function getInternerProvidersNumber() {
    $.ajax({
      type: "GET",
      url: "/admin/info/providers/count",
      success: function (result) {
        //console.log(result)
        $('#host_count').append(result)
      }
    });
  }
  function getMethodStatusCount() {
    $.ajax({
      type: "GET",
      url: "/admin/info/methods/count",
      success: function (result) {
        //console.log(result) 
        for(var i=0; i<result.length; i++){
          $('#methods_head').append("<th>" + result[i].method + "</th>")
          $('#methods_body').append("<td>" + result[i].count + "</td>")
        }
      }
    });
  }
  function getResponseStatusCount() {
    $.ajax({
      type: "GET",
      url: "/admin/info/response/count",
      success: function (result) {
        //console.log(result)
        for(var i=0; i<result.length; i++){
          $('#response_status_head').append("<th>" + result[i].status + "</th>")
          $('#response_status_body').append("<td>" + result[i].count + "</td>")
        }

      }
    });
  }
});




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

  chartInfo();
  waitForElement();
  //chartTTL();
  function waitForElement(){
    if(typeof window.all_age !== "undefined"){
      var dataset = []
      var label = []
      var backgroundColor = []
      dataset.push(window.all_age);
      label.push('Age All');  
      backgroundColor.push('rgb(50, 205, 102)');
      chartTTL(dataset, label, backgroundColor);
    }
    else{
        setTimeout(waitForElement, 250);
    }
  }
  
})


function chartInfo() {
  $.ajax({
    type: "GET",
    url: "/admin/info/chart/info",
    success: function (result) {
      //console.log(result)
      var xLabels = []
      var dataset = []
      var backgroundColor = ['rgb(255, 99, 132)', 'rgb(154, 205, 50)']
      for (var i =0; i< result.length; i++){
        dataset.push(result[i].avg)
        xLabels.push(result[i].date_part + ":00")
        
      }

      
      var ctx_bar = document.getElementById('myChart2').getContext('2d');
      ctx_bar.canvas.width = 500;
      ctx_bar.canvas.height = 350;
      var chart_bar = new Chart(ctx_bar, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
          labels: xLabels,
          datasets: [{
            label: 'Timings',
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



function chartTTL(data,label,backgroundColor) {
      /*
      var xLabels = []
      var dataset = []
      for (var i =0; i< data.length; i++){
        dataset.push(data)
        xLabels.push(label)
        
      }
      */
      console.log("dataset:" + data)
      console.log("xlabels" + label)
     //var xLabels = []
     //xLabels.push(label)
     //var dataset = []
     //dataset.push(data);
      var ctx_bar = document.getElementById('Chart_TTL').getContext('2d');
      ctx_bar.canvas.width = 500;
      ctx_bar.canvas.height = 350;
      
      window.chart_bar = new Chart(ctx_bar, {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: {
          labels: label,
          datasets: [{
            label: 'TTL',
            backgroundColor: backgroundColor,
            data: data
          }
        ]
        },
        options:{
          responsive:false,
          aspectRatio:1,
          legend:{display:false},
          scales: {
            xAxes: [{
                gridLines: {
                    display:false,
                }
            },
          ],
            yAxes: [{
                gridLines: {
                    display:false,
                },
                ticks:{
                  min:0
                }   
            }]
        }
        }
        
      });
 
}


function avg_time(result){
  for (var i = 0; i < result.length; i++) {
    //console.log("Result" + i +"before: " + result[i].cache_control);
    if (result[i].cache_control.indexOf(',') == -1 || result[i].cache_control.indexOf(',') > 5) {
      result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf('=') + 10);
      //console.log("Result" + i +"after: " + result[i].cache_control);
    }
    if ((result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('='))) > 0) {
      result[i].cache_control = result[i].cache_control.substring(result[i].cache_control.indexOf('=') + 1, result[i].cache_control.indexOf(',', result[i].cache_control.indexOf('=')));
      //console.log("Result" + i +"after: " + result[i].cache_control);
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
  return avg_time;
}


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
      window.all_age = avg_time(result);
      $('#avg_all').append(avg_time(result) + " days");
    }
  });
}

function ageOfElements_application() {
  $.ajax({
    type: "GET",
    url: "/admin/info/age/application",
    success: function (result) {
      window.app_age = avg_time(result); 
      $('#avg_app').append(avg_time(result) + " days");
    }
  });
}

function ageOfElements_image() {
  $.ajax({
    type: "GET",
    url: "/admin/info/age/image",
    success: function (result) {
      window.image_age = avg_time(result);
      $('#avg_image').append(avg_time(result) + " days");
    }
  });
}

function ageOfElements_text() {
  $.ajax({
    type: "GET",
    url: "/admin/info/age/text",
    success: function (result) {
      window.text_age = avg_time(result);
      $('#avg_text').append(avg_time(result) + " days");
    }
  });
}

/* TTL CHECKBOX FILTERING */
/* WHEN PAGE IS LOADED, GET CHECKBOX'S ELEMENTS */
document.addEventListener("DOMContentLoaded", function() {
  var ttl_all = document.getElementById('ttl_all');
  ttl_all.checked = true;
  console.log(ttl_all.checked); 
  var ttl_image = document.getElementById('ttl_image');
  var ttl_javascript = document.getElementById('ttl_javascript');
  var ttl_font = document.getElementById('ttl_font');
  /*TTL ALL BUTTON ACTION*/
  ttl_all.addEventListener('change', (event) => {
    window.chart_bar.destroy();
    isChecked();
  });
  /*TTL IMAGE BUTTON ACTION*/
  ttl_image.addEventListener('change', (event) => {
    ttl_all.checked = false;
    window.chart_bar.destroy();
    isChecked();
  });

  ttl_javascript.addEventListener('change', (event) => {
    ttl_all.checked = false;
    window.chart_bar.destroy();
    isChecked();
  });

  ttl_font.addEventListener('change', (event) => {
    ttl_all.checked = false;
    window.chart_bar.destroy();
    isChecked();
  });
});

window.addEventListener('DOMContentLoaded', (event) => {
  
});
  
function isChecked(){
  var dataset = []
  var label = []
  var backgroundColor = []
  if(ttl_all.checked == true){
    window.chart_bar.destroy();
    dataset.push(window.all_age);
    label.push('Age all');
    backgroundColor.push('rgb(50, 205, 102)');
    ttl_image.checked = false;
    ttl_javascript.checked = false;
    ttl_font.checked = false;
    //chartTTL(window.all_age);
  }
  if(ttl_image.checked == true){
    window.chart_bar.destroy();
    dataset.push(window.image_age);
    label.push('Image');
    backgroundColor.push('rgb(50, 153, 205)');
    //chartTTL(window.image_age);
    }
  if(ttl_font.checked == true){
      window.chart_bar.destroy();
      dataset.push(window.text_age);
      label.push('Age font');
      backgroundColor.push('rgb(205, 50, 153)');
      //chartTTL(window.text_age);
  }
  if(ttl_javascript.checked == true){
    window.chart_bar.destroy();
    dataset.push(app_age);
    label.push('Age Javascript');
    backgroundColor.push('rgb(205, 102, 50)');
    //chartTTL(window.app_age);
}
  console.log(dataset);
  chartTTL(dataset,label,backgroundColor);
}


/*
'rgb(50, 205, 102)',
          'rgb(50, 153, 205)',
          'rgb(205, 50, 153)',
          'rgb(205, 102, 50)'
*/