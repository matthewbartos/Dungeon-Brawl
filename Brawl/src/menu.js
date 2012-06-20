

window.onresize = function(){
    
}
//bootstrap
window.onload = function(){
    //declaring public HTML elements
    //@type HTMLDocument
    dMenu = document.getElementById("dMenu");
    dGame = document.getElementById("dGame");
    //setting up listeners
    document.getElementById("bStart").onclick = function(){
        dGame.hidden = false;
        dMenu.hidden = true;
    }
}