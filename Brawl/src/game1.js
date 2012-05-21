
window.onload = function() {
        stage = new Stage(document.getElementById("canvas"));
		stage1 = new Stage(document.getElementById("canvas1"));
		
		var arr = [];
		
		var g = new Graphics();
		g.beginFill(Graphics.getRGB(0,0,0)).drawRect(0,0,10,10);
		
		for(var i = 0; i < 700; i+=10){
			(function(){
			var s = new Shape(g);
			s.x = i;
			s.y = i;
			arr[arr.length] = s;
			stage.addChild(s);
			stage.update();
			})();
		}
		
		var g1 = new Graphics();
		g1.beginFill(Graphics.getRGB(0,0,0)).drawCircle(0,0,10);
		
		for(var i = 0; i < 700; i+=10){
			(function(){
			var s = new Shape(g1);
			s.x = i;
			s.y = 700-i;
			arr[arr.length] = s;
			stage.addChild(s);
			stage.update();
			})();
		}
		
		for(i = 700; i >= 0; i-=10){
			(function(){
			var s = new Shape(g);
			s.x = i;
			s.y = 700-i;
			stage1.addChild(s);
			stage1.update();
			})();
		}
		
		for(var i = 0; i < 700; i+=10){
			(function(){
			var s = new Shape(g1);
			s.x = i;
			s.y = i;
			stage1.addChild(s);
			stage1.update();
			})();
		}
		
		function move(){
			for(i = 0; i < arr.length; i++){
				if(arr[i].x > 700){
					if(i == 69){
						console.timeEnd("f");
						console.time("f");
					}
					arr[i].x = -10;
				}else arr[i].x += 1;
			}
			stage.update();
			mozRequestAnimationFrame(move);
		}
		mozRequestAnimationFrame(move);
      };