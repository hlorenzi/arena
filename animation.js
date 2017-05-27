var animMarthIdle = 			["Marth_Idle", 				31, 58, 	[0.1, 0.1, 0.1, 0.1, 0.1]];
var animMarthRun = 				["Marth_Run", 				31, 58, 	[0.1, 0.1, 0.1, 0.1, 0.1, 0.1]];
var animMarthStandardSlash = 	["Marth_StandardSlash", 	55, 58,		[0.1, 0.1, 0.1, 0.1]];
var animMarthUpSlash = 			["Marth_UpSlash",		 	59, 78,		[0.1, 0.1, 0.1, 0.1]];
var animMarthJump = 			["Marth_Jump",		 		16, 57,		[0.1]];
var animMarthFall = 			["Marth_Fall",		 		18, 72,		[0.1]];
var animMarthHit = 				["Marth_Hit",		 		17, 52,		[0.2]];
var animMarthFly = 				["Marth_Fly",		 		25, 41,		[0.1]];
var animMarthRecover = 			["Marth_Recover",		 	28, 20,		[0.1]];

var animSandbagIdle = 			["Sandbag_Idle",		 	8, 41,		[0.1]];
var animSandbagHit = 			["Sandbag_Hit",		 		8, 41,		[0.2]];
var animSandbagFly = 			["Sandbag_Fly",		 		17, 38,		[0.1, 0.1, 0.1, 0.1]];
var animSandbagFall = 			["Sandbag_Fall",		 	20, 37,		[0.1]];
var animSandbagLand = 			["Sandbag_Land",		 	20, 37,		[0.1]];
var animSandbagRecover = 		["Sandbag_Recover",	 		19, 42,		[0.4, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]];

var animHitParticle = 			["HitParticle",	 			11, 10,		[0.1]];

function LoadAnimation(arr)
{
	for (var i = 0; i < arr[3].length; i++)
	{
		var img = "<image id=\"id" + arr[0] + i + "\" src=\"assets/" + arr[0] + i + ".png\" display=\"none\">";
		document.getElementById("divImages").innerHTML += img;
	}
}

function AnimationController()
{
	this.currentAnim = null;
	this.time = 0;
	this.frame = 0;
	this.frameFrame = 0;
	this.speed = 1;
	this.ended = false;
}

AnimationController.prototype.Update = function()
{
	if (!this.currentAnim) return;
	
	this.frameFrame++;
	this.time += 1.0 / 60 * this.speed;
	while (this.time >= this.currentAnim[3][this.frame])
	{
		this.time -= this.currentAnim[3][this.frame];
		
		this.frameFrame = 0;
		this.frame++;
		if (this.frame >= this.currentAnim[3].length)
		{
			this.frame = 0;
			this.ended = true;
		}
	}
}

AnimationController.prototype.Play = function(anim)
{
	this.currentAnim = anim;
	this.time = 0;
	this.frame = 0;
	this.frameFrame = 0;
	this.speed = 1;
	this.ended = false;
}

AnimationController.prototype.SetSpeed = function(s)
{
	if (s >= 0)
		this.speed = s;
}

AnimationController.prototype.IsCurrent = function(anim)
{
	return this.currentAnim == anim;
}

AnimationController.prototype.Draw = function(x, y, sx, sy)
{
	if (!this.currentAnim) return;
	
	ctx.save();
	ctx.translate(
		Math.floor(x),
		Math.floor(y));
	ctx.scale(
		sx * 2,
		sy * 2);
	ctx.drawImage(document.getElementById("id" + this.currentAnim[0] + this.frame), -this.currentAnim[1], -this.currentAnim[2]);
	ctx.restore();
}