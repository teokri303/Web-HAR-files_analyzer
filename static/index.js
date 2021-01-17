/* PARSE & FILTER  HAR FILE */
function har_filter(fileContents) {
    var data = JSON.parse(fileContents)
    var entries_length = (data.log.entries).length;
    for (var i = 0; i < entries_length; i++) {
        //CHECK SERVER IP ADDRESS
        //console.log("Data ENTRY:" + i + "Ip address" + data.log.entries[i].serverIPAddress);
    }
    var har = new Object();
    har.log = new Object();
    har.log.entries = [];
    for (var i = 0; i < entries_length; i++) {
        har.log.entries[i] = new Object();
        har.log.entries[i].startedDateTime = data.log.entries[i].startedDateTime;
        har.log.entries[i].serverIPAddress = data.log.entries[i].serverIPAddress;
        har.log.entries[i].request = new Object();
        har.log.entries[i].request.method = data.log.entries[i].request.method;
        har.log.entries[i].request.url = data.log.entries[i].request.url;
        har.log.entries[i].request.headers = new Object();
        for (var j = 0; j < ((data.log.entries[i].request.headers).length); j++) {
            if (data.log.entries[i].request.headers[j].name == 'content-type') {
                har.log.entries[i].request.headers.content_type = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'cache-control') {
                har.log.entries[i].request.headers.cache_control = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'pragma') {
                har.log.entries[i].request.headers.pragma = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'last-modified') {
                har.log.entries[i].request.headers.last_modified = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'host') {
                har.log.entries[i].request.headers.host = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'age') {
                har.log.entries[i].request.headers.age = data.log.entries[i].request.headers[j].value;
            }
            if (data.log.entries[i].request.headers[j].name == 'expires') {
                har.log.entries[i].request.headers.age = data.log.entries[i].request.headers[j].value;
            }
        }
        har.log.entries[i].timings = new Object();
        har.log.entries[i].timings.wait = data.log.entries[i].timings.wait;
        har.log.entries[i].response = new Object();
        har.log.entries[i].response.status = data.log.entries[i].response.status;
        har.log.entries[i].response.statusText = data.log.entries[i].response.statusText;
        har.log.entries[i].response.headers = new Object();
        for (var j = 0; j < ((data.log.entries[i].response.headers).length); j++) {
            if (data.log.entries[i].response.headers[j].name == 'content-type') {
                har.log.entries[i].response.headers.content_type = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'cache-control') {
                har.log.entries[i].response.headers.cache_control = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'pragma') {
                har.log.entries[i].response.headers.pragma = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'last-modified') {
                har.log.entries[i].response.headers.last_modified = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'host') {
                har.log.entries[i].response.headers.host = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'age') {
                har.log.entries[i].response.headers.age = data.log.entries[i].response.headers[j].value;
            }
            if (data.log.entries[i].response.headers[j].name == 'expires') {
                har.log.entries[i].response.headers.age = data.log.entries[i].response.headers[j].value;
            }
        }
    }
    //save HAR AS A JSON file 
    //const saveFile = fs.writeFileSync('./har_processed.json',JSON.stringify(har));
    //print it
    filtered = JSON.stringify(har);
    // PRINT HAR
    //console.log(har)
    //console.log(har.log.entries[0].serverIPAddress);
    //console.log(data.log.entries[0].serverIPAddress);
    return (filtered);
}

har_filter(fileContents);





function filter() {
    const har_file = har_filter(fileContents);
    console.log(har_file);
    
    fetch('/upload/har', {
        method: 'POST',
        body: har_file
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.path)
    })
    .catch(error => {
        console.error(error)
    })
    
    //main();
    return false;
}








//TO KRATAME AKOMA MONO KAI MONO AUTO TO FILE 
//GIATI PERIEXEI TOUW PERIORISMOYS TOU KODIKOU POU THA RPOSTETHOUN STON SERVER ARGOTERA

function checkpassword() {

    var code = document.getElementById("spass");
    var strengthbar = document.getElementById("meter");
    var display = document.getElementById("progressbar");
    password = code.value;
    strength = 0;


    if (password.match(/[a-z]+/)) {
        strength += 1;
    }
    if (password.match(/[A-Z]+/)) {
        strength += 1;
    }
    if (password.match(/[0-9]+/)) {
        strength += 1;
    }
    if (password.match(/[$@#&!]+/)) {
        strength += 1;

    }

    if (password.length < 8) {
        display.innerHTML = "minimum number of characters is 8";
    }

    switch (strength) {
        case 0:
            strengthbar.value = 0;
            break;

        case 1:
            strengthbar.value = 25;
            break;

        case 2:
            strengthbar.value = 50;
            break;

        case 3:
            strengthbar.value = 75;
            break;

        case 4:
            strengthbar.value = 100;
            break;
    }
}

//AN THA MAS XREIASTEI NA KANOYME META KATI GIA TO FORGOT PASSWORD
function forgot() {
    event.preventDefault();

    var email = document.getElementById("fe").value;

    if (emailArray.indexOf(email) == -1) {
        if (email == "") {
            alert("Email required.");
            return;
        }
        alert("Email does not exist.");
        return;
    }

    alert("email is send to your email check it in 24hr. \n Thanks");
    document.getElementById("fe").value = "";
}

