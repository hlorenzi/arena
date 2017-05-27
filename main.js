var canvas;
var ctx;
var WIDTH = 800;
var HEIGHT = 500;
var loopTimer;

var fighters = [];
var bboxDraw = false;

function Main()
{
	canvas = document.getElementById("canvasGame");
	ctx = canvas.getContext("2d");
	
	window.onkeydown = HandleKeyDown;
	window.onkeyup = HandleKeyUp;
	
	LoadAnimation(animMarthIdle);
	LoadAnimation(animMarthRun);
	LoadAnimation(animMarthStandardSlash);
	LoadAnimation(animMarthUpSlash);
	LoadAnimation(animMarthJump);
	LoadAnimation(animMarthFall);
	LoadAnimation(animMarthHit);
	LoadAnimation(animMarthFly);
	LoadAnimation(animMarthRecover);
	
	LoadAnimation(animSandbagIdle);
	LoadAnimation(animSandbagHit);
	LoadAnimation(animSandbagFly);
	LoadAnimation(animSandbagFall);
	LoadAnimation(animSandbagLand);
	LoadAnimation(animSandbagRecover);
	LoadAnimation(animHitParticle);
	
	loopTimer = setInterval(function() {Loop();}, 1000 / 60);
}


function Loop()
{
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	fighters.sort(function(a, b) {return a.y - b.y;});
	RepelFighters();
	for (var i = 0; i < fighters.length; i++)
	{
		fighters[i].Update();
		fighters[i].Draw();
	}
}

function ToggleBBox()
{
	bboxDraw = document.getElementById("checkBBox").checked;
}

function Reset()
{
	fighters = [];	
}

function ZeroDamage()
{
	for (var i = 0; i < fighters.length; i++)
	{
		fighters[i].damage = 0;
	}
}

function SpawnSandbag()
{
	fighters.push(new ObjFighterSandbag());	
}
	
function SpawnPlayer()
{
	var cpu = new ObjFighterMarth();
	fighters.push(cpu);
}

function SpawnCPU()
{
	var cpu = new ObjFighterMarth();
	cpu.input = new CPUInput(cpu);
	fighters.push(cpu);
}

function CheckBBox(f1, f2, fbox, mybox)
{
	if (f1.x + fbox.x1 <= f2.x + mybox.x2 &&
		f1.x + fbox.x2 >= f2.x + mybox.x1 &&
		f1.y + fbox.y1 <= f2.y + mybox.y2 &&
		f1.y + fbox.y2 >= f2.y + mybox.y1 &&
		f1.z + fbox.z1 <= f2.z + mybox.z2 &&
		f1.z + fbox.z2 >= f2.z + mybox.z1)
	{
		return true;
	}
	
	return false;
}

function RepelFighters()
{
	for (var j = 0; j < fighters.length; j++)
	{
		for (var i = 0; i < j; i++)
		{
			if (CheckBBox(fighters[i], fighters[j], fighters[i].bboxCharacter, fighters[j].bboxCharacter))
			{
				var dir = Direction(fighters[i].x, fighters[i].y, fighters[j].x, fighters[j].y);
				var dist = Math.max(20, Distance(fighters[i].x, fighters[i].y, fighters[j].x, fighters[j].y)) / 20;
				
				fighters[i].xSpeedCollision = Math.max(-10, fighters[i].xSpeedCollision - Math.cos(dir) * dist * 1);
				fighters[i].ySpeedCollision = Math.max(-10, fighters[i].ySpeedCollision - Math.sin(dir) * dist * 1);
				fighters[j].xSpeedCollision = Math.min(10, fighters[j].xSpeedCollision + Math.cos(dir) * dist * 1);
				fighters[j].ySpeedCollision = Math.min(10, fighters[j].ySpeedCollision + Math.sin(dir) * dist * 1);
			}
		}
	}
}

function CheckFightersDamage(me)
{
	var mybox = me.bboxCharacter;
	for (var i = 0; i < fighters.length; i++)
	{
		var f = fighters[i];
		var fbox = f.bboxAttack;
		
		if (fbox.damage <= 0 || f == me)
			continue;
		
		if (CheckBBox(f, me, fbox, mybox))
		{
			return f;
		}
	}	
	
	return null;
}

function DrawFightersCollision(me)
{
	if (!bboxDraw)
		return;
	
	ctx.strokeStyle = "blue";
	ctx.strokeRect(
		me.x + me.bboxCharacter.x1,
		me.y + me.bboxCharacter.y1 + me.z + me.bboxCharacter.z1,
		me.bboxCharacter.x2 - me.bboxCharacter.x1,
		me.bboxCharacter.y2 + me.bboxCharacter.z2 - me.bboxCharacter.y1 - me.bboxCharacter.z1);
	
	if (me.bboxAttack.damage > 0)
	{
		ctx.fillStyle = "red";
		ctx.fillRect(
			me.x + me.bboxAttack.x1,
			me.y + me.bboxAttack.y1 + me.z + me.bboxAttack.z1,
			me.bboxAttack.x2 - me.bboxAttack.x1,
			me.bboxAttack.y2 + me.bboxAttack.z2 - me.bboxAttack.y1 - me.bboxAttack.z1);
	}
}






var inputMode = 0
var keyLeft = false;
var keyRight = false;
var keyUp = false;
var keyDown = false;
var keyAttack = false;
var keyJump = false;


function HandleKeyDown(e)
{
	inputMode = 0;
	
	if (e.keyCode == 37)
		keyLeft = true;
	else if (e.keyCode == 38)
		keyUp = true;
	else if (e.keyCode == 39)
		keyRight = true;
	else if (e.keyCode == 40)
		keyDown = true;
	else if (e.keyCode == 90)
		keyAttack = true;
	else if (e.keyCode == 32)
		keyJump = true;
}

function HandleKeyUp(e)
{
	if (inputMode != 0)
		return;
		
	if (e.keyCode == 37)
		keyLeft = false;
	else if (e.keyCode == 38)
		keyUp = false;
	else if (e.keyCode == 39)
		keyRight = false;
	else if (e.keyCode == 40)
		keyDown = false;
	else if (e.keyCode == 90)
		keyAttack = false;
	else if (e.keyCode == 32)
		keyJump = false;
}

function SoundPlay(name, volume)
{
	var snd = document.getElementById(name);
	snd.currentTime = 0;
	snd.volume = volume;
	snd.playbackRate = 0.8 + Math.random() * 0.5;
	snd.play();
}

function SoundSetSpeed(name, speed)
{
	var snd = document.getElementById(name);
	snd.playbackRate = speed;
}

function SoundStop(name)
{
	var snd = document.getElementById(name);
	snd.currentTime = 0;
	snd.pause();
}

function Approach(from, to, step)
{
	if (from > to + step)
		return from - step;
	else if (from < to - step)
		return from + step;
	else
		return to;
}

function Min(a, b)
{
	if (a < b) return a;
	return b;
}

function Max(a, b)
{
	if (a > b) return a;
	return b;
}

function Clamp(x, a, b)
{
	if (x < a) return a;
	if (x > b) return b;
	return x;
}

function Distance(x1, y1, x2, y2)
{
	var xx = x2 - x1;
	var yy = y2 - y1;
	return Math.sqrt(xx * xx + yy * yy);
}

function Direction(x1, y1, x2, y2)
{
	var dir = Math.atan2(y2 - y1, x2 - x1);
	if (dir != dir)
		return 0;
	return dir;
}

function Interpolate_Linear(a, b, t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return a + (b - a) * t;
}

function Interpolate_Decelerate(t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return Math.sin(t * Math.PI / 2);
}

function Interpolate_Accelerate(t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return Math.sin(-Math.PI / 2 + t * Math.PI / 2) + 1;
}