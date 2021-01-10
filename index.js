var usernameArray = ["teo"];
var passwordArray = ["123"];

//REGISTRATION
function register() {
   event.preventDefault();

    var s_email = document.getElementById("semail").value;
    var s_username = document.getElementById("suser").value;
    var s_password = document.getElementById("spass").value;
    var s_retypepassword = document.getElementById("srepass").value;

    if (s_email ==""){
        alert("Email required");
        return;
    }
    else if (s_username == "") {
        alert("Username required.");
        return;
    }
    else if (s_password == "") {
        alert("Password required.");
        return;
    }
    else if (s_retypepassword == "") {
        alert("Password required.");
        return;
    }
    else if (s_password != s_retypepassword) {
        alert("Password don't match retype your Password.");
        return;
    }
    else if (usernameArray.indexOf(s_username) == -1) {
        usernameArray.push(s_username);
        passwordArray.push(s_password);

        alert(s_username + "  Thanks for registration. \nTry to login Now");

        document.getElementById("suser").value = "";
        document.getElementById("spass").value = "";
        document.getElementById("srepass").value = "";
        document.getElementById("semail").value = "";
    }
    else {
        alert(s_username + " is already register.");
        return;
    }
}

//PASSWORD CHECK
    
/*code.addEventListener("keyup", function () {
    checkpassword(code.value);
});*/


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

//LOGIN IN


function login() {
    event.preventDefault();

    var log_username = document.getElementById("loguser").value;
    var log_password = document.getElementById("logpass").value;

    var i = usernameArray.indexOf(log_username);

    if (usernameArray.indexOf(log_username) == -1) {
        if (log_username == "") {
            alert("Username required.");
            return;
        }
        alert("Username does not exist.");
        return;
    }
    else if (passwordArray[i] != log_password) {
        if (password == "") {
            alert("Password required.");
            return;
        }
        alert("Password does not match.");
        return;
    }
    else {
        alert(log_username + " you are login Now \n welcome to our website.");
        window.location.href = "start.html";


        document.getElementById("loguser").value = "";
        document.getElementById("logpass").value = "";
        return;
    }

}

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