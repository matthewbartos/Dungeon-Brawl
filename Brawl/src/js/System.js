/**
 * Creates and hold the map
 */
GameMap = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {Object} map Map to parse
     */
    parseMap: function(map){
        console.time("map load");
        var imageArray = [];
        //getting the JSON file
        var x = new XMLHttpRequest();
        x.open("GET", "maps/" + map + ".json", true);
        x.overrideMimeType("application/json");
        x.send(null);
        var JSONparsed = false;
        x.onreadystatechange = function(){
            if(x.responseText != "" && !JSONparsed){
                map = JSON.parse(x.responseText);
                _continueMapParse1();
                JSONparsed = true;
            }
        }
        /**
         * Cutting the images in pieces
         */
        function _continueMapParse1(){
            GameMap.tmxMap = map;
            //checking which tiles will be used and how many of them are there
            var used = [],
            usedCount = 0,
            loadedCount = 0;
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("obj") != -1 || name.indexOf("lev") != -1) return;
                for(var j in i.data){
                    //console.log(i.data[j], !used[parseInt(i.data[j])]);
                    if(!used[parseInt(i.data[j])] && i.data[j] != 0){
                        used[parseInt(i.data[j])] = true;
                        ++usedCount;
                    }
                }
            });
            map.tilesets.forEach(function(i){
                //checking if it's not the object or levels layer
                if(i.name != "Objects" && i.name != "Levels"){
                    var img = new Image();
                    //needs change
                    img.src = "graphics" + i.image.substring(11,i.image.length);
                    //cutting the image
                    var index = parseInt(i.firstgid); //(SIC)
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = canvas.height = 32;
                    for(var y = 0; y < i.imageheight/32; y++){
                        w:
                        for(var x = 0; x < i.imagewidth/32; x++){
                            if(!used[index]){
                                ++index;
                                continue w;
                            }
                            canvas.width = canvas.height = 32;
                            context.drawImage(img, x * 32, y * 32, 32, 32, 0, 0,
                                canvas.width, canvas.height);
                            var imgTemp = new Image();
                            imgTemp.src = canvas.toDataURL();
                            imgTemp.onload = function(){
                                ++loadedCount;
                                //checking if all images are loaded
                                if(loadedCount === usedCount) _continueMapParse2();
                            }
                            imageArray[index] = imgTemp;
                            ++index;
                        }
                    }
                }
            });

        }
        /**
         * Adding the images and other properties to the GameMap.map array of
         * objects
         */
        function _continueMapParse2(){
            var objUsed = false;
            var levUsed = false;
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("tile") !== -1){
                    for(var j in i.data){
                        var image = imageArray[i.data[j]];
                        var x = Math.floor(j / i.width);
                        var y = j % i.width
                        //init if not initialized
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        }
                        if(image) GameMap.map[x][y].image = image;
                    }
                }else if(name === "dec"){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        x = Math.floor(j / i.width);
                        y = j % i.width
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        }
                        if(image) GameMap.map[x][y].decImage = image;
                    }
                }else if(name.indexOf("dec") !== -1){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        x = Math.floor(j / i.width);
                        y = j % i.width
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        }
                        if(image) GameMap.map[x][y].decFrontImage = image;
                    }
                }else if(name === "lev"){
                    var firstgrid = 0;
                    var tilesets = GameMap.tmxMap.tilesets
                    for(j in tilesets){
                        if(tilesets[j].name === "Levels"){
                            firstgrid = tilesets[j].firstgid; //(SIC)
                        }
                    }
                    if(!firstgrid) return;
                    for(j in i.data){
                        //because 0 - 1, 1 - 1.5, 2 - 2 and so on
                        var level = (i.data[j] - firstgrid) / 2 + 1;
                        x = Math.floor(j / i.width);
                        y = j % i.width
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        }
                        if(level >= 0 ) GameMap.map[x][y].level = level;
                    }
                    levUsed = true;
                }else if(name === "obj"){
                    var actions = ['walk',                    //0
                                    'jump',                   //1
                                    'fall right',             //2
                                    'climb ladder',           //3
                                    'fall left',              //4
                                    'die',                    //5
                                    'fall to death',          //6
                                    'walk',                   //7
                                    null,                     //8
                                    'item',                   //9
                                    'walk on uneven terrain', //10
                                    'spawn'];                 //11
                    firstgrid = 0;
                    tilesets = GameMap.tmxMap.tilesets
                    for(j in tilesets){
                        if(tilesets[j].name === "Objects"){
                            firstgrid = parseInt(tilesets[j].firstgid); //(SIC)
                        }
                    }
                    if(!firstgrid) return;
                    for(j in i.data){
                        var action = actions[i.data[j] - firstgrid];
                        x = Math.floor(j / i.width);
                        y = j % i.width
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        }
                        if(action === 'spawn'){
                            GameMap._spawnPoints.push(GameMap.map[x][y]);
                        }
                        GameMap.map[x][y].action = action;
                    }
                    objUsed = true;
                }
            });
            if(!levUsed) throw "Leveles layer not used";
            if(!objUsed) throw "Objects layer not used";
            if(GameMap._spawnPoints.length === 0) throw "No spawn ponts declared";
            if(GameMap.onParsed) GameMap.onParsed();
        }
    },
    /**
     * Draws the map on the canvases
     */
    draw: function(){
        if(!this.tmxMap) throw "no map parsed";
        var map = this.map;
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
            g.moveTo(0, y*33).lineTo(this.tmxMap.width*33, y*33);
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
                    containerMapBack.addChild(btm);
                    delete map[y][x].decFrontImage;
                }
                if(y == 0) g.moveTo(x*33, 0).lineTo(x*33, this.tmxMap.height*33);
            }
        }
        //drawing the final lines of the grid
        g.moveTo(0, y*33).lineTo(this.tmxMap.width*33, y*33).moveTo(x*33, 0)
            .lineTo(x*33, this.tmxMap.height*33);
        containerMapBack.addChild(new Shape(g));
        stageMapFront.update();
        stageBaseMap.update();
        console.timeEnd("map load");
    },
    /**
     * Moves the map to the specified coordinates
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    move: function(x,y){
        containerMapBack.x += x;
        containerMapBack.y += y;
        containerMapFront.x += x;
        containerMapFront.y += y;
        stageBaseMap.update();
        stageMapFront.update();
    },
    /**
     * Moves the map to specified (by coords) tile
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    showTile: function(x,y){
        var vec = GameMap.getVectors(x,y);
        GameMap.move(vec.x, vec.y);
    },
    /**
     * Shows by how much the map should be moved to show the tile (specified
     * by coords) in the middle of the map
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     * @returns {Object} Object with values x and y
     */
    getVectors: function(x,y){
        x = -containerMapBack.x - x*33 + canvasMapBase.width/2 - 32;
        y = -containerMapBack.y - y*33 + canvasMapBase.height/2 - 32;
        return {x: x, y:y}
    },
    /**
     * Moves the map with a fluid motion
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    moveToTile: function(x,y){
        var i = 1;
        var time = 80;
        var vec = GameMap.getVectors(x, y);
        x = vec.x;
        y = vec.y;
        var tet = time*(time-1)*(time+1)/6
        function callback(){
            if(i < time){
                GameMap.move(x*(time-i)*i/tet, y*(time-i)*i/tet);
                ++i;
                mozRequestAnimationFrame(callback);
            }else return;
        }
        mozRequestAnimationFrame(callback);
    },
    /**
     * Shows levels of each tile in its top right corner, for debug
     */
    _showLevels: function(){
        for(var y = 0; y < GameMap.map.length; y++){
            for(var x = 0; x < GameMap.map[y].length; x++){
                var text = new Text(GameMap.map[y][x].level);
                text.y = y*33+10;
                text.x = x*33+24;
                containerMapFront.addChild(text);
            }
        }
        stageMapFront.update();
    },
    getASpawnPoint: function(){
        return GameMap._spawnPoints[Math.floor(
                Math.random()*GameMap._spawnPoints.length
            )];
    },
    map: [],
    tmxMap: null,
    onParsed: null,
    _spawnPoints: []
}

/**
 * Creates the stages used with EaselJS
 */
function initializeStages(){
    stageBaseMap = new Stage(canvasMapBase);
    stageMapFront = new Stage(canvasMapFront);
}

/**
 * The player object
 */

function Player(){
    
}

Player.prototype.spawn = function(){
    var spawnPoint = GameMap.getASpawnPoint();
}