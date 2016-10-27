var redirectTime = 3000;
var redirectURL = "https://reddit-nodejs-mscale92.c9users.io/";
function Redirect() {
    window.location.assign(redirectURL);
}

setTimeout(Redirect,5000)