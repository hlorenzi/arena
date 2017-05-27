function ObjFighterMarth()
{
	this.state = ObjFighterMarth.prototype.StateIdle;
	
	this.bboxCharacter = {x1: -15, x2: 15, y1: -15, y2: 15, z1: -60, z2: 0};
	this.bboxAttack = {damage: 0, x1: -10, x2: 10, y1: -10, y2: 10, z1: -60, z2: 0};
	
	this.anim = new AnimationController();
	this.anim.Play(animMarthIdle);
	
	this.animHitParticle = new AnimationController();
	this.animHitParticle.Play(animHitParticle);
	this.hitX = 0;
	this.hitY = 0;
	
	this.x = 100 + Math.random() * (WIDTH - 200);
	this.y = 100 + Math.random() * (HEIGHT - 200);
	this.z = 0;
	
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.zSpeed = 0;
	
	this.xSpeedCollision = 0;
	this.ySpeedCollision = 0;
	
	this.damage = 0;
	this.jumping = false;	
	this.side = 1;
	this.landSpeed = 0;
	this.onRecover = false;
	this.lastTimeHit = 0;
	
	this.input = new HumanInput(this);
	this.inputMoveX = 0;
	this.inputMoveY = 0;
	this.inputJump = false;
	this.inputAttack = false;
}

ObjFighterMarth.prototype.Update = function()
{
	this.anim.Update();
	this.input.Update();
	this.state();
}

ObjFighterMarth.prototype.Draw = function()
{
	var cx = 0;
	var cy = 0;
	var t = 0.2 - this.anim.time;
	if (this.state == this.StateHit)
	{
		cx = Math.random() * t * 100;
		cy = Math.random() * t * 100;
	}
	
	ctx.save();
	ctx.translate(this.x + cx, this.y + cy);
	ctx.scale(1, 0.2);
	if (!this.input.cpu)
	{
		ctx.beginPath();
		ctx.arc(0, 0, 45, 0, Math.PI * 2);
		ctx.fillStyle = "blue";
		ctx.fill();		
	}
	ctx.beginPath();
	ctx.arc(0, 0, 40, 0, Math.PI * 2);
	ctx.fillStyle = "gray";
	ctx.fill();
	ctx.restore();
	
	this.anim.Draw(this.x + cx, this.y + this.z + cy, this.side, 1);
	
	if (this.state == this.StateHit)
	{
		this.animHitParticle.Draw(this.x + this.hitX - 5 + Math.random() * 10, this.y + this.z + this.hitY - 5 + Math.random() * 10,
			Math.random() * 0.2 + this.anim.time * 4, Math.random() * 0.2 + this.anim.time * 4);
	}
	
	DrawFightersCollision(this);
	
	ctx.fillStyle = "black";
	ctx.font = "20px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("" + this.damage + "%", this.x, this.y + this.z - 140);
	ctx.restore();
	
	if (this.input.Draw)
		this.input.Draw();
}










ObjFighterMarth.prototype.HandlePhysics = function()
{	
	this.zSpeed += 0.75;
	
	this.x += this.xSpeed + this.xSpeedCollision;
	this.y += this.ySpeed + this.ySpeedCollision;
	this.z += this.zSpeed;
	
	this.xSpeedCollision = Approach(this.xSpeedCollision, 0, 0.5);
	this.ySpeedCollision = Approach(this.ySpeedCollision, 0, 0.5);
	
	if ((this.x > WIDTH - 100 && this.xSpeed > 0) || (this.x < 100 && this.xSpeed < 0))
		this.xSpeed *= -1;
	if ((this.y > HEIGHT - 100 && this.ySpeed > 0) || (this.y < 100 && this.ySpeed < 0))
		this.ySpeed *= -1;
		
	if (this.x > WIDTH - 100) this.x = WIDTH - 100;
	if (this.x < 100) this.x = 100;
	if (this.y > HEIGHT - 100) this.y = HEIGHT - 100;
	if (this.y < 100) this.y = 100;
	
	if (this.z >= 0)
	{
		this.landSpeed = this.zSpeed;
		if (this.zSpeed > 2)
			SoundPlay("sndLand1", 1);
		this.z = 0;
		this.zSpeed = 0;
	}
		
	if (this.jumping)
	{
		if (this.zSpeed > 0)
			this.jumping = false;
			
		if (!this.inputJump)
		{
			this.jumping = false;
			this.zSpeed *= 0.5;
		}
	}
			
	if (this.bboxAttack.hit)
		this.lastTimeHit = 0;
	else if (!this.bboxAttack.hit && this.bboxAttack.damage > 0)
		this.lastTimeHit--;
	
	this.bboxAttack = {damage: 0};
	
}

ObjFighterMarth.prototype.HandleMovement = function()
{	
	this.xSpeed = Approach(this.xSpeed, this.inputMoveX * 7, 0.5);
	this.ySpeed = Approach(this.ySpeed, this.inputMoveY * 7, 0.5);

	if (this.inputMoveX != 0)
		this.side = (this.inputMoveX > 0 ? 1 : -1);
}

ObjFighterMarth.prototype.HandleStop = function()
{
	this.xSpeed = Approach(this.xSpeed, 0, 0.5);
	this.ySpeed = Approach(this.ySpeed, 0, 0.5);
}

ObjFighterMarth.prototype.HandleJump = function()
{
	if (this.inputJump && this.z == 0)
	{
		SoundPlay("sndJump1", 1);
		this.jumping = true;
		this.zSpeed = -14;
	}
}

ObjFighterMarth.prototype.HandleDamage = function()
{
	var dmg = CheckFightersDamage(this);
	if (dmg)
	{
		this.state = this.StateHit;
		this.anim.Play(animMarthHit);
		this.damage += dmg.bboxAttack.damage;
		
		var dir = Direction(dmg.x, dmg.y, this.x, this.y);
		
		this.xSpeed = dmg.bboxAttack.groundSpeed * 0.1 * Math.cos(dir) * this.damage;
		this.ySpeed = dmg.bboxAttack.groundSpeed * 0.1 * Math.sin(dir) * this.damage;
		this.z += Math.max(-20, dmg.bboxAttack.flySpeed * 0.1 * this.damage);
		this.zSpeed = Math.max(-20, dmg.bboxAttack.flySpeed * 0.1 * this.damage);
		
		this.side = (this.xSpeed < 0 ? 1 : -1);
		//this.hitX = -10 + Math.random() * 20;
		//this.hitY = -80 + Math.random() * 60;
		
		dmg.bboxAttack.hit = true;
		
		SoundPlay("sndDamage1", 1);
		SoundPlay("sndDamage2", 1);
		return true;
	}
	return false;
}

ObjFighterMarth.prototype.StateIdle = function()
{
	this.HandlePhysics();
	this.HandleMovement();
	this.HandleJump();
	if (this.HandleDamage()) return;
	
	if (this.z != 0)
	{
		if (this.zSpeed < 0 && !this.anim.IsCurrent(animMarthJump))
			this.anim.Play(animMarthJump);
			
		if (this.zSpeed > 0 && !this.anim.IsCurrent(animMarthFall))
			this.anim.Play(animMarthFall);
	}
	else if (this.xSpeed != 0 || this.ySpeed != 0)
	{
		if (!this.anim.IsCurrent(animMarthRun))
			this.anim.Play(animMarthRun);
			
		this.anim.Speed = 1 + Distance(0, 0, this.xSpeed, this.ySpeed) * 0.5;
	}
	else
	{
		if (!this.anim.IsCurrent(animMarthIdle))
			this.anim.Play(animMarthIdle);
	}
	
	if (this.inputAttack)
	{
		this.inputAttack = false;
		this.state = this.StateAttack;
		this.anim.Play(animMarthStandardSlash);
		SoundPlay("sndSwing2", 1);
		switch(Math.floor(Math.random() * 5))
		{
			case 0: SoundPlay("sndMarth1", 1); break;
			case 1: SoundPlay("sndMarth2", 1); break;
			case 2: SoundPlay("sndMarth3", 1); break;
		}
	}

}

ObjFighterMarth.prototype.StateAttack = function()
{
	this.HandlePhysics();
	this.HandleStop();
	if (this.HandleDamage()) return;

	if (this.anim.frame == 1 && this.anim.frameFrame == 0)
		if (this.side > 0)
			this.bboxAttack = {damage: 5, groundSpeed: 1, flySpeed: -1, x1: 20, x2: 90, y1: -30, y2: 30, z1: -60, z2: 0};
		else
			this.bboxAttack = {damage: 5, groundSpeed: 1, flySpeed: -1, x1: -90, x2: -20, y1: -30, y2: 30, z1: -60, z2: 0};

	if (this.anim.ended)
	{
		this.state = this.StateIdle;
		this.anim.Play(animMarthIdle);
	}
	else if (this.inputAttack && this.anim.frame >= 2)
	{
		this.inputAttack = false;
		
		if (this.anim.IsCurrent(animMarthStandardSlash))
			this.anim.Play(animMarthUpSlash);
		else
			this.anim.Play(animMarthStandardSlash);
		
		SoundPlay("sndSwing2", 1);
	}
}

ObjFighterMarth.prototype.StateHit = function()
{
	this.HandleDamage();
	
	if (this.anim.ended)
	{
		switch(Math.floor(Math.random() * 3))
		{
			case 0: SoundPlay("sndMarth4", 1); break;
			case 1: SoundPlay("sndMarth5", 1); break;
			case 2: SoundPlay("sndMarth6", 1); break;
		}		
		
		if (Distance(0, 0, this.xSpeed, this.zSpeed) > 4)
		{
			this.state = this.StateFly;
			this.anim.Play(animMarthFly);	
		}
		else
		{
			this.state = this.StateIdle;
			this.anim.Play(animMarthIdle);
		}
	}
}

ObjFighterMarth.prototype.StateFly = function()
{
	this.HandlePhysics();
		
	if (this.z == 0)
	{
		if (this.landSpeed > 4 || Distance(0, 0, this.xSpeed, this.ySpeed) > 7)
		{
			SoundPlay("sndLand2", 1);
			this.anim.Play(animMarthRecover);
			this.zSpeed = this.landSpeed * (-0.4);
			this.xSpeed *= 0.7;
			this.ySpeed *= 0.7;
		}
		else
		{
			this.state = this.StateRecover;
			this.anim.Play(animMarthRecover);
		}
	}
}

ObjFighterMarth.prototype.StateRecover = function()
{
	this.HandlePhysics();
	this.HandleStop();
	this.HandleJump();
	
	this.onRecover = true;
	
	if (this.jumping)
	{
		this.onRecover = false;
		this.state = this.StateIdle;
	}
}