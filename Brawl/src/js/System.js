/**
 * Creates and hold the map
 */
Map = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {Object} map Map to parse
     */
    parseMap: function(map){
        //checking which tiles will be used
        var used = [];
        map.layers.forEach(function(i){
            if(i.name.indexOf("obj") != -1) return;
            for(var j in i.data){
                used[parseInt(i.data[j])] = true;
            }
        });
        map.tilesets.forEach(function(i){
            //checking if it's not the object layer
            if(i.name != "Objects"){
                var img = new Image();
                //needs change
                img.src = "graphics" + i.image.substring(11,i.image.length);
                //cutting the image
                img.onload = function(){
                    bitmapArray = [];
                    var index = parseInt(i.firstgid); //(SIC)
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = canvas.height = 32;
                    for(var y = 0; y < i.imageheight/32; ++y){
                        w:
                        for(var x = 0; x < i.imagewidth/32; ++x){
                            if(!used[index]){
                                ++index;
                                continue w;
                            }
                            canvas.width = canvas.height = 32;
                            context.drawImage(img, x * 32, y * 32, 32, 32, 0, 0, 
                                canvas.width, canvas.height);
                            var imgTemp = new Image();
                            imgTemp.src = canvas.toDataURL();
                            bitmapArray[index] = new Bitmap(imgTemp);
                            ++index;
                        }
                    }
                }
            }
        });
        if(this.onParsed) this.onParsed();
    },
    onParsed: null
}