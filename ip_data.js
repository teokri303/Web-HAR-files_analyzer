const fetch = require('node-fetch');

/* GET IP DATA FROM ip-api.com */ 
function IPData(IPAddress){
    //console.log(IPAddress);
    const Url = `https://get.geojs.io/v1/ip/geo/${IPAddress}.json`;
    return fetch(Url)
    .then(response=>response.json())
    .then(data =>{
        //console.log(data)
        return data;

    })
    .catch(error=>console.log(error))
    

}



module.exports = {
    IPData
}    