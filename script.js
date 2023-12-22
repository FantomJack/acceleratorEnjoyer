import {
    BreakingPlatform,
    DeadlyPlatform,
    HighJumpPlatform,
    LowJumpPlatform,
    MovingPlatform,
    Platform
} from "./platform.js";
import {Doodler} from "./assets/doodler.js";

//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodler;

//platforms
let platformArray = [];

//physics
let gravity = 0.3;


// GAME STATES
let gameOver = false;
let menu = false;
let mobile = false;
let hits = false;

// FPS
let now;
let then;
let elapsed;
let fpsInterval;
let fps = 60;

let orientation;
let filteredOrientation = 0;
const alpha = 0.2;

let helpModal = document.getElementById("helpModal");
function openHelpModal() {
    const helpModal = document.getElementById("helpModal");
    const rulesContainer = document.getElementById("rulesContainer");

    rulesContainer.innerHTML = "";

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const contentContainer = document.createElement("div");

    if (isMobile) {
        rulesContainer.innerHTML = "<h2>Pomocník</h2>" +
            "<br>" +
            "<h3>Ovládanie hry:</h3><br>" +
            "<p>Na pohyb panáčika hýb mobilom doľava a doprava</p><br>";
        const imageElement = document.createElement("img");
        imageElement.src = "assets/phone.png";
        imageElement.alt = "Phone Controls";
        imageElement.style.width = "50%";

        const textElement2 = document.createElement("div");
        textElement2.innerHTML = "<br><h3>Cieľ hry: </h3><br>" +
            "Dostať sa na koniec levelu"  ;

        contentContainer.appendChild(imageElement);
        contentContainer.appendChild(textElement2);

        rulesContainer.appendChild(contentContainer);

    } else {
        rulesContainer.innerHTML = "<h2>Pomocník</h2>" +
            "<br>" +
            "<h3>Ovládanie hry:</h3><br>" +
            "<p>Na pohyb panáčika použi klávesy A a D</p><br>";
        const imageElement = document.createElement("img");
        imageElement.src = "assets/adkeys.png";
        imageElement.alt = "Controls A D";
        imageElement.style.width = "30%";

        const textElement = document.createElement("div");
        textElement.innerHTML = "<br><p>Alebo šípkové klávesy <- a -></p><br>";

        const imageElement2 = document.createElement("img");
        imageElement2.src = "assets/arrow keys.png";
        imageElement2.alt = "Controls Arrows";
        imageElement2.style.width = "30%";

        const textElement2 = document.createElement("div");
        textElement2.innerHTML = "<br><h3>Cieľ hry: </h3><br>" +
            "Dostať sa na koniec levelu<br><br>"  ;

        contentContainer.appendChild(imageElement);
        contentContainer.appendChild(textElement);
        contentContainer.appendChild(imageElement2);
        contentContainer.appendChild(textElement2);

        rulesContainer.appendChild(contentContainer);    }

    helpModal.style.display = "block";
}

function closeHelpModal() {
    const helpModal = document.getElementById("helpModal");
    helpModal.style.display = "none";
}

function restartLevel() {
    console.log("Restarting level...");
    reset();
}
window.onload = function() {

    doodler = new Doodler(46, 46 , boardWidth, boardHeight);

    loadImages();

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    placePlatforms();

    doodler.img = doodler.RightImg;
    doodler.jump();
    doodler.RightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    helpModal = document.getElementById("helpModal");

    fpsInterval = 1000 / fps;
    then = Date.now();
    requestAnimationFrame(frame);
    document.addEventListener("keydown", buttonDown);
    document.addEventListener("keyup", buttonUp);

    const helpButton = document.getElementById('helpButton');
    const restartButton = document.getElementById('restartButton');
    const closeButton = document.querySelector('.close');

    helpButton.addEventListener("click", openHelpModal);
    restartButton.addEventListener("click", restartLevel);
    closeButton.addEventListener("click", closeHelpModal);
}

window.addEventListener("deviceorientation", function (event) {
    handleOrientation(event);
    moveDoodlerGyro(event);
});

function handleOrientation(event) {
    if (event && event.gamma) {
        filteredOrientation = alpha * event.gamma + (1 - alpha) * filteredOrientation;
        orientation = filteredOrientation;

    } else {
        document.getElementById('orientationInfo').innerText = 'device orientation not available.';
    }
}

function frame(){


    requestAnimationFrame(frame);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        requestAnimationFrame(update);
    }
}

function update() {

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i]

        // sliding platforms
        if (doodler.velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= doodler.velocityY; //slide platform down
        }

        if (platform.detectCollision(doodler)) {
            if (platform.constructor.name === "DeadlyPlatform"){
                killedByPlatform(i)
                return;
            }
            platform.onCollision(doodler);
        }

        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        addPlatform(-Platform.height); //replace with new platform on top
    }

    //doodler
    doodler.update(boardWidth, gravity);
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    if (doodler.y > board.height) {
        gameOver = true;
    }

    if (gameOver) {
        setGameOver();
    }
}

function buttonUp(e){
    if (e.code === "ArrowLeft" || e.code === "KeyA")
        doodler.velocityLeft = 0;
    if (e.code === "ArrowRight" || e.code === "KeyD")
        doodler.velocityRight = 0;
}
function buttonDown(e) {

    if (e.code === "ArrowRight" || e.code === "KeyD") { //move right
        doodler.moveRight();
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { //move left
        doodler.moveLeft();
    }
    else if (e.code === "Space" && gameOver) {
        reset()
    }
}

function moveDoodlerGyro() {
    document.getElementById('orientationInfo').innerText = orientation;
    if (orientation > 0) {
        // move right
        doodler.moveRight();
    } else if (orientation < 0) {
        // move left
        doodler.moveLeft();
    }
}

function placePlatforms() {
    platformArray = [];

    let platform = new Platform(boardWidth/2, boardHeight - 50)
    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        addPlatform(boardHeight - 75*i - 150);
    }
}
function addPlatform(height) {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = randomPlatformType(randomX, height);
    platformArray.push(platform);
}
function reset(){

    doodler.reset(boardWidth, boardHeight)
    gameOver = false;
    placePlatforms();
}
function loadImages() {
    // load images
    doodler.RightImg = new Image();
    doodler.RightImg.src = "./assets/doodler-right.png";

    doodler.LeftImg = new Image();
    doodler.LeftImg.src = "./assets/doodler-left.png";

    Platform.img = new Image();
    Platform.img.src = "./assets/platform.png";

    BreakingPlatform.img = new Image();
    BreakingPlatform.img.src = "./assets/platform-broken.png";

    MovingPlatform.img = new Image();
    MovingPlatform.img.src = "./assets/platform-moving.png";

    HighJumpPlatform.img = new Image();
    HighJumpPlatform.img.src = "./assets/high-jump.png";

    LowJumpPlatform.img = new Image();
    LowJumpPlatform.img.src = "./assets/low-jump.png";

    DeadlyPlatform.img = new Image();
    DeadlyPlatform.img.src = "./assets/platform-deadly.png";
}
function setGameOver(){
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*12/13);
}

function randomPlatformType(x, y){
    let random = Math.floor(Math.random() * (10));

    switch (random) {
        case 0:
            return new MovingPlatform(x, y);
        case 1:
            return new HighJumpPlatform(x, y);
        case 2:
            return new LowJumpPlatform(x, y);
        case 3:
            return new DeadlyPlatform(x, y);
        case 4:
            return new BreakingPlatform(x,y);
        default:
            return new Platform(x, y);
    }
}

function killedByPlatform(i){
    gameOver = true;
    for (i; i < platformArray.length; i++){
        let platform = platformArray[i];
        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }
    doodler.update(boardWidth, gravity);
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    setGameOver();
}

