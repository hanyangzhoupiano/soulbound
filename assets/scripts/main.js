/* CONSTANTS */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

const FPS = 50;
const SQUARE_SIZE = 40;

const CANVAS_WIDTH = canvas.getBoundingClientRect().width;
const CANVAS_HEIGHT = canvas.getBoundingClientRect().height;

/* SCALING */

const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

/* VARIABLES */

let squares = [];
let square_amount = 6;

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

let collision = (a, b) => {
    const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
    const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
    
    const width = (a.width + b.width) / 2;
    const height = (a.height + b.height) / 2;

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
        
        if (square.plr) {
            let dx = 0;
            let dy = 0;
            let speed = 5;
            
            if (keys_pressed.includes("w")) dy -= 1;
            if (keys_pressed.includes("s")) dy += 1;
            if (keys_pressed.includes("a")) dx -= 1;
            if (keys_pressed.includes("d")) dx += 1;
            
            if (dx !== 0 || dy !== 0) {
                const len = Math.sqrt(dx * dx + dy * dy);
                dx = (dx / len) * speed;
                dy = (dy / len) * speed;
            
                square.x += dx;
                square.y += dy;
            }
            
            square.x = Math.max(square.x, 0)
            square.y = Math.max(square.y, 0)
            square.x = Math.min(square.x, CANVAS_WIDTH - SQUARE_SIZE)
            square.y = Math.min(square.y, CANVAS_HEIGHT - SQUARE_SIZE)
            continue
        };
        
        for (const square2 of squares) {
            let collision_point = collision(square, square2);
            if (collision_point && square.id != square2.id) {
                if (square.plr || square2.plr) {
                    clearCanvas();
                    drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "#000000");
                    drawText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "48px Arial", "You lose!", "#f52f25");
                    clearInterval(drawInterval);
                    return;
                };
                if (collision_point == "left" || collision_point == "right") {
                    square.direction_x = -square.direction_x;
                    square2.direction_x = -square2.direction_x;
                }
                if (collision_point == "top" || collision_point == "bottom") {
                    square.direction_y = -square.direction_y;
                    square2.direction_y = -square2.direction_y;
                }
            }
        }
        
        if (square.x + square.width >= CANVAS_WIDTH) {
            square.direction_x = -2;
        }
        
        if (square.x < 0) {
            square.direction_x = 2;
        }
        
        if (square.y + square.height >= CANVAS_HEIGHT) {
            square.direction_y = -2;
        }
        
        if (square.y < 0) {
            square.direction_y = 2;
        }
        
        square.x += square.direction_x;
        square.y += square.direction_y;
    }
}

function start() {
    for (let i = 0; i < square_amount; i++) {
        let attempts = 0;
        let new_square = {};
        
        do {
            new_square = {
                x: Math.floor(Math.random() * (CANVAS_WIDTH - SQUARE_SIZE)),
                y: Math.floor(Math.random() * (CANVAS_HEIGHT - SQUARE_SIZE)),
                direction_x: 1,
                direction_y: 1,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                color: (i === 5) ? "#4287f5" : "#000000",
                plr: (i === 5),
                id: i + 1
            };
            
            attempts += 1;
        } while (squares.some(square => collision(new_square, square)) && attempts < 100);
        
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
    setTimeout(start, 2000);
});
