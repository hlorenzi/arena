function HumanInput(obj)
{
	this.obj = obj;
	this.cpu = false;
}

HumanInput.prototype.Update = function()
{
	this.obj.inputMoveX = 0;
	this.obj.inputMoveY = 0;
	this.obj.inputMoveX += (keyRight ? 1 : (keyLeft ? -1 : 0));
	this.obj.inputMoveY += (keyUp ? -1 : (keyDown ? 1 : 0));
	
	this.obj.inputJump = keyJump;
	this.obj.inputAttack = keyAttack;
}