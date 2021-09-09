const player = document.querySelector('player');
const game = document.querySelector('game');
const maxSpeed = 15;
const acc = 2;
const dec = 10;
const playerJump = 29;
const coyoteTime = 5;

const level = [
    "10000000000000002002",
    "10000222000000002002",
    "10000000000002032202",
    "12000000000002022202",
    "12000000000000022202",
    "10000220000000022202",
    "10000000000222222202",
    "10p00000000000000002",
    "10000111111222222222",
    "11111111111111111111"
]

let playerX = 0;
let playerY = 0;
let playerW = 50;
let playerH = 50;
let speedX = 0;
let speedY = 0;
let coyoteTimer = 0;

let pressed = [];
let justPressed = [];

let blocks = [];

let playerRight = playerX + playerW;
let playerBottom = playerY + playerH;

let delta = 1;
let deltaTimestamp = 0;

class Block {
    constructor(x, y, w, h, col = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.right = this.x + this.w;
        this.bottom = this.y + this.h;

        this.div = document.createElement('block');
        this.div.classList.add(`color${col}`);
        this.div.classList.add('gameComponent');

        this.div.style.width = `${w}px`;
        this.div.style.height = `${h}px`;
        setPos(this.div, x, y);
    }

    collide() {
        let colliding = (this.x <= playerRight &&
            playerX <= this.right &&
            this.y <= playerBottom &&
            playerY <= this.bottom);
            
        if (colliding) {
            let diffX = ((this.x + this.w / 2) - (playerX + playerW / 2)) / (this.w / 2);
            let diffY = ((this.y + this.h / 2) - (playerY + playerH / 2)) / (this.h / 2);

            let aDX = Math.abs(diffX);
            let aDY = Math.abs(diffY);

            if (Math.abs(aDX - aDY) < 0.1) { // corners wont reduce speed
                if (diffX < 0) {
                    playerX = this.right;
                } else {
                    playerX = this.x - playerW;
                }
                if (diffY < 0) {
                    playerY = this.bottom;
                } else {
                    playerY = this.y - playerH;
                }
            } else if (aDX > aDY) { // sides
                if (diffX < 0) {
                    playerX = this.right;
                } else {
                    playerX = this.x - playerW;
                }
                speedX = 0;
            } else {
                if (diffY < 0) {
                    playerY = this.bottom;
                } else {
                    playerY = this.y - playerH;
                }
                speedY = 0;
            }
        }
    }
}

function setPos(el, x, y) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
}

function createBlock(x, y, w, h, col = 1) {
    let b = new Block(x, y, w, h, col);
    blocks.push(b);
    game.appendChild(b.div);
}

function movePlayer() {
    if (pressed.indexOf(37) >= 0) {
        speedX -= acc;
    } else if (pressed.indexOf(39) >= 0) {
        speedX += acc;
    } else speedX *= (1 - 0.01 * dec);

    if (speedY === 0) {
        coyoteTimer = coyoteTime;
    } else if (coyoteTimer >= 0) {
        coyoteTimer -= delta;
    }
    if (justPressed.indexOf(32) >= 0 && coyoteTimer > 0) {
        speedY = -playerJump;
        coyoteTime = 0;
    }

    speedY += 1.5;
    if (speedX > maxSpeed) speedX = maxSpeed;
    else if (speedX < -maxSpeed) speedX = -maxSpeed;

    playerX += speedX * delta;
    playerY += speedY * delta;
    playerRight = playerX + playerW;
    playerBottom = playerY + playerH;
}

function updateCollision() {
    for (let b of blocks) {
        b.collide();
    }
}

function rotatePlayer() {
    let playerAngle = speedX * 0.8;
    player.style.transform = `rotate(${playerAngle}deg)`;
}

function update(ms) {
    delta = (ms - deltaTimestamp) / 1000 * 60;
    if (delta > 100) delta = 1;
    deltaTimestamp = ms;
    movePlayer();
    updateCollision();
    rotatePlayer();
    setPos(player, playerX, playerY);
    justPressed = [];

    requestAnimationFrame(update);
}

function start() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    player.style.width = `${playerW}px`;
    player.style.height = `${playerH}px`;
    requestAnimationFrame(update);
}

function onKeyDown(e) {
    if (pressed.indexOf(e) < 0) {
        pressed.push(e.keyCode);
        justPressed.push(e.keyCode);
    }
}

function onKeyUp(e) {
    pressed = pressed.filter(function (value, index, arr) {
        return value !== e.keyCode;
    });
}

function generateLevel() {
    for (let i = 0; i < level.length; i++) {
        let row = level[i];
        for (let j = 0; j < row.length; j++) {
            let column = row[j];
            if (column > 0) {
                createBlock(j * 100, i * 100, 100, 100, column);
            } else if (column == 'p') {
                playerX = j * 100;
                playerY = i * 100;
            }
        }
    }
}

generateLevel();
start();
