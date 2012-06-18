imgButton = new Image();
imgButton.src = "graphics/button.png";

window.onresize = function(){console.log("onresize");}

window.onload = function(){
    console.log("onload");
    canvasGUI = document.getElementById("canvasGUI");
    stageGUI = new Stage(canvasGUI);
    var backgroundGraphics = new Graphics();
    backgroundGraphics.beginFill(Graphics.getRGB(0,0,0));
    backgroundGraphics.drawRect(0,0,canvasGUI.width, canvasGUI.height);
    var backgroundShape = new Shape(backgroundGraphics);
    stageGUI.addChild(backgroundShape);
    var bitmapButton = new Bitmap(imgButton);
    bitmapButton.scaleX = 0.5;
    bitmapButton.scaleY = 0.5;
    bitmapButton.x = canvasGUI.width/2 - imgButton.width/2*0.5;
    bitmapButton.y = 50;
    stageGUI.addChild(bitmapButton);
    stageGUI.update();
}