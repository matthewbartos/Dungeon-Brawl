
window.onresize = function(){

}
//bootstrap
window.onload = function(){
    //declaring public HTML elements
    dMenu = document.getElementById("dMenu");
    dGame = document.getElementById("dGame");
    dMapChoose = document.getElementById("dMapChoose");
    pFPS = document.getElementById("pFPS");
    canvasMapBase = document.getElementById("canvasMapBase");
    canvasPlayer = document.getElementById("canvasPlayer");
    canvasMapFront = document.getElementById("canvasMapFront");
    //function run everytime a map is chosen
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
        initializeStages();
        //setting up the width and height of canvases
        canvasMapBase.width = canvasPlayer.width = canvasMapFront.width =
            Math.floor(dGame.clientWidth);
        canvasMapBase.height = canvasPlayer.height = canvasMapFront.height =
            Math.floor(dGame.clientHeight);
        System.loadGame("basic");
    }
    Ticker.addListener({
        tick: function(){
            pFPS.innerHTML = "FPS: " + Math.round(Ticker.getMeasuredFPS());
        }
    });
}