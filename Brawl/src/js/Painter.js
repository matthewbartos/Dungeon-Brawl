
/**
 * Loads and paints images
 */
Painter = {
    loadImages: function(){
        var playerSpritesheetData = {
            images: ["graphics/maleWalk.png"],
            frames: {width: 64, height: 64, regX: 16, regY:32},
            animations: {
                standDown: 18,
                standUp: 0,
                standLeft: 9,
                standRight: 27,
                walkRight: [27,35],
                walkLeft: [9,17],
                walkUp: [0,8],
                walkDown: [18,26]
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
                    stageBaseMap.addChild(btm);
                    //delete map[y][x].image;
                }
                if(map[y][x].decImage){
                    btm = new Bitmap(map[y][x].decImage);
                    btm.y = y*33;
                    btm.x = x*33;
                    stageBaseMap.addChild(btm);
                    //delete map[y][x].decImage;
                }
                if(map[y][x].decFrontImage){
                    btm = new Bitmap(map[y][x].decFrontImage);
                    btm.y = y*33;
                    btm.x = x*33;
                    stageMapFront.addChild(btm);
                    //delete map[y][x].decFrontImage;
                }
                if(y == 0) g.moveTo(x*33, 0).lineTo(x*33, GameMap.tmxMap.height*33);
            }
        }
        //drawing the final lines of the grid
        g.moveTo(0, y*33).lineTo(GameMap.tmxMap.width*33, y*33).moveTo(x*33, 0)
            .lineTo(x*33, GameMap.tmxMap.height*33);
        stageBaseMap.addChild(new Shape(g));
        stageMapFront.update();
        stageBaseMap.update();
        stageMarker.update();
        console.timeEnd("map load");
    },
    /**
     * Creates invisible shapes
     */
    easelShapes: {
        createSquare: function(r,g,b,x,y){
            var gr = new Graphics();
            gr.beginStroke(Graphics.getRGB(r,g,b)).setStrokeStyle(3)
                .beginFill(Graphics.getRGB(r,g,b,0.1))
                .drawRoundRect(0,0,33,33,2);
            var s = new Shape(gr);
            s.x = x*33;
            s.y = y*33;
            s.alpha = 0;
            return s; 
        },
        /**
         * Creates a green square at given coords
         * @param {Number} x Coord x
         * @param {Number} y Coord y
         */
        createGreenSquare: function(x,y){
            return this.createSquare(30,200,30,x,y);    
        }
    }
}

/**
 * Image of tha player, moves it around, changes animation, etc.
 */
function PlayerImage(){
    this.bitmap = new BitmapAnimation(Painter.playerImage);
    this.bitmapShadowDown = new Bitmap(SpriteSheetUtils.extractFrame(this.bitmap.spriteSheet, 18));
    var colorFilter = new ColorFilter(0,0,0,0.5);
    this.bitmapShadowDown.filters = [colorFilter];
    this.bitmapShadowDown.cache(0,0,64,64);
    this.bitmapShadowDown.alpha = 0;
    this.bitmap.gotoAndStop("standDown");
    stagePlayer.addChild(this.bitmap);
    stagePlayer.addChild(this.bitmapShadowDown);
}

/**
 * Places the image at specified coordinates
 * @param {Number} x Coord x
 * @param {Number} y Coord y
 */
PlayerImage.prototype.placeAt = function(x,y){
    this.bitmap.x = x*33;
    this.bitmap.y = y*33;
    stagePlayer.update();
}

/**
 * Places the shadow at specified coords, in the direction given
 * @param {number} x Coord x
 * @param {number} y Coord y
 * @param {string} dir Direction to face ('down', 'up', 'left', 'right')
 */
PlayerImage.prototype.placeShadowAt = function(x,y,dir){
    switch(dir){
        case 'down' :
            this.bitmapShadowDown.x = x*33-16;
            this.bitmapShadowDown.y = y*33-32;
            this.bitmapShadowDown.alpha = 1;
            this.bitmapShadowDown.updateCache();
            stagePlayer.update();
    }
}

/**
 * Sets the walking animation and moves the bitmap
 * @param {Number} right By how many tiles to the right move. 1 is one tile, -1 is
 * one tile to the left.
 * @param {Number} down By how many tiles down move. 1 is one tile, -1 is
 * one tile to the up.
 */
PlayerImage.prototype.walk = function(right,down){
    if(down > 0){
        this.bitmap.gotoAndPlay("walkDown")
    }else if(down <= 0 && right > 0){
        this.bitmap.gotoAndPlay("walkRight");
    }else if(down <= 0 && right < 0){
        this.bitmap.gotoAndPlay("walkLeft");
    }else{
        this.bitmap.gotoAndPlay("walkUp");
    }
    var that = this;
    var i = 0;
    var speed = 3;
    var maxIterations = Math.abs(right) > Math.abs(down) ? 
        Math.abs(33*right)/speed : Math.abs(33*down)/speed;
    if(right > 0) right = speed;
    else if(right < 0) right = -speed;
    if(down > 0) down = speed;
    else if(down < 0) down = -speed;
    var previousTime = Date.now();
    var playerImage = this;
    var callback = function(time){
        if(time - previousTime > 50 && i < maxIterations){
            that.bitmap.x = that.bitmap.x+right;
            that.bitmap.y = that.bitmap.y+down;
            ++i;
            stagePlayer.update();
            previousTime = Date.now();
        }else if(i >= maxIterations){
            if(that.bitmap.currentAnimation === "walkDown"){
                that.bitmap.gotoAndStop("standDown");
            }else if(that.bitmap.currentAnimation === "walkRight"){
                that.bitmap.gotoAndStop("standRight");
            }else if(that.bitmap.currentAnimation === "walkLeft"){
                that.bitmap.gotoAndStop("standLeft");
            }else{
                that.bitmap.gotoAndStop("standUp");
            }
            stagePlayer.update();
            playerImage.onAnimationEnd();
            return;
        }
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}

/**
 * Event listener, what to do when animation ends
 */
PlayerImage.prototype.onAnimationEnd = function(){}