/* CONSTANTS */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

const FPS = 50;

const CANVAS_WIDTH = canvas.getBoundingClientRect().width;
const CANVAS_HEIGHT = canvas.getBoundingClientRect().height;

const SQUARE_SIZE = Math.ceil(CANVAS_WIDTH / 20);
const SPEED = Math.ceil(SQUARE_SIZE / 10);

/* SCALING */

const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

/* VARIABLES */

let players = [];
let squares = [];
let square_amount = 5;

let keys_pressed = [];

/* FUNCTIONS */

let clearCanvas = () => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
};

let drawRect = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)
};

let drawText = (x, y, font, text, color) => {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y)
};

let collision = (x1, y1, width1, height1, x2, y2, width2, height2) => {
    const dx = (x1 + width1 / 2) - (x2 + width2 / 2);
    const dy = (y1 + height1 / 2) - (y2 + height2 / 2);
    
    const width = (width1 + width2) / 2;
    const height = (height1 + height2) / 2;

    const cross_width = width * dy;
    const cross_height = height * dx;

    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
        if (cross_width > cross_height) {
            return (cross_width > -cross_height) ? "bottom" : "left";
        } else {
            return (cross_width > -cross_height) ? "right" : "top";
        }
    }
    return false;
};

let wall = (x, y, width, height) => {
    if (x <= 0) {
        return "left"
    } else if (x + width >= CANVAS_WIDTH) {
        return "right"
    }
    
    if (y <= 0) {
        return "top"
    } else if (y + height >= CANVAS_HEIGHT) {
        return "bottom"
    }
    return false;
};

function keyDownHandler(e) {
    let index = keys_pressed.indexOf(e.key);
    if (index <= -1) {
        keys_pressed.push(e.key);
    }
}

function keyUpHandler(e) {
    let index = keys_pressed.indexOf(e.key);
    if (index > -1) {
        keys_pressed.splice(index, 1);
    }
}

function draw() {
    clearCanvas();
    
    for (const square of squares) {
        drawRect(square.x, square.y, square.width, square.height, square.color);
        
        let new_x = square.x + square.vx;
        let new_y = square.y + square.vy;
        
        let collision_detected = false;
        
        for (const square2 of squares) {
            let collision_point = collision(new_x, new_y, square.width, square.height, square2.x, square2.y, square2.width, square2.height);
            
            if (collision_point && square.id != square2.id) {
                let can_move = wall(square);
                let can_move2 = wall(square2);
                
                if (collision_point === "left") {
                    if (can_move) square.x = square2.x - square.width - buffer;
                    else if (can_move2) square2.x = square.x + square.width + buffer;
                    square.vx = -square.vx;
                    square2.vx = -square2.vx;
                } else if (collision_point === "right") {
                    if (can_move) square.x = square2.x + square2.width + buffer;
                    else if (can_move2) square2.x = square.x - square2.width - buffer;
                    square.vx = -square.vx;
                    square2.vx = -square2.vx;
                }
            
                if (collision_point === "top") {
                    if (can_move) square.y = square2.y - square.height - buffer;
                    else if (can_move2) square2.y = square.y + square.height + buffer;
                    square.vy = -square.vy;
                    square2.vy = -square2.vy;
                } else if (collision_point === "bottom") {
                    if (can_move) square.y = square2.y + square2.height + buffer;
                    else if (can_move2) square2.y = square.y - square2.height - buffer;
                    square.vy = -square.vy;
                    square2.vy = -square2.vy;
                }
                
                collision_detected = true;
                break;
            }
        }
        
        for (const player of players) {
            if (collision(new_x, new_y, square.width, square.height, player.x, player.y, player.width, player.height)) {
            }
        }
        
        if (new_x + square.width >= CANVAS_WIDTH) {
            square.vx = Math.sign(square.vx) * -square.vx;
        }
        
        if (new_x < 0) {
            square.vx = SPEED;
        }
        
        if (new_y + square.height >= CANVAS_HEIGHT) {
            square.vy = -SPEED;
        }
        
        if (new_y < 0) {
            square.vy = 2;
        }
        
        if (!collision_detected) {
            square.x = new_x;
            square.y = new_y;
        } else {
            square.x = Math.max(0, Math.min(CANVAS_WIDTH - square.width, square.x - square.vx));
            square.y = Math.max(0, Math.min(CANVAS_HEIGHT - square.height, square.y - square.vy));
        };
    }
    
    for (const player of players) {
        let dx = 0;
        let dy = 0;

        if (keys_pressed.includes("w")) dy -= 1;
        if (keys_pressed.includes("s")) dy += 1;
        if (keys_pressed.includes("a")) dx -= 1;
        if (keys_pressed.includes("d")) dx += 1;
        
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            
            dx = (dx / len) * SPEED;
            dy = (dy / len) * SPEED;
        
            player.x += dx;
            player.y += dy;
        }
        
        player.x = Math.max(player.x, 0)
        player.y = Math.max(player.y, 0)
        player.x = Math.min(player.x, CANVAS_WIDTH - SQUARE_SIZE)
        player.y = Math.min(player.y, CANVAS_HEIGHT - SQUARE_SIZE)
        
        drawRect(player.x, player.y, player.width, player.height, player.color);
    };
}

function start() {
    let player = {
        x: (CANVAS_WIDTH / 2) - SQUARE_SIZE,
        y: (CANVAS_HEIGHT / 2) - SQUARE_SIZE,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        color: "#4287f5",
        invincibility: false,
        health: 100,
        id: 1
    }
    
    players.push(player);
    
    for (let i = 0; i < square_amount; i++) {
        let attempts = 0;
        let max_attempts = 1000;
        let new_square = {};
        let buffer = 100;
        
        do {
            new_square = {
                x: Math.floor(Math.random() * (CANVAS_WIDTH - SQUARE_SIZE)),
                y: Math.floor(Math.random() * (CANVAS_HEIGHT - SQUARE_SIZE)),
                vx: Math.random() < 0.5 ? SPEED : -SPEED,
                vy: Math.random() < 0.5 ? SPEED : -SPEED,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                color: "#000000",
                id: i + 1
            };
            
            attempts += 1;
        } while (attempts < max_attempts && squares.some(square => collision(new_square.x, new_square.y, new_square.width, new_square.height, square.x, square.y, square.width, square.height) || collision(new_square.x, new_square.y, new_square.width, new_square.height, player.x - buffer, player.y - buffer, player.width + (buffer * 2), player.height + (buffer * 2))));
        
        squares.push(new_square);
    }
    
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    
    drawInterval = setInterval(draw, Math.ceil(1000 / FPS));
}

document.addEventListener("DOMContentLoaded", () => {
    clearCanvas();
    drawRect((CANVAS_WIDTH / 2) - 20, 90, 40, 15, "#000000");
    drawText(CANVAS_WIDTH / 2, 98, "14px Arial", "start", "#f52f25");
    setTimeout(start, 1000);
});
