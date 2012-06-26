/**
 * Creates and hold the map
 */
GameMap = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {Object} map Map to parse
     */
    parseMap: function(map){
        this.tmxMap = map;
        //checking which tiles will be used
        var used = [],
        usedCount = 0,
        loadedCount = 0;
        map.layers.forEach(function(i){
            var name = i.name;
            if(name.indexOf("obj") != -1 || name.indexOf("lev") != -1) return;
            for(var j in i.data){
                if(!used[parseInt(i.data[j])] && i.data[j] != 0){
                    used[parseInt(i.data[j])] = true;
                    ++usedCount;
                }
            }
        });
        var imageArray = [];
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
                            if(loadedCount === usedCount) onImagesLoaded();
                        }
                        imageArray[index] = imgTemp;
                        ++index;
                    }
                }
            }
        });
        function onImagesLoaded(){
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("tile") !== -1){
                    for(var j in i.data){
                        var image = imageArray[i.data[j]];
                        var x = Math.floor(j / i.width);
                        var y = j % i.width
                        if(!GameMap.map[x]) GameMap.map[x] = [];
                        if(!GameMap.map[x][y]){
                            GameMap.map[x][y] = {};
                        } 
                        if(image) GameMap.map[x][y].image = image;
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
                        if(image) GameMap.map[x][y].decImage = image;
                    }
                }
            });
            if(GameMap.onParsed) GameMap.onParsed();
        }
    },
    draw: function(){
        if(!this.tmxMap) throw "no map parsed";
        var map = this.map;
        for(var y = 0; y < map.length; y++){
            console.log("lol");
            for(var x = 0; x <  map[y].length; x++){
                if(map[y][x].image){
                    var btm = new Bitmap(map[y][x].image);
                    btm.y = y*32;
                    btm.x = x*32;
                    mapBaseStage.addChild(btm);
                    mapBaseStage.update();
                }
                if(map[y][x].decImage){
                    btm = new Bitmap(map[y][x].decImage);
                    btm.y = y*32;
                    btm.x = x*32;
                    mapBaseStage.addChild(btm);
                    mapBaseStage.update();
                }
            }
        }
    },
    map: [],
    tmxMap: null,
    onParsed: null
}


function initializeStages(){
    mapBaseStage = new Stage(canvasMapBase);
}