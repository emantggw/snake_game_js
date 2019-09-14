/*




			



							++==	+==	   ==+	===+  ++===+    |
							||__	|  \  /	 |	 __|  ||   |  __+__		 
							||		|	\/	 |	|  |  ||   |	|
							++==	|		 |	+==+  ||   |	|___

									Created at 2019/8/14
										   SNAKE GAME


*/
var cs = document.getElementById("can");
var home = {
	main: document.getElementById("home"),
	playbtn: document.getElementById("playbtn")
}
var game_over = {
	main: document.getElementById("game_over"),
	playagainbtn: document.getElementById("playagainbtn")

}

/*
Modes for modal
1==>Fadein home modal{play, about, licince}
2==>Fadeout home 
3==>Fadein gameover and fading play-again/exit
4==>Fadeout 
0==>Playing do nothing
*/

var modal = {
	fps: 20,
	timestep: 1000 / 20,
	starttime: 0,
	isset_start_time: false,
	dur: 1000,
	lastupdate: 0,
	mode: 1
};
var game = {
	fps: 60,//Frame persecond
	timestep: 1000 / 20,
	lastupdate: 0,
	mode: 0,//Ready to start,
	dev: "Emant"
};
var Design = function () {
	this.cols = 50;
	this.rows = 30;
	this.tilewidth = 20;
	this.tileheight = 20;
	this.x = innerWidth / 2 - (this.cols / 2) * this.tilewidth;
	this.y = innerHeight / 2 - (this.rows / 2) * this.tileheight;

}
const design = new Design();


function fade(opacity, mode) {
	var op = opacity / 1000 - modal.starttime / 1000;
	if (modal.mode == 1) {
		//Fadin home
		home.main.style.display = "block";
		home.main.style.opacity = op;
		home.playbtn.onclick = function () {
			modal.mode = 2;
			newgame();//Initialization new game
		}
	}
	if (modal.mode == 2) {
		//Fadeout home
		home.main.style.opacity = 1 - op;
		if (op >= 0.8)
			home.main.style.display = "none";
	}
	if (modal.mode == 3) {
		//Gameover is triggerd here after complited fading of gameover fadein
		game_over.main.style.display = "block";
		game_over.main.style.opacity = op;
		game_over.main.style.background = level.wall_color;//Hit wall color
		if (op >= 0.6) {
			game.mode = -1;//Cleanup memory
		}
		game_over.playagainbtn.onclick = function () {
			modal.mode = 4;
			newgame();
		}
	}
	if (modal.mode == 4) {
		//Fadeout home
		game_over.main.style.opacity = 1 - op;
		if (op >= 0.8)
			game_over.main.style.display = "none";
	}
}

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

window.addEventListener('keydown', this.key, false);
var keycode = 0;//right;
function key(e) {
	if (e.key == "ArrowDown") {
		keycode = 3;
	}
	if (e.key == "ArrowUp") {
		keycode = 1;
	}
	if (e.key == "ArrowRight") {
		keycode = 2;
	}
	if (e.key == "ArrowLeft") {
		keycode = 0;
	}
	// if (e.keyCode <= 40 && e.keyCode >= 37) {
	// 	keycode = e.keyCode - 37;
	// }
}
function range(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
function randColor() {
	var col = [[37, 218, 218], [37, 218, 37], [37, 37, 218], [224, 224, 31], [224, 31, 224], [224, 31, 31]];
	//return 'rgb('+Math.floor(Math.random()*1000%255)+','+Math.floor(Math.random()*1000%255)+','+Math.floor(Math.random()*1000%255)+')';
	var sel = col[Math.floor(Math.random() * col.length)];
	return 'rgb(' + sel[0] + ',' + sel[1] + ',' + sel[2] + ')';
}

var Level = function () {
	//Initialization
};

Level.prototype.init = function () {
	this.wall_color = randColor();
	this.columns = design.cols;
	this.rows = design.rows;
	this.tilewidth = design.tilewidth;
	this.tileheight = design.tileheight;
	this.x = design.x;
	this.y = design.y;
	this.tiles = [];//Level Tiles

	for (var i = 0; i < this.columns; i++) {
		this.tiles[i] = [];
		for (var j = 0; j < this.rows; j++) {
			if (i == 0 || i == this.columns - 1 || j == 0 || j == this.rows - 1) {
				this.tiles[i][j] = 1;
			} else {
				this.tiles[i][j] = 0;
			}
		}
	}
};
Level.prototype.draw = function () {
	for (var i = 0; i < this.columns; i++) {
		for (var j = 0; j < this.rows; j++) {
			if (this.tiles[i][j] == 1) {
				c.beginPath();
				c.fillStyle = this.wall_color;
				c.fillRect(this.x + i * level.tilewidth, this.y + j * level.tileheight, level.tilewidth, level.tileheight);
				c.closePath();
			}
			//GRID 
			// else{
			// 	c.beginPath();
			// 	c.strokeStyle = this.wall_color;
			// 	c.lineWidth = 0.1;
			// 	c.strokeRect(this.x+i*level.tilewidth, this.y+j*level.tileheight, level.tilewidth, level.tileheight);
			// 	c.closePath();

			// }
		}
	}
};

//=====Snake=======

var Snake = function () {
	//Initialization
}
Snake.prototype.directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];//Left, up, right, down
Snake.prototype.init = function () {
	this.x = range(4, level.columns / 2);//Ini col
	this.y = range(4, level.rows / 2);//Ini row
	this.segments = [];
	this.eat = false;
	this.game_over = false;
	this.segMax = 3;
	this.segInc = 0.0;
	this.color = randColor();
	this.tail = { x: this.x, y: this.y };
	this.key = 2;//Right
	for (var i = 0; i < 1; i++) {
		this.segments.push({ x: this.x - i * this.directions[keycode][0], y: this.y - i * this.directions[keycode][1] });
	}
};
Snake.prototype.nextMove = function () {
	//Avoid typing opposite keys to get distance
	//If a snake moving right, we shouldn't simply go to left by typing left key
	var nextx = this.x;
	var nexty = this.y;

	if (Math.abs(this.key - keycode) != 2) {
		//Not opposite each other
		this.key = keycode;
	}
	nextx += this.directions[this.key][0];
	nexty += this.directions[this.key][1];

	return { x: nextx, y: nexty };
};
Snake.prototype.update = function () {
	//before anything check game staus
	if (this.game_over) {
		//Game over, set game.mode = -1 after showing game over
		modal.mode = 3;
	}
	var nextmove = this.nextMove();
	this.x = nextmove.x;
	this.y = nextmove.y;

	//Save the last tail address, incase found something to eat
	this.tail.x = this.segments[this.segments.length - 1].x;
	this.tail.y = this.segments[this.segments.length - 1].y;

	//If the snake tries eat to it's own segment(HEAD tries it body or tail)
	for (var i = 1; i < this.segments.length; i++) {
		if (this.x == this.segments[i].x && this.y == this.segments[i].y) {
			this.game_over = true;
			break;
		}
	}
	//Check the snake collison with wall (HEAD hit to the walls)
	if (this.x >= 0 && this.x < level.columns && this.y >= 0 && this.y < level.rows) {
		if (level.tiles[this.x][this.y] == 1) {
			this.game_over = true;
		}
	}

	if (!this.game_over) {
		//Check this snake eat the rat
		if (level.tiles[this.x][this.y] == -1) {
			//Found
			this.eat = true;
			score.val++;
			//Fill the rat tile to empty
			level.tiles[this.x][this.y] = 0;
			//Re-locate rat
			rat.locate();
		}
		if (level.tiles[this.x][this.y] == 0) {
			//Move each segments
			for (var i = this.segments.length - 1; i > 0; i--) {
				this.segments[i].x = this.segments[i - 1].x;
				this.segments[i].y = this.segments[i - 1].y;
			}
			//Add segments at tail if eat something
			if (this.eat) {
				this.segments.push({ x: this.tail.x, y: this.tail.y });
				this.eat = false;
			}
			this.segments[0].x = this.x;
			this.segments[0].y = this.y;

		}
	}

};
Snake.prototype.draw = function () {
	for (var i = this.segments.length - 1; i >= 0; i--) {
		var col = this.segments[i].x;
		var row = this.segments[i].y;

		c.beginPath();
		c.fillStyle = this.color;
		c.arc(level.x + col * level.tilewidth + level.tilewidth / 2, level.y + row * level.tileheight + level.tileheight / 2, level.tilewidth / 2, 0, 2 * Math.PI, 0, false);
		c.fill();
		c.closePath();
	}
};
//======SCORE
var Score = function () {
	//Initialization
};
Score.prototype.init = function () {
	// body...
	this.val = 0;
	this.x = innerWidth * 0.08;
	this.y = innerHeight * 0.6;
};


Score.prototype.draw = function () {

	c.fillStyle = rat.color;
	c.beginPath();
	c.arc(this.x, this.y, 50, 0, Math.PI * 2, false);
	c.fill();
	c.closePath();

	c.fillStyle = "white";
	c.font = "bold 25pt TimesNewRoman";
	c.beginPath();
	c.fillText("Score", this.x - 40, this.y - 52);
	c.fillText(this.val, this.x - 10 * ((this.val + "").length), this.y + 10);
	c.closePath();
};
//FPS
var FPS = function () {
	//Initialization
	this.init();
};
FPS.prototype.init = function () {
	// body...
	this.x = innerWidth * 0.08;
	this.y = innerHeight * 0.3;
	this.lastupdate = 0.0;
	this.current_frames = 0;
	this.fps = 0;

};
FPS.prototype.draw = function () {

	c.fillStyle = "teal";
	c.beginPath();
	c.arc(this.x, this.y, 50, 0, Math.PI * 2, false);
	c.fill();
	c.closePath();

	c.fillStyle = "white";
	c.font = "bold 25pt TimesNewRoman";
	c.beginPath();
	c.fillText("FPS", this.x - 30, this.y - 52);
	c.fillText(Math.floor(this.fps), this.x - 8 * (Math.floor(this.fps) + "").length, this.y + 10);
	c.closePath();
};
//DEV
var Dev = function () {
	//Initialization
	this.init();
};
Dev.prototype.init = function () {
	// body...
	this.x = (design.cols * design.tilewidth + design.x) * 0.85;
	this.y = (design.rows * design.tileheight + design.y) * 0.85;
};
Dev.prototype.draw = function () {

	c.fillStyle = "rgba(110,110, 34, 0.2)";
	c.font = "bold 35pt Impact";
	c.beginPath();
	c.fillText(game.dev, this.x, this.y);
	c.closePath();
};

//======RAT
var Rat = function () {
	//Initialization
};

Rat.prototype.init = function () {
	this.x = range(1, level.columns - 2);
	this.y = range(1, level.rows - 2);
	this.eated = false;
	this.color = randColor();
	snake.color = this.color;//the same as rat
	this.locate();
};
Rat.prototype.locate = function () {
	//AI checking the postion of snake 
	//Make it Rat faraway 
	//Checking snack postion
	for (var i = 0; i < snake.segments.length; i++) {
		if (this.x == snake.segments[i].x || this.y == snake.segments[i].y || level.tiles[this.x][this.y] == 1) {
			this.x = range(1, level.columns - 2);
			this.y = range(1, level.rows - 2);
		}
	}
	//After located apropriate postion we have to reserve that location
	level.tiles[this.x][this.y] = -1;
};
Rat.prototype.draw = function () {
	c.beginPath();
	c.fillStyle = this.color;
	c.arc(level.x + this.x * level.tilewidth + level.tilewidth / 2, level.y + this.y * level.tileheight + level.tileheight / 2, level.tilewidth / 2, 0, Math.PI * 2, false);
	c.fill();
	c.closePath();

};

var level = new Level();
var snake = new Snake();
var rat = new Rat();
var score = new Score();
var fps = new FPS();
var dev = new Dev();

function newgame() {
	keycode = 2;
	game.mode = 1;//Comman Start playing
	game.lastupdate = 0;
	level.init();
	snake.init();
	rat.init();
	score.init();
	main(0);//Starting main;

}

function main(timestamp) {
	c.clearRect(0, 0, innerWidth, innerHeight);


	if (timestamp - game.lastupdate >= game.timestep && game.mode == 1) {
		//Update the snake only it's live moving/playing
		snake.update();
		game.lastupdate = timestamp;
	}

	if (game.mode == 1 || game.mode == -1) {
		/*
		========NOTE====
		Snake draw and other drawing is running under normal circemstance
		which means they running 60fps, but only update snake address by specified fps,
		so the the snake draw function keep catch it's postion till update is called. One thing here is
		as i said we only want to limit snake speed not snake drawing or level, rat, score... thats why
		i let them to draw max fps
		=========
		*/
		//Show game grahic in playing and even faild also
		level.draw();
		rat.draw();
		score.draw();
		snake.draw();
	}

	//User interacting
	if (modal.mode != 0 && timestamp - modal.lastupdate >= modal.timestep) {
		//Welcome 
		modal.starttime = modal.isset_start_time ? modal.starttime : timestamp;//Setting start time
		modal.isset_start_time = true;//Set in each iteration to keep start time
		fade(timestamp, modal.mode);//Call the method to fade/inout whatever modal
		modal.lastupdate = timestamp;//Save the last timestamp

		if (timestamp - modal.starttime > modal.dur) {
			//The timestamp reached the duration
			//Update keys
			modal.isset_start_time = false;
			modal.mode = 0;
		}
	}

	//Calculating and displaying FPS 
	if (timestamp > fps.lastupdate + 1000) {
		//Update every seconds
		fps.fps = 0.25 * fps.current_frames + (1 - 0.25) * fps.fps;
		//Compute FPS
		//save lastupdate
		fps.lastupdate = timestamp;
		//Set current to zero
		fps.current_frames = 0
	}
	fps.current_frames++;
	fps.draw();
	dev.draw();

	if (game.mode != -1) {
		// Only when the game is playing the main animation is looping
		// Otherwise to save system terminate it
		window.requestAnimationFrame(main);
	}
}
main(0);
