const fetch = require('node-fetch');

async function UserData(){
    IPAddress = await GetUserIp();
    console.log(IPAddress);
    const Url = `http://ip-api.com/json/${IPAddress}?fields=city,isp`;
    return fetch(Url)
    .then(response=>response.json())
    .then(data =>{
        console.log(data);
        return data;
    })
    .catch(error=>console.log(error));
    
}    
/* GET USER IP */ 
function GetUserIp(){
    const Url = "https://api.ipify.org?format=json";
    return fetch(Url)
    .then(response=> response.json())
    .then(data =>{
        return data.ip;
    })
    .catch(error=>console.log(error));
}