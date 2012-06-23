/**
 * Creates and hold the map
 */
Map = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {Object} map Map to parse
     */
    parseMap: function(map){
        map.tilesets.forEach(function(i){
            //checking if it's not the object layer
            if(i.name != "Objects"){
                var img = new Image();
                //needs change
                img.src = "graphics" + i.image.substring(11,i.image.length);
                //cutting the image
                img.onload = function(){
                    imagePieces = [];
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = canvas.height = 32;
                    for(var y = 0; y < i.imageheight/32; ++y) {
                        for(var x = 0; x < i.imagewidth/32; ++x) {
                            canvas.width = canvas.height = 32;
                            context.drawImage(img, x * 32, y * 32, 32, 32, 0, 0, 
                            canvas.width, canvas.height);
                            imagePieces.push(canvas.toDataURL());
                        }
                    }
                }
            }
        });
    }
}