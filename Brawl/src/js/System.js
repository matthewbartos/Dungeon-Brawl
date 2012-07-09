System = {
    /**
     * Loads the map
     * @param {string} map Name of the map to load
     */
    loadGame: function(map){
        GameMap.onParsed = function(){
            Painter.drawMap();
            Painter.loadImages();
            new Player();
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
            for(var y = 0; y < map.height; y++){
                GameMap.map[y] = [];
                for(var x = 0; x < map.width; x++){
                    GameMap.map[y][x] = new MapObject(x, y);
                }
            }
            var objUsed = false;
            var levUsed = false;
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("tile") !== -1){
                    for(var j in i.data){
                        var image = imageArray[i.data[j]];
                        var y = Math.floor(j / i.width);
                        var x = j % i.width;
                        if(image) GameMap.map[y][x].image = image;
                    }
                }else if(name.indexOf("decB") !== -1){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width;
                        if(image) {
                            GameMap.map[y][x].imageDecB.push(image);
                        }
                    }
                }else if(name.indexOf("decF") !== -1){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width;
                        if(image) GameMap.map[y][x].imageDecF = image;
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
                        x = j % i.width;
                        if(level >= 0 ) GameMap.map[y][x].level = level;
                    }
                    levUsed = true;
                }else if(name.indexOf("obj") !== -1){
                    var actions = ['walk',                    //0
                                    'fall',                   //1
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
                        x = j % i.width;
                        if(!action) continue;
                        if(action === 'spawn'){
                            GameMap._spawnPoints.push(GameMap.map[y][x]);
                        }else if(action === 'item'){
                            
                        }else{
                            GameMap.map[y][x].action = action;
                            switch(action){
                                case 'walk' : 
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createGreenSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'walk on uneven terrain' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createGreenSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'fall' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createBlueSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'fall right' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createBlueSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'fall left' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createBlueSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'die' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createBlackSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
                                    break;
                                case 'fall to death' :
                                    GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createBlackSquare(x,y);
                                    stageMarker.addChild(
                                        GameMap.map[y][x].marker);
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
                stageMapFront.addChild(text);
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
    /**
     * Gets the level of surface based on coords. If coords are not rounded, it
     * takes an avarage level between two tiles.
     * @param {number} x Coord x
     * @param {number} y Coord y
     * @return {number} Level of the surface
     */
    getLevelOf: function(x,y){
        var level;
        if(Math.floor(x) === x && Math.floor(y) === y){
            level = GameMap.map[y][x].level;
        }else{
            var level1 = GameMap.map[Math.floor(y)][Math.floor(x)].level;
            var level2 = GameMap.map[Math.ceil(y)][Math.ceil(x)].level;
            level = (level1 + level2)/2;
        }
        return level;
    },
    map: [],
    tmxMap: null,
    onParsed: null,
    _spawnPoints: []
}

/**
 * Objects used in GameMap.map
 * @contructor
 */
MapObject = function(x,y){
    this.image = null;
    this.x = x;
    this.y = y;
    this.action = null;
    this.imageDecB = [];
    this.imageDecF = [];
    this.level = 0;
}

/**
 * Checks if there is a character standing on this tile
 * @return {number} Index of the player that stands on this tile from
 * Game.players array, false if there's no one.
 */
MapObject.prototype.hasCharacter = function(){
        for(var i in Game.players){
            i = Game.players[i];
            if(i.x === this.x && i.y === this.y){
                return i.index;
            }
        }
        return false;
    }
Game = {
    /**
     * Cycles through players and waits for their input
     */
    round: function(){
        if(this.currentPlayerIndex === this.players.length){
            this.playAllActions();
            this.currentPlayerIndex = 0;
        }else{
            var player = this.players[this.currentPlayerIndex];
            this.currentPlayer = player;
            player.startRound();
            ++this.currentPlayerIndex;
        }
    },
    /**
     * Plays the actions taken by players
     */
    playAllActions: function(){
        var actionsPlayed = 0;
        function play(){
            for(var i in Game.players){
                Game.players[i].playAction();
                Game.players[i].playerImage.onAnimationEnd = function(){
                    Game.animated.push(true);
                }
            }
            ++actionsPlayed;
            var interval = setInterval(function(){
                if(Game.animated.length === Game.players.length){
                    clearInterval(interval);
                    Game.animated = [];
                    if(actionsPlayed < 3){
                        play();
                    }else{
                        Game.round();
                    }
                }
            },200);
        }
        play();
    },
    animated: [],
    players: [],
    /** @type Player */
    currentPlayer: null,
    currentPlayerIndex: 0
}

/**
 * The player object, constructor automatically spawns it and sets attributes
 */
function Player(){
    this.index = Game.players.length;
    Game.players.push(this);
    /** @type PlayerImage */
    this.playerImage = new PlayerImage();
    this.x = 0;
    this.y = 0;
    this.shadowX = this.x;
    this.shadowY = this.y;
    this.level = 0;
    this.shadowLevel = 0;
    this.actions = [];
    this.spawn();
    this.actionPoints = 0;
    this.setAttributes(30, 3);
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
    this.setCoords(x,y);
    this.playerImage.placeAt(x, y);
}

/**
 * Sets attributes for player
 * @param {number} hp Number of hit points
 * @param {number} def Number of defence points
 */
Player.prototype.setAttributes = function(hp, def){
	this.hitPts = hp;
	this.def = def;
}

/**
 * Sets the level of surface for both player and its shadow
 * @param {number} level The level to set.
 */
Player.prototype.setLevel = function(level){
    this.level = level;
    this.shadowLevel = level;
}

/**
 * Sets the x coord of the player, and also it's shadow coord
 * @param {number} x Coord x
 * @param {number} y Coord y
 */
Player.prototype.setCoords = function(x, y){
    this.x = x;
    this.shadowX = x;
    this.y = y;
    this.shadowY = y;
    this.setLevel(GameMap.getLevelOf(x,y));
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
    this.setCoords(this.x + right, this.y + down);
    this.playerImage.walk(right,down);
}

/**
 * Do nothing for the turn.
 */
Player.prototype.wait = function(){
    this.playerImage.onAnimationEnd();
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
    this.shadowLevel = GameMap.getLevelOf(x,y);
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
        case 'wait' :
            this.actions.push({actionType:type, props:null});
            break;
        case 'attackMelee' :
            this.actions.push({actionType:type, props:{player:properties[0],
                    dir:properties[1]}});
            break;
    }
}

/**
 * Makes the shadow show the action taken.
 * @param {number} index Index of the action to show from the Player.actions 
 * array
 */
Player.prototype.shadowAction = function(index){
    var action = this.actions[index];
    switch(action.actionType){
        case 'walk' :
            var x = action.props.right;
            var y = action.props.down;
            if(y > 0){
                this.placeShadowAt(this.shadowX + x, this.shadowY + y, 
                    'down');
            }else if(x > 0){
                this.placeShadowAt(this.shadowX + x, this.shadowY + y,
                    'right');
            }else if(x < 0){
                this.placeShadowAt(this.shadowX + x, this.shadowY + y, 
                    'left');
            }else{
                this.placeShadowAt(this.shadowX + x, this.shadowY + y, 
                    'up');
            }
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
    }
}

/**
 * Prepares the player to start the round.
 */
Player.prototype.startRound = function(){
    GameMap.showTile(this.x, this.y);
    this.actionPoints += 3;
    for(var i in this.actions){
        this.shadowAction(i);
    }
    this.takeTurn();
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
        this.playerImage.hideShadows();
        stageMarker.update();
        Game.round();
        return;
    }
    var y = this.shadowY-1;
    var x = this.shadowX-1;
    var mapObj = GameMap.map[y][x];
    var cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++y;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++y;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++x;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    y -= 2;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++x;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++y;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
    ++y;
    mapObj = GameMap.map[y][x];
    cha = mapObj.hasCharacter();
    if(cha !== false && cha !== this.index) stageMarker.addChild(
        Painter.easelShapes.createRedSquare(x,y,true));
    else if(mapObj.marker) mapObj.marker.alpha = 1;
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
        var right = x - this.shadowX;
        var down = y - this.shadowY;
        if(right >= -1 && right <= 1 && down >= -1 && down <= 1){
            var mapObj = GameMap.map[y][x];
            var cha = mapObj.hasCharacter();
            if(cha !== false && cha !== this.index){
                --this.actionPoints;
                var dir;
                if(down > 0){
                    dir = 'down'
                }else if(right > 0){
                    dir = 'right'
                }else if(right < 0){
                    dir = 'left';
                }else{
                    dir = 'up';
                }
                this.addAction('attackMelee', [Game.players[cha],dir]);
                this.shadowAction(this.actions.length-1);
                this.takeTurn();
            }else{
                var action = mapObj.action;
                var levelDifference = Math.floor(Math.abs(this.shadowLevel - 
                    mapObj.level));
                if(levelDifference){
                    this.actionPoints -= levelDifference;
                    this.addAction('wait');
                }
                switch(action){
                    case 'walk' :
                        --this.actionPoints;
                        this.addAction('walk', [right,down]);
                        this.shadowAction(this.actions.length-1);
                        this.takeTurn();
                        break;
                    case 'walk on uneven terrain' :
                        --this.actionPoints;
                        this.addAction('walk', [right,down]);
                        this.shadowAction(this.actions.length-1);
                        this.takeTurn();
                        break;
                }
            }
        }
    }
}

/**
FIGHT ENGINE
* 5 attack zones(at this moment only for distance): head, torso, hands, stomach, legs; every zone has its own damage multiplier
*/

/**
* Makes melee attack and deals damage to the opponent
* @param {Player} player Attacked player
* @param {string} dir Direction the bitmap should be facing
*/
Player.prototype.attackMelee = function (player,dir){
    if(typeof player === 'object'){
        dir = player.dir;
        player = player.player;
    }
    this.playerImage.attackMelee(dir);
    var dmg = Math.floor(Math.random()*10); //temporary, for tests
    player.dealDamage(dmg);
}
/**
* Makes distance attack and deals damage to the opponent
*/
Player.prototype.playerDistanceAttack = function() {
	var bodyZ =  1+(Math.floor(Math.random()*9)); //selecting body zone
	switch(bodyZ){
	case (1|| 2)://torso
		this.hitPts -= Math.floor((1,25 * (dmg - this.def)));
		break;
	case (3 || 4): //hands
		this.hitPts -= Math.floor((0,75 * (dmg - this.def)));
		break;
	case (5 || 6): //stomach
		this.hitPts -= Math.floor((1 * (dmg - this.def)));
		break;
	case (7 || 8): //legs
		this.hitPts -= Math.floor((1,25 * (dmg - this.def)));
		break;
	case (9): //head
		this.hitPts -= Math.floor((2 * (dmg - this.def)));
		break;
	default: console.log('Shot missed');
	}
}
/**
 * Deals damage to that player
 * @param {number} dmg How much damage should be dealt
 * @param {boolean} defence Whether to take defence into account
 */
Player.prototype.dealDamage = function(dmg, defence){
    if(defence) dmg -= this.def;
    this.hitPts -= dmg;
    if(this.hitPts <= 0){
        this.die();
    }
}

/**
 * Kills the character and makes the player pay the consequances
 */
Player.prototype.die = function(){
    this.playerImage.die();
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