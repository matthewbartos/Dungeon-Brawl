
/**
 * Loads and paint images
 */
Painter = {
    loadImages: function(){
        var playerSpritesheetData = {
            images: ["graphics/maleWalk.png"],
            frames: {width: 64, height: 64},
            animations: {
                stand: 18
            }
        }
        Painter.playerImage = new SpriteSheet(playerSpritesheetData);
    },
    /**
     * Draws the map on the canvases
     */
    drawMap: function(){
        if(!GameMap.tmxMap) throw "no map parsed";
        var map = GameMap.map;
        //declaring the containers for easy movement of the map
        var MapContainer = function(){}
        MapContainer.prototype = new Container();
        MapContainer.prototype.scaleY = MapContainer.prototype.scaleX = 1.5;
        containerMapBack = new MapContainer();
        stageBaseMap.addChild(containerMapBack);
        containerMapFront = new MapContainer();
        stageMapFront.addChild(containerMapFront);
        //Graphics used to draw the grid
        var g = new Graphics();
        g.beginStroke(Graphics.getRGB(256,256,256));
        for(var y = 0; y < map.length; y++){
            g.moveTo(0, y*33).lineTo(GameMap.tmxMap.width*33, y*33);
            for(var x = 0; x <  map[y].length; x++){
                if(map[y][x].image){
                    var btm = new Bitmap(map[y][x].image);
                    btm.y = y*33;
                    btm.x = x*33;
                    containerMapBack.addChild(btm);
                    delete map[y][x].image;
                }
                if(map[y][x].decImage){
                    btm = new Bitmap(map[y][x].decImage);
                    btm.y = y*33;
                    btm.x = x*33;
                    containerMapBack.addChild(btm);
                    delete map[y][x].decImage;
                }
                if(map[y][x].decFrontImage){
                    btm = new Bitmap(map[y][x].decFrontImage);
                    btm.y = y*33;
                    btm.x = x*33;
                    containerMapFront.addChild(btm);
                    delete map[y][x].decFrontImage;
                }
                if(y == 0) g.moveTo(x*33, 0).lineTo(x*33, GameMap.tmxMap.height*33);
            }
        }
        //drawing the final lines of the grid
        g.moveTo(0, y*33).lineTo(GameMap.tmxMap.width*33, y*33).moveTo(x*33, 0)
            .lineTo(x*33, GameMap.tmxMap.height*33);
        containerMapBack.addChild(new Shape(g));
        stageMapFront.update();
        stageBaseMap.update();
        console.timeEnd("map load");
    }
}

/**
 * Image of tha player, moves it around, changes animation, etc.
 */
function PlayerImage(){
    this.bitmap = new BitmapAnimation(Painter.playerImage);
    this.bitmap.scaleX = this.bitmap.scaleY = 1.5;
    this.bitmap.gotoAndStop("stand");
    stagePlayer.addChild(this.bitmap);
}

/**
 * Places the image at specified coordinates
 * @param {Number} x Coord x
 * @param {Number} y Coord y
 */
PlayerImage.prototype.placeAt = function(x,y){
    this.bitmap.x = x*49.5-23;
    this.bitmap.y = y*49.5-48;
    stagePlayer.update();
}