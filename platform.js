export class Platform {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static width = 60;
    static height = 18;
    static img;

    get img(){
        return Platform.img;
    }


    detectCollision(slime) {
        return slime.x < this.x + Platform.width &&   //a's top left corner doesn't reach b's top right corner
            slime.x + slime.width > this.x &&   //a's top right corner passes b's top left corner
            slime.y + slime.height < this.y + Platform.height &&  //a's top left corner doesn't reach b's bottom left corner
            slime.y + slime.height > this.y &&          //a's bottom left corner passes b's top left corner
            slime.velocityY >= 0;
    }
    update(boardWidth){}

    onCollision(slime){
        slime.jump();
    }
}

export class MovingPlatform extends Platform{
    static glidingV = 4;

    constructor(x, y) {
        super(x, y);
        this.glidingRight = true;
    }
    get img(){
        return MovingPlatform.img;
    }

    update(boardWidth){
        if (this.glidingRight)
            this.x += MovingPlatform.glidingV;
        else
            this.x -= MovingPlatform.glidingV;

        if (this.x + Platform.width > boardWidth) {
            this.glidingRight = false;
        }
        else if (this.x < 0) {
            this.glidingRight = true;
        }
    }
}

export class BreakingPlatform extends Platform{
    get img(){
        return BreakingPlatform.img;
    }
    onCollision(slime){}
}

export class HighJumpPlatform extends Platform{

    get img(){
        return HighJumpPlatform.img;
    }
    onCollision(slime) {
        slime.jump(10);
    }
}
export class LowJumpPlatform extends Platform{
    get img(){
        return LowJumpPlatform.img;
    }
    onCollision(slime) {
        slime.jump(7);
    }
}
export class DeadlyPlatform extends Platform{
    get img(){
        return DeadlyPlatform.img;
    }

    onCollision(slime) {}
}

export class EndPlatform extends Platform{
    get img(){
        return EndPlatform.img;
    }

    onCollision(slime) {}
}



