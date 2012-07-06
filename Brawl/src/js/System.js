System = {
    /**
     * Loads the map
     * @param {string} map Name of the map to load
     */
    loadGame: function(map){
        GameMap.onParsed = function(){
            Painter.drawMap();
            Painter.loadImages();
            Game.players.push(new Player());
            Game.round();
        }
        System.initializeStages();
        Controller.initControls();
        GameMap.parseMap(map);
    },
    /**
     * Creates the stages used with EaselJS
     */
    initializeStages: function(){
        stageBaseMap = new Stage(canvasMapBase);
        stageMapFront = new Stage(canvasMapFront);
        stagePlayer = new Stage(canvasPlayer);
        stageMarker = new Stage(canvasMarker);
        containerGlobal = new Container();
        containerGlobal.addChild(stageBaseMap);
        containerGlobal.addChild(stageMapFront);
        containerGlobal.addChild(stagePlayer);
        containerGlobal.addChild(stageMarker);
        containerGlobal.scaleX = containerGlobal.scaleY = System.scale;
    },
    scale: 2
}

/**
 * Creates and hold the map
 */
GameMap = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {string} map Name of the map to parse
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
                    img.addEventListener('load', function(){
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
                    }, true);
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
                        var y = Math.floor(j / i.width);
                        var x = j % i.width
                        //init if not initialized
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].image = image;
                    }
                }else if(name === "dec"){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].decImage = image;
                    }
                }else if(name.indexOf("dec") !== -1){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].decFrontImage = image;
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
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(level >= 0 ) GameMap.map[y][x].level = level;
                    }
                    levUsed = true;
                }else if(name.indexOf("obj") !== -1){
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
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(!action) continue;
                        if(action === 'spawn'){
                            GameMap._spawnPoints.push(GameMap.map[y][x]);
                        }else if(action === 'item'){
                            
                        }else{
                            GameMap.map[y][x].action = action;
                            switch(action){
                                case 'walk' : GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createGreenSquare(x,y);
                                        var mark = GameMap.map[y][x].marker;
                                        mark.onClick = function(){
                                            console.log("lol");
                                            Game.currentPlayer.action('walk',
                                                x,y);
                                        }
                                        stageMarker.addChild(
                                            GameMap.map[y][x].marker);
                                        break;
                            }
                        }
                    }
                    objUsed = true;
                }
            });
            if(!levUsed) throw "Leveles layer not used";
            if(!objUsed) throw "Objects layer not used";
            if(GameMap._spawnPoints.length === 0) throw "No spawn points declared";
            if(GameMap.onParsed) GameMap.onParsed();
        }
    },
    /**
     * Moves the map by the specified vector
     * @param {number} x Vector x
     * @param {number} y Vector y
     */
    move: function(x,y){
        containerGlobal.x += x;
        containerGlobal.y += y;
        requestAnimationFrame(function(){
            stageBaseMap.update();
            stageMapFront.update();
            stagePlayer.update();
            stageMarker.update();
        });
    },
    /**
     * Moves the map to the specified coordinates
     * @param {number} x Coord x
     * @param {number} y Coord y
     */
    moveTo: function(x,y){
        containerGlobal.x = x;
        containerGlobal.y = y;
        requestAnimationFrame(function(){
            stageBaseMap.update();
            stageMapFront.update();
            stagePlayer.update();
            stageMarker.update();
        });
    },
    /**
     * Moves the map to specified (by coords) tile
     * @param {number} x Coord x
     * @param {number} y Coord y
     */
    showTile: function(x,y){
        var vec = GameMap.getVectors(x,y);
        GameMap.move(vec.x, vec.y);
    },
    /**
     * Shows by how much the map should be moved to show the tile (specified
     * by coords) in the middle of the map
     * @param {number} x Coord x
     * @param {number} y Coord y
     * @returns {object} Object with values x and y
     */
    getVectors: function(x,y){
        x = -containerGlobal.x - x*33*System.scale + canvasMapBase.width/2 - 32;
        y = -containerGlobal.y - y*33*System.scale + canvasMapBase.height/2 - 32;
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
                requestAnimationFrame(callback);
            }else return;
        }
        requestAnimationFrame(callback);
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
    /**
     * Returns one of the spawn points
     * @return {mapObject} A random spawn point
     */
    getASpawnPoint: function(){
        return GameMap._spawnPoints[Math.floor(
                Math.random()*GameMap._spawnPoints.length
            )];
    },
    /**
     * Converts stage coords to GameMap coords
     * @param {number} x Stage coord x
     * @param {number} y Stage coord y
     * @return {object} Object with x and y properties
     */
    stageToGameMapCoords: function(x,y){
        return {x: Math.floor((x - containerGlobal.x)/33/System.scale), 
            y: Math.floor((y - containerGlobal.y)/33/System.scale)};
    },
    map: [],
    tmxMap: null,
    onParsed: null,
    _spawnPoints: []
}

Game = {
    /**
     * Cycles through players and waits for their input
     */
    round: function(){
        var player = this.players[this.currentPlayerIndex];
        this.currentPlayer = player;
        player.takeTurn();
        ++this.currentPlayerIndex;
        if(this.currentPlayerIndex === this.players.length){
            this.currentPlayerIndex = 0;
        }
    },
    players: [],
    /** @type Player */
    currentPlayer: null,
    currentPlayerIndex: 0
}

/**
 * The player object, constructor automatically spawns it
 */
function Player(){
    /** @type PlayerImage */
    this.playerImage = new PlayerImage();
    this.x = 0;
    this.y = 0;
    this.shadowX = this.x;
    this.shadowY = this.y;
    this.actions = [];
    this.spawn();
    this.actionPoints = 3;
}

/**
 * Gets a random spawn point from GameMap and places the player image there
 * @param {number||object} [x] Coord x of where to spawn, or object with x and y 
 * properties
 * @param {number} [y] Coord y of where to spawn
 */
Player.prototype.spawn = function(x,y){
    if(!x){
        var spawnPoint = GameMap.getASpawnPoint();
        x = spawnPoint.x;
        y = spawnPoint.y;
    }else if(typeof x === "object"){
        y = x.y;
        x = x.x;
    }
    this.setX(x);
    this.setY(y);
    this.playerImage.placeAt(x, y);
}

/**
 * Sets the x coord of the player, and also it's shadow coord
 * @param {number} x Coord x
 */
Player.prototype.setX = function(x){
    this.x = x;
    this.shadowX = x;
}

/**
 * Sets the y coord of the player, and also it's shadow coord
 * @param {number} y Coord y
 */
Player.prototype.setY = function(y){
    this.y = y;
    this.shadowY = y;
}

/**
 * Moves the player by the numbers in parameters
 * @param {number||object} right By how many tiles to the right move. 1 is one 
 * tile, -1 is one tile to the left. Or object with right and down properties.
 * @param {number} [down] By how many tiles down move. 1 is one tile, -1 is
 * one tile to the up.
 */
Player.prototype.walk = function(right,down){
    if(typeof right === "object"){
        down = right.down;
        right = right.right;
    }
    this.setX(this.x + right);
    this.setY(this.y + down);
    this.playerImage.walk(right,down);
}

/**
 * Places the shadow at given coords with given direction fo looking
 * @param {number||object} x Coord x or object with x, y, and dir properties.
 * @param {number} [y] Coord y
 * @param {string} [dir] Direction the shadow should be facing
 */
Player.prototype.placeShadowAt = function(x,y,dir){
    this.playerImage.placeShadowAt(x,y,dir);
    this.shadowX = x;
    this.shadowY = y;
}

/**
 * Adds an action to be executed after all action points are used.
 * @param {string} type Type of action to be made, possible are: 'action'
 * @param {object[]} properties Array of values to be passed to functions 
 */
Player.prototype.addAction = function(type, properties){
    switch(type){
        case 'walk' :
            this.actions.push({actionType:type, 
                props:{right:properties[0], down:properties[1]}});
            break;
    }
}

/**
 * Playes the saved actions, then moves the map to the player's coords and 
 * continues the round.
 */
Player.prototype.playAction = function(){
    if(this.actions.length > 0){
        var action = this.actions.shift();
        this[action.actionType](action.props);
        var player = this;
        this.playerImage.onAnimationEnd = function(){
            player.playAction();
        }
    }else{
        GameMap.moveToTile(this.x, this.y);
        Game.round();
    }
}

/**
 * Function used to prepare the game to show all possible actions the player can
 * take.
 */
Player.prototype.takeTurn = function(){
    stageMarker.children.forEach(function(i){
        i.alpha = 0;
    });
    if(this.actionPoints <= 0){
        this.playAction();
        return;
    }
    var mark = GameMap.map[this.shadowY-1][this.shadowX-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY][this.shadowX-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY+1][this.shadowX-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY-1][this.shadowX].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY+1][this.shadowX].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY-1][this.shadowX+1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY][this.shadowX+1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.shadowY+1][this.shadowX+1].marker;
    if(mark) mark.alpha = 1;
    stageMarker.update();
}

/**
 * Used by controller to indicate, that player pressed the stage. Interprets the
 * coordinates into actions and saves them for later.
 * @param {number} x X GameMap coord
 * @param {number} y Y GameMap coord
 */
Player.prototype.action = function(x, y){
    if(this.actionPoints > 0){
        if(typeof x === "object"){
            y = x.y;
            x = x.x;
        }
        var action = GameMap.map[y][x].action;
        x = x - this.shadowX;
        y = y - this.shadowY;
        if(x >= -1 && x <= 1 && y >= -1 && y <= 1){
            switch(action){
                case 'walk' :
                    --this.actionPoints;
                    this.placeShadowAt(this.shadowX + x, 
                        this.shadowY + y, 'down');
                    this.addAction('walk', [x,y]);
                    this.takeTurn();
                    break;
            }
        }
    }
}

var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame ||  
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;
                        
if(!requestAnimationFrame){
    requestAnimationFrame = function(x){
        x(Date.now());
    };  
}