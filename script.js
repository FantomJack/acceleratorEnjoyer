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

        contentContainer.appendChild(imageElement);


    } else {
        rulesContainer.innerHTML = "<h2>Pomocník</h2>" +
            "<br>" +
            "<h3>Ovládanie hry:</h3><br>" +
            "<p>Na pohyb panáčika použi klávesy A a D alebo šípkové klávesy <- a -></p><br>";

        const imageElement2 = document.createElement("img");
        imageElement2.src = "assets/keys.png";
        imageElement2.alt = "Controls Arrows";
        imageElement2.style.width = "80%";

        contentContainer.appendChild(imageElement2);
        }

    const textBasicPlatform = document.createElement("div");
    textBasicPlatform.innerHTML = "<br><h3>Platformy: </h3><br>" +
        "<p>1) Obyčajná platforma, z ktorej sa odrazíš a postúpiš vyššie.</p><br>"  ;
    const imagePlatform = document.createElement("img");
    imagePlatform.src = "assets/platform.png";
    imagePlatform.alt = "Platforma";

    const textBroken = document.createElement("div");
    textBroken.innerHTML = "<br><p>------------***------------<br><br><br>2) Platforma, z ktorej sa neodrazíš, ale padneš dole.</p><br>"  ;
    const imageBroken = document.createElement("img");
    imageBroken.src = "assets/platform-broken.png";
    imageBroken.alt = "Zničená platforma";

    const textDeadly = document.createElement("div");
    textDeadly.innerHTML = "<br><p>------------***------------<br><br><br>3) Platforma, na ktorú keď skočíš, automaticky prehrávaš.</p><br>"  ;
    const imageDeadly = document.createElement("img");
    imageDeadly.src = "assets/platform-deadly.png";
    imageDeadly.alt = "Platforma, ktorá ťa zabije";

    const textMoving = document.createElement("div");
    textMoving.innerHTML = "<br><p>------------***------------<br><br><br>4) Pohyblivá platforma. Odraz z nej funguje rovnako ako pri obyčajnej platforme, až na to že sa hýbe.</p><br>"  ;
    const imageMoving = document.createElement("img");
    imageMoving.src = "assets/platform-moving.png";
    imageMoving.alt= "Pohyblivá platforma";

    const textHigh = document.createElement("div");
    textHigh.innerHTML = "<br><p>------------***------------<br><br><br>5) Platforma, ktorá zvyšuje tvoj skok po odrazení.</p><br>"  ;
    const imageHigh = document.createElement("img");
    imageHigh.src = "assets/high-jump.png";
    imageHigh.alt= "Platforma na vyšší skok";

    const textLow = document.createElement("div");
    textLow.innerHTML = "<br><p>------------***------------<br><br><br>6) Platforma, ktorá znižuje tvoj skok po odrazení.</p><br>"  ;
    const imageLow = document.createElement("img");
    imageLow.src = "assets/low-jump.png";
    imageLow.alt= "Platforma na nižší skok";

    //platforms
    contentContainer.appendChild(textBasicPlatform);
    contentContainer.appendChild(imagePlatform);

    contentContainer.appendChild(textBroken);
    contentContainer.appendChild(imageBroken);

    contentContainer.appendChild(textDeadly);
    contentContainer.appendChild(imageDeadly);

    contentContainer.appendChild(textMoving);
    contentContainer.appendChild(imageMoving);

    contentContainer.appendChild(textHigh);
    contentContainer.appendChild(imageHigh);

    contentContainer.appendChild(textLow);
    contentContainer.appendChild(imageLow);

    const textElement2 = document.createElement("div");
    textElement2.innerHTML = "<br><h3>Cieľ hry: </h3><br>" +
        "<p>Hra obsahuje 5 levelov. Na úspešné dokončenie celej hry je potrebné prejsť všetky z nich. Na úspešný prechod levelom je potrebné dostať sa na jeho koniec.</p><br><br>"  ;

    contentContainer.appendChild(textElement2);
    rulesContainer.appendChild(contentContainer);
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

function landingPage() {
    window.location.href = 'welcome.html';
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
    const welcomeButton = document.getElementById('welcomeButton');
    const closeButton = document.querySelector('.close');

    helpButton.addEventListener("click", openHelpModal);
    restartButton.addEventListener("click", restartLevel);
    welcomeButton.addEventListener("click", landingPage);
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
        console.log("Device orientation not available.");
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

let gyroMovement = 0;


function moveDoodlerGyro() {

    if (orientation > 0) {
        gyroMovement = 2;
        doodler.moveRight(2);
    } else if (orientation < 0) {
        // move left
        gyroMovement = -2;
        doodler.moveLeft(2);
    } else {
        // stop movement
        gyroMovement = 0;
    }

    if (gyroMovement !== 0) {
        doodler.velocityLeft = gyroMovement;
        doodler.velocityRight = gyroMovement;
    } else {
        doodler.velocityLeft = 0;
        doodler.velocityRight = 0;
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
    doodler.RightImg.src = "./assets/slime-right.png";

    doodler.LeftImg = new Image();
    doodler.LeftImg.src = "./assets/slime-left.png";

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

