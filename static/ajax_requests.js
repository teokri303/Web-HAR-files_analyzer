$( document ).ready(function() {
  
    // GET REQUEST
    $("#test").click(function(event){
      event.preventDefault();
      ajaxGet();
    });
    
    // DO GET
    function ajaxGet(){
      $.ajax({
        type : "GET",
        url : "/test",
        success: function(result){
          $('#getResultDiv ul').empty();
          var custList = "";
          $.each(result, function(i, result){
            $('#getResultDiv .list-group').append(result.username + "<br>")
          });
          console.log("Success: ", result[0].username);
        },
        error : function(e) {
          $("#getResultDiv").html("<strong>Error</strong>");
          console.log("ERROR: ", e);
        }
      });  
    }
  })


  $( document ).ready(function() {

      ajaxGet();
    // DO GET
    function ajaxGet(){
      $.ajax({
        type : "GET",
        url : "/geo",
        success: function(result){
          var mymap = L.map('mapid').setView([51.505, -0.09], 3);

          L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
              maxZoom: 18,
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1
          }).addTo(mymap);
          for (var i = 0; i < result.length; i++) {
            marker = new L.marker([result[i].serverlat, result[i].serverlong])
              .addTo(mymap);
          }

          


           

          
          //.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();




          var popup = L.popup();
          
          
          
          console.log("Success: ")
        },
        error : function(e) {
          $("#getResultDiv").html("<strong>Error</strong>");
          console.log("ERROR: ", e);
        }
      });  
    }
  })
