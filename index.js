



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