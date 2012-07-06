/** Object used for setting up controls and input */
Controller = {
    initControls: function(){
        dGame.onmousedown = function(event){
            var currentX = event.clientX - dGame.offsetLeft;
            var currentY = event.clientY - dGame.offsetTop;
            var moved;
            dGame.onmousemove = function(e){
                var x = e.clientX - dGame.offsetLeft;
                var y = e.clientY - dGame.offsetTop;
                GameMap.move(x - currentX, y - currentY);
                currentX = x;
                currentY = y;
                moved = true;
            }
            dGame.onmouseup = function(){
                dGame.onmousemove = function(){};
                if(!moved){
                    Game.currentPlayer.action((GameMap.stageToGameMapCoords(currentX, currentY)));
                }
            }
        }
    }
}

