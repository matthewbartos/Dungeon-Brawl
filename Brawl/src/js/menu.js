

window.onresize = function(){
    
}
//bootstrap
window.onload = function(){
    //declaring public HTML elements
    //@type HTMLDocument
    dMenu = document.getElementById("dMenu");
    dGame = document.getElementById("dGame");
    dMapChoose = document.getElementById("dMapChoose");
    //function run everytime a map i chosen
    function dMapChooseHide(){
        dMapChoose.hidden = true;
        dGame.hidden = false;
    }
    //setting up listeners
    document.getElementById("bStart").onclick = function(){
        dMapChoose.hidden = false;
        dMenu.hidden = true;
    }
    document.getElementById("bMap1").onclick = function(){
        dMapChooseHide();
        Map.parseMap(map1);
    }
}