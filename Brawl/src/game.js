
window.onload = function() {
        stage = new Kinetic.Stage({
          container: "canvas",
          width: 700,
          height: 700
        });
		
		var arr = [];
		
		var layerMove = new Kinetic.Layer();
		var layerStay = new Kinetic.Layer();
		
		for(var i = 0; i < 700; i+=10){
			arr[arr.length] = new Kinetic.Rect({
				x:i,
				y:i,
				width:10,
				height:10,
				fill:'black'
			});
			layerMove.add(arr[arr.length-1]);
		}
		
		for(var i = 0; i < 700; i+=10){
			arr[arr.length] = new Kinetic.Circle({
				x:i,
				y:700-i,
				radius:10,
				fill:'black'
			});
			layerMove.add(arr[arr.length-1]);
		}
		
		for(i = 700; i >= 0; i-=10){
			layerStay.add(new Kinetic.Rect({
				x:i,
				y:700-i,
				width:10,
				height:10,
				fill:'black'
			}));
		}
		
		for(var i = 0; i < 700; i+=10){
			layerStay.add(new Kinetic.Circle({
				x:i,
				y:i,
				radius:10,
				fill:'black'
			}));
		}
		
		stage.add(layerStay);
		stage.add(layerMove);
		
		function move(){
			for(i = 0; i < arr.length; i++){
				if(arr[i].getX() > 0){
					if(i == 69){
						console.timeEnd("f");
						console.time("f");
					}
					arr[i].setX(-10);
				}
				else arr[i].move(1,0);
			}
			layerMove.draw();
			mozRequestAnimationFrame(move);
		}
		mozRequestAnimationFrame(move);
      };