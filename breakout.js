// BOARD
let board;
let boardWidth = 350;
let boardHeight = 500;
let context;

// PLAYER
let playerWidth = 60;
let playerHeight = 10;
let playerVelocityX = 15;

let player = {
    x : boardWidth/2.33 - playerHeight/2,
    y : boardHeight - playerHeight - 5,
    width : playerWidth,
    height : playerHeight,
    velocityX : playerVelocityX
}

// BALL
let ballWidth = 10;
let ballHeight = 10;

let ballVelocityX = 6; // 15 para probar 3 es normal
let ballVelocityY = 4; // 10 para probar 2 es normal

let ballRadius = 5;

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width : ballWidth,
    height : ballHeight,
    radius : ballRadius,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY,
}

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); // Dibuja un círculo
    context.fillStyle = "white"; // Puedes cambiar el color
    context.fill();
    context.closePath();
}

// BLOCKS = BLOQUES 
let blockArray = [];
let blockWidth = 37.5;
let blockHeight = 10;
let blockColumns = 7;
let blockRows = 3; // Filas iniciales de bloques
let blockMaxRows = 10; // Filas maximas de bloques
let blockCount = 0;

// Starting block corner top left
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Draw initial player
    context.fillStyle = "yellowgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    board.addEventListener("touchstart", touchStart);
    board.addEventListener("touchmove", touchMove);
    board.addEventListener("touchend", touchEnd);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    // Crear bloques
    createBlocks();
}

// Oyente de evento táctil para comenzar el movimiento del jugador
function touchStart(event) {
    event.preventDefault(); // Evitar comportamiento predeterminado del toque
    var touch = event.touches[0]; // Obtener el primer toque
    player.x = touch.clientX - board.getBoundingClientRect().left - player.width / 2;
}

// Oyente de evento táctil para continuar moviendo al jugador
function touchMove(event) {
    event.preventDefault();
    var touch = event.touches[0];
    player.x = touch.clientX - board.getBoundingClientRect().left - player.width / 2;
}

// Oyente de evento táctil para reiniciar el juego
function touchEnd(event) {
    event.preventDefault();
    if (gameOver) {
        resetGame();
    }
}


function update() {
    requestAnimationFrame(update);
    if(gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Player
    context.fillStyle = "gainsboro";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Ball
    // context.fillStyle = "white"; // Quitar
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    // context.fillRect(ball.x, ball.y, ball.width, ball.height); // Quitar

    drawBall();

    // rebote de la bola fuera del camino
    if (ball.y <= 0) {

        // Si la bola toca el final del lienzo
        ball.velocityY *= -1; // Direccion de reversa

    } else if(ball.x <= 0 || (ball.x + ball.width) >= boardWidth) {

        // Si la bola toca el lado derecho o izquierdo del lienzo
        ball.velocityX *= -1; // Direccion de reversa

    } else if(ball.y + ball.height >= boardHeight) {
        // Si la bola toca el piso del lienzo
        // Game Over
        context.font = "20px sans-serif";
        context.fillStyle = "red";
        context.fillText("Game Over: press 'Space' to restart.", 10, 400);
        gameOver = true;

    }
    // the bounce ball off player paddle
    if(topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1; // flip and direction up or down
    } else if(leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1; // flip and direction up or down
    }

    // Paint blocks
    context.fillStyle = "whitesmoke";
    for(let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if(!block.break) {
            if(topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1; //flip Y direction up or down
                blockCount -= 1;
                score += 100;
            } else if(leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1; // flip X direction left or right
                blockCount -= 1;
                score += 100;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    // Siguiente Nivel
    if (blockCount == 0) {
        score += 100*blockRows*blockColumns; // 100 punts de bonus por subir de nivel
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    // Score
    context.font = "20px sans-serif";
    context.fillText("Score "+score, 10, 25);
}

function outOfBounds(xPosition) {
    return(xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if(gameOver) {
        if(e.code == "Space") {
            resetGame();
        }
    }

    if(e.code == "ArrowLeft") {
        // player.x -= player.velocityX;
        let nextPlayerX = player.x - player.velocityX;

        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }

    } else if(e.code == "ArrowRight") {
        // player.x += player.velocityX;
        let nextPlayerX = player.x + player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top left corner doesnt reach b's top rigth corner   
           a.x + a.width > b.x && // a's top right corner b's top left corner
           a.y < b.y + b.height && // a's top left corner doesnt reach b's bottom left corner
           a.y + a.height > b.y; // a's bottom left corner passes b's top left corner 
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { // is a below b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { // a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = [];
    for(let c = 0; c < blockColumns; c++) {
        for(let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth +c*10, // c*10 es el espacio para separar las columnas
                y : blockY + r*blockHeight + r*10, // r*10 es el espacio para separar las filas
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2.33 - playerHeight/2,
        y : boardHeight - playerHeight - 5,
        width : playerWidth,
        height : playerHeight,
        velocityX : playerVelocityX
    }

    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width : ballWidth,
        height : ballHeight,
        radius : ballRadius,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY,
    }

    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}