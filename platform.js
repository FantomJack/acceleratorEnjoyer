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


    detectCollision(doodler) {
        return doodler.x < this.x + Platform.width &&   //a's top left corner doesn't reach b's top right corner
            doodler.x + doodler.width > this.x &&   //a's top right corner passes b's top left corner
            doodler.y + doodler.height < this.y + Platform.height &&  //a's top left corner doesn't reach b's bottom left corner
            doodler.y + doodler.height > this.y &&          //a's bottom left corner passes b's top left corner
            doodler.velocityY >= 0;
    }
    update(boardWidth){}

    onCollision(doodler){
        doodler.jump();
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
    onCollision(doodler){}
}

export class HighJumpPlatform extends Platform{

    get img(){
        return HighJumpPlatform.img;
    }
    onCollision(doodler) {
        doodler.jump(10);
    }
}
export class LowJumpPlatform extends Platform{
    get img(){
        return LowJumpPlatform.img;
    }
    onCollision(doodler) {
        doodler.jump(7);
    }
}
export class DeadlyPlatform extends Platform{
    get img(){
        return DeadlyPlatform.img;
    }

    onCollision(doodler) {}
}



