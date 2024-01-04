import {
    BreakingPlatform,
    DeadlyPlatform, EndPlatform,
    HighJumpPlatform,
    LowJumpPlatform,
    MovingPlatform,
    Platform
} from "./platform.js";
import {Slime} from "./slime.js";

//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//slime
let slime;

//platforms
let platformArray = [];

//physics
let gravity = 0.3;

// GAME STATES
let gameOver = false;

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
let levelsData;
let initialPlatformY;
let finish = false;
let gyroMovement = 0;

let totalLevels = 0;
let currentLevelIndex = -1;
let playedLevels = [];

function openHelpModal() {
    const helpModal = document.getElementById("helpModal");
    const rulesContainer = document.getElementById("rulesContainer");

    rulesContainer.innerHTML = "";

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const contentContainer = document.createElement("div");

    if (isMobile) {
        rulesContainer.innerHTML = "<h2>Návod a pravidlá</h2>" +
            "<br>" +
            "<h3>Ovládanie hry:</h3><br>" +
            "<p>Na pohyb panáčika hýb mobilom doľava a doprava</p><br>";
        const imageElement = document.createElement("img");
        imageElement.src = "assets/phone.png";
        imageElement.alt = "Phone Controls";
        imageElement.style.width = "50%";

        contentContainer.appendChild(imageElement);


    } else {
        rulesContainer.innerHTML = "<h2>Návod a pravidlá</h2>" +
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

    const textEnd = document.createElement("div");
    textEnd.innerHTML = "<br><p>------------***------------<br><br><br>7) Cieľová platforma, skoč na ňu pre postup do ďalšieho levelu.</p><br>"  ;
    const imageEnd = document.createElement("img");
    imageEnd.src = "assets/end.png";
    imageEnd.alt= "Cieľová platforma";

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

    contentContainer.appendChild(textEnd);
    contentContainer.appendChild(imageEnd);

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
    saveGameState();
    reset();
}

function landingPage() {
    window.location.href = 'index.html';
}

function saveGameState() {
    const gameState = {
        currentLevelIndex,
        playedLevels,
    };

    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// load game state from local storage
function loadGameState() {
    const savedGameState = localStorage.getItem('gameState');

    if (savedGameState) {
        const gameState = JSON.parse(savedGameState);
        currentLevelIndex = gameState.currentLevelIndex;
        playedLevels = gameState.playedLevels;
        loadLevel(levelsData.levels[currentLevelIndex]);
        placePlatforms();

    } else {
        loadRandomLevel();
        loadLevel(levelsData.levels[currentLevelIndex]);
        placePlatforms();
    }
}

window.onload = function() {

    slime = new Slime(46, 46 , boardWidth, boardHeight);

    loadImages();

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    placePlatforms();

    slime.img = slime.RightImg;
    slime.jump();
    slime.RightImg.onload = function() {
        context.drawImage(slime.img, slime.x, slime.y, slime.width, slime.height);
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

    placePlatforms();
    loadGameState();
}

window.addEventListener("deviceorientation", function (event) {
    handleOrientation(event);
    moveSlimeGyro(event);
});

function handleOrientation(event) {
    if (event && event.gamma) {
        filteredOrientation = alpha * event.gamma + (1 - alpha) * filteredOrientation;
        orientation = filteredOrientation;

    } else {
        console.log("Device orientation not available.");
    }
}

function loadRandomLevel() {
    while(1){
        let chosen = Math.floor(Math.random() * totalLevels);
        if (!playedLevels.includes(chosen)){
            currentLevelIndex = chosen;
            break;
        }
    }
}

function loadLevel(levelData) {
    platformArray = [];

    for (const platformInfo of levelData.platforms) {
        const { x, y, type } = platformInfo;
        platformArray.push(createPlatform(type, x, y));
    }

    initialPlatformY = platformArray[0].y;

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

    if (finish) {
        finish = false;
        playedLevels.push(currentLevelIndex);
        saveGameState();

        if(playedLevels.length === totalLevels || playedLevels.length > totalLevels ){
            if (!playedLevels.includes(-1) || playedLevels.length > totalLevels ) {
                console.log("Congratulations! You completed all levels.");
                playedLevels = [];
                currentLevelIndex = -1;
                saveGameState();
                window.location.href = 'success.html';
            }
            else if (playedLevels.length === totalLevels){
                loadRandomLevel();
                slime.reset(boardWidth, boardHeight)

                loadLevel(levelsData.levels[currentLevelIndex]);
            }
        }
        else {
            loadRandomLevel();
            slime.reset(boardWidth, boardHeight)

            loadLevel(levelsData.levels[currentLevelIndex]);
        }
    }

    if (gameOver) {
        saveGameState();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i]
        // sliding platforms
        if (slime.velocityY < 0 && slime.y < boardHeight*3/4) {
            platform.y -= slime.velocityY; //slide platform down
        }

        if (platform.detectCollision(slime)) {
            if (platform.constructor.name === "DeadlyPlatform"){
                killedByPlatform(i)
                return;
            }
            if (platform.constructor.name === "EndPlatform"){
                finish = true;
            }
            platform.onCollision(slime);
        }

        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }

    // slime
    slime.update(boardWidth, gravity);
    context.drawImage(slime.img, slime.x, slime.y, slime.width, slime.height);

    if (slime.y > board.height) {
        gameOver = true;
    }

    if (gameOver) {

        setGameOver();
    }
}

function buttonUp(e){
    if (e.code === "ArrowLeft" || e.code === "KeyA")
        slime.velocityLeft = 0;
    if (e.code === "ArrowRight" || e.code === "KeyD")
        slime.velocityRight = 0;
}

function buttonDown(e) {

    if (e.code === "ArrowRight" || e.code === "KeyD") { //move right
        slime.moveRight();
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { //move left
        slime.moveLeft();
    }
    else if (e.code === "Space" && gameOver) {
        reset()
    }
}

function moveSlimeGyro() {

    if (orientation > 0) {
        gyroMovement = 2;
        slime.moveRight(2);
    } else if (orientation < 0) {
        // move left
        gyroMovement = -2;
        slime.moveLeft(2);
    } else {
        gyroMovement = 0;
    }

    if (gyroMovement !== 0) {
        slime.velocityLeft = gyroMovement;
        slime.velocityRight = gyroMovement;
    } else {
        slime.velocityLeft = 0;
        slime.velocityRight = 0;
    }
}

function placePlatforms() {
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            levelsData = data;
            totalLevels = levelsData.levels.length;

            if (currentLevelIndex===-1){
                loadRandomLevel();
            }
            loadLevel(levelsData.levels[currentLevelIndex]);
            slime.reset(boardWidth, boardHeight);

        });
}

function createPlatform(type, x, y) {
    switch (type) {
        case 'basic':
            return new Platform(x, y);
        case 'broken':
            return new BreakingPlatform(x, y);
        case 'highJump':
            return new HighJumpPlatform(x, y);
        case 'lowJump':
            return new LowJumpPlatform(x, y);
        case 'deadly':
            return new DeadlyPlatform(x, y);
        case 'moving':
            return new MovingPlatform(x, y);
        case 'end':
            return new EndPlatform(x, y);
        default:
            return new Platform(x, y);
    }
}

function reset(){

    slime.reset(boardWidth, boardHeight);
    gameOver = false;
    platformArray = [];

    loadLevel(levelsData.levels[currentLevelIndex]);

    placePlatforms();

}
function loadImages() {
    // load images
    slime.RightImg = new Image();
    slime.RightImg.src = "./assets/slime-right.png";

    slime.LeftImg = new Image();
    slime.LeftImg.src = "./assets/slime-left.png";

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

    EndPlatform.img = new Image();
    EndPlatform.img.src = "./assets/end.png";
}
function setGameOver(){
    context.fillStyle = "#FF528E";
    context.font = "16px Comic Sans MS";
    context.fillText("Game Over: Stlač 'Space' na Reštart", boardWidth/7, boardHeight*12/13);
}

function killedByPlatform(i){
    gameOver = true;
    for (i; i < platformArray.length; i++){
        let platform = platformArray[i];
        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }
    slime.update(boardWidth, gravity);
    context.drawImage(slime.img, slime.x, slime.y, slime.width, slime.height);
    setGameOver();
}

function beforePrintHandler() {
    openHelpModal();

}

function afterPrintHandler() {
    closeHelpModal();

}

if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');

    mediaQueryList.addListener((mql) => {
        if (mql.matches) {
            // Before print
            beforePrintHandler();
        } else {
            // After print
            afterPrintHandler();
        }
    });
}

// For browsers that don't support matchMedia
window.onbeforeprint = beforePrintHandler;
window.onafterprint = afterPrintHandler;

