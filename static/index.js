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


function filter() {
    window.har_file = har_filter(fileContents);
    //console.log(window.har_file);

    /*
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
    */
    //window.user_data = main();
    return false;
}




