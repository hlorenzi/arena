function ObjFighterSandbag()
{
	this.state = "idle";
	
	this.bboxCharacter = {x1: -15, x2: 15, y1: -15, y2: 15, z1: -60, z2: 0};
	this.bboxAttack = {damage: 0, groundSpeed: 1, flySpeed: -1, x1: -15, x2: 15, y1: -15, y2: 15, z1: -60, z2: 0};
	
	this.anim = new AnimationController();
	this.anim.Play(animSandbagIdle);
	
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
		
	this.side = 1;
	this.damage = 0;
}

ObjFighterSandbag.prototype.Update = function()
{
	this.anim.Update();
	
	this.x += this.xSpeedCollision;
	this.y += this.ySpeedCollision;
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
	
	var landSpeed = 0;
	
	if (this.state != "hit")
	{
		this.zSpeed += 0.75;
		
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.z += this.zSpeed;
	
		if (this.z >= 0)
		{
			landSpeed = this.zSpeed;
			this.z = 0;
			this.zSpeed = 0;
		}
	
		if (true)
		{
			this.xSpeed = Approach(this.xSpeed, 0, 0.15);
			this.ySpeed = Approach(this.ySpeed, 0, 0.15);
		}
	}
	
	var dmg = CheckFightersDamage(this);
	if (dmg)
	{
		this.state = "hit";
		this.anim.Play(animSandbagHit);
		this.damage += dmg.bboxAttack.damage;
		
		var dir = Direction(dmg.x, dmg.y, this.x, this.y);
		
		this.xSpeed = dmg.bboxAttack.groundSpeed * 0.1 * Math.cos(dir) * this.damage;
		this.ySpeed = dmg.bboxAttack.groundSpeed * 0.1 * Math.sin(dir) * this.damage;
		this.z += Math.max(-20, dmg.bboxAttack.flySpeed * 0.1 * this.damage);
		this.zSpeed = Math.max(-20, dmg.bboxAttack.flySpeed * 0.1 * this.damage);
		
		this.side = (this.xSpeed > 0 ? 1 : -1);
		this.hitX = -10 + Math.random() * 20;
		this.hitY = -80 + Math.random() * 60;
		
		dmg.bboxAttack.hit = true;
		
		SoundPlay("sndDamage1", 1);
		SoundPlay("sndDamage2", 1);
	}
	
	if (this.state == "hit")
	{
		if (this.anim.ended)
		{
			if (Distance(0, 0, this.xSpeed, this.zSpeed) > 4)
			{
				this.state = "fly";
				this.anim.Play(animSandbagFly);			
			}
			else
			{
				this.state = "idle";
				this.anim.Play(animSandbagIdle);
			}
		}
	}
	else if (this.state == "fly")
	{
		if (this.zSpeed > 0)
		{
			this.state = "fall";
			this.anim.Play(animSandbagFall);
		}
	}
	else if (this.state == "fall")
	{
		if (this.zSpeed > 0)
			this.anim.Play(animSandbagFall);
			
		if (this.z == 0)
		{
			if (landSpeed > 4 || Distance(0, 0, this.xSpeed, this.ySpeed) > 7)
			{
				SoundPlay("sndLand2", 1);
				this.anim.Play(animSandbagLand);
				this.zSpeed = landSpeed * (-0.4);
				this.xSpeed *= 0.7;
				this.ySpeed *= 0.7;
			}
			else
			{
				this.state = "recover";
				this.anim.Play(animSandbagRecover);
			}
		}
	}
	else if (this.state == "recover")
	{
		if (this.anim.ended)
		{
			this.state = "idle";
			this.anim.Play(animSandbagIdle);
		}
	}
}

ObjFighterSandbag.prototype.Draw = function()
{
	var cx = 0;
	var cy = 0;
	var t = 0.2 - this.anim.time;
	if (this.state == "hit")
	{
		cx = Math.random() * t * 100;
		cy = Math.random() * t * 100;
	}
	
	ctx.save();
	ctx.translate(this.x + cx, this.y + cy);
	ctx.scale(1, 0.2);
	ctx.beginPath();
	ctx.arc(0, 0, 40, 0, Math.PI * 2);
	ctx.fillStyle = "gray";
	ctx.fill();
	ctx.restore();
	
	this.anim.Draw(this.x + cx, this.y + this.z + cy, this.side, 1);
	
	if (this.state == "hit")
	{
		this.animHitParticle.Draw(this.x + this.hitX - 5 + Math.random() * 10, this.y + this.z + this.hitY - 5 + Math.random() * 10,
			Math.random() * 0.2 + this.anim.time * 4, Math.random() * 0.2 + this.anim.time * 4);
	}
	
	ctx.fillStyle = "black";
	ctx.font = "20px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("" + this.damage + "%", this.x, this.y + this.z - 100);
	ctx.restore();
	
	DrawFightersCollision(this);
}