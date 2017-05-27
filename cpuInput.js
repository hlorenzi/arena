function CPUInput(obj)
{
	this.obj = obj;
	this.cpu = true;
	
	this.target = null;
	
	this.stateMovement = this.StateIdle;
	this.stateAttack = this.StateAttack;
	this.timer = 0;
	this.timerNotAttack = 0;
	this.timerRecover = 10 + Math.random() * 30;
}

CPUInput.prototype.Update = function()
{
	this.obj.inputJump = false;
	this.obj.inputAttack = false;
	
	this.stateMovement();
	this.stateAttack();
}

CPUInput.prototype.Draw = function()
{	
	if (this.target && bboxDraw)
	{
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(this.obj.x, this.obj.y);
		ctx.lineTo(this.target.x, this.target.y);
		ctx.arc(this.target.x, this.target.y, 15, 0, Math.PI * 2);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.restore();
	}
}


CPUInput.prototype.HandleRecover = function()
{
	if (this.obj.onRecover)
	{
		this.timerRecover--;
		if (this.timerRecover <= 0)
		{
			this.obj.inputJump = true;
			this.timerRecover = 10 + Math.random() * 30;
		}
	}
}

CPUInput.prototype.StateIdle = function()
{
	this.HandleRecover();
	
	this.obj.inputMoveX = 0;
	this.obj.inputMoveY = 0;
	
	this.timer--;
	if (this.timer <= 0 && fighters.length > 1)
	{
		this.stateMovement = this.StateFollow;
		this.timer = 160 + Math.random() * 50;
		this.target = null;
		do
		{
			this.target = fighters[Math.floor(Math.random() * fighters.length)];
		}
		while (this.target === this.obj);
	}
}

CPUInput.prototype.StateFollow = function()
{
	this.HandleRecover();
	
	this.timer--;
	if (!this.target || this.timer <= 0)
	{
		this.stateMovement = this.StateIdle;
		this.timer = 10 + Math.random() * 50;
	}
	else
	{
		var toSide = (this.obj.x > this.target.x ? 1 : -1);
		var dir = Direction(this.obj.x, this.obj.y, this.target.x + toSide * 50 - this.target.xSpeed * 10, this.target.y - this.target.ySpeed * 10);
		var dist = Distance(this.obj.x, this.obj.y, this.target.x + toSide * 50 - this.target.xSpeed * 10, this.target.y - this.target.ySpeed * 10);
		
		if (dist > 20)
		{
			this.obj.inputMoveX = Math.cos(dir);
			this.obj.inputMoveY = Math.sin(dir);
		}
		else
		{
			this.stateMovement = this.StateIdle;
			this.timer = 10 + Math.random() * 50;			
		}
	}	
}

CPUInput.prototype.StateAttack = function()
{
	this.timerNotAttack--;
	
	if (!this.target)
		return;
	
	var dist = Distance(this.obj.x, this.obj.y, this.target.x, this.target.y);
	
	if (this.timerNotAttack <= 0 && dist < 100 && Math.random() < 0.3)
	{
		this.obj.inputAttack = true;
	}
	
	if (this.obj.lastTimeHit < -2 && Math.random() < 0.3)
	{
		this.timerNotAttack = 5 + Math.random() * 5;
		if ((this.target.x >= this.obj.x + 5 && this.obj.side < 0) || (this.target.x < this.obj.x - 5 && this.obj.side > 0))
			this.obj.inputMoveX += (this.target.x >= this.obj.x ? 0.1 : -0.1);
	}
}