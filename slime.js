export class Slime {
    static img;
    static RightImg;
    static LeftImg;
    static velocityY = 0;
    static jumpV = -8;

    constructor(slimeWidth, slimeHeight, boardWidth, boardHeight) {
        this.width = slimeWidth;
        this.height = slimeHeight;
        this.x = boardWidth/2 - slimeWidth/2;
        this.y = boardHeight*7/8 - slimeHeight;
        this.velocityLeft = 0;
        this.velocityRight = 0;

    }

    reset(boardWidth, boardHeight){
        this.x = boardWidth/2 - this.width/2;
        this.y = boardHeight*7/8 - this.height;
    }

    moveLeft(velocity = 4){
        this.velocityLeft = -velocity;
        this.img = this.LeftImg;
    }

    moveRight(velocity = 4){
        this.velocityRight = velocity;
        this.img = this.RightImg;
    }

    jump(velocity = -Slime.jumpV){
        this.velocityY = -velocity;
    }

    update(boardWidth, gravity){
        this.x += this.velocityLeft;
        this.x += this.velocityRight;
        if (this.x > boardWidth) {
            this.x = 0;
        }
        else if (this.x + this.width < 0) {
            this.x = boardWidth;
        }

        this.velocityY += gravity;
        this.y += this.velocityY;

    }

}