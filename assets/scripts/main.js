/* CONSTANTS */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

/* SCALING */

const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

/* SETTINGS */

const FPS = 50;

const CANVAS_WIDTH = canvas.width / dpr;
const CANVAS_HEIGHT = canvas.height / dpr;

const SQUARE_SIZE = Math.ceil(CANVAS_WIDTH / 20);
const SPEED = 5;

let animation_id;

let running = true;

/* VARIABLES */

let players = [];
let squares = [];
let square_amount = 5;

let keys_pressed = [];
let speed_boost = 0;

let transition_effect = false;
let score = 0;

let file_text = ``;
let save_files = [
    {},
    {},
    {},
    {},
    {},
    {}
];

const start_button = {
    x: (CANVAS_WIDTH / 2) - Math.ceil(CANVAS_WIDTH / 10),
    y: (CANVAS_HEIGHT / 2) + Math.ceil(CANVAS_HEIGHT / 8),
    width: Math.ceil(CANVAS_WIDTH / 5),
    height: 30
}

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

let save = (file) => {
    let data = save_files[file - 1];
    if (data) {
        let text = `FILE ${file} SAVED`;
        
        file_text = text;
        setTimeout(() => {
            if (file_text == text) {
                file_text = ``;
            }
        }, 1400);
        
        data.players = [];
        data.squares = [];
        
        for (const player in players) {
            data.players.push({
                x: player.x,
                y: player.y,
                health: player.health,
                speed: player.speed,
                invincible: player.invincible,
                dash: player.dash,
                id: player.id
            });
        };

        for (const square in squares) {
            data.squares.push({
                x: square.x,
                y: square.y,
                vx: square.vx,
                vy: square.vy,
                color: square.color
            });
        };
    }
};

let load = (file) => {
    let data = save_files[file - 1];
    if (data) {
        let text = `FILE ${file} LOADED`;
        
        file_text = text;
        setTimeout(() => {
            if (file_text == text) {
                file_text = ``;
            }
        }, 1400);
        
        if (data.players && data.squares) {
            for (const player in players) {
                data.players.forEach((save_state) => {
                    if (save_state.id == player.id) {
                        player.x = save_state.x;
                        player.y = save_state.y;
                        
                        player.health = save_state.health;
                        player.speed = save_state.speed;
                        player.invincible = save_state.invincible;
                        player.dash = save_state.dash;
                    }
                });
            }
    
            for (const square in squares) {
                data.squares.forEach((save_state) => {
                    if (save_state.id == square.id) {
                        square.x = save_state.x;
                        square.y = save_state.y;
                        
                        square.vx = save_state.vx;
                        square.vy = save_state.vy;
                        square.color = save_state.color;
                    }
                });
            }
        }
    }
};

/* USER INPUT */

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

function clickHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);

    if (
        x >= start_button.x && x <= start_button.x + start_button.width &&
        y >= start_button.y && y <= start_button.y + start_button.height
    ) {
        document.removeEventListener("click", clickHandler);
        start();
    }
}

/* RENDERING */

function renderStaticEffectFrame() {
    const image = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = image.data;

    for (let i = 0; i < data.length; i += 4) {
        const shade = Math.random() < 0.5 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = shade;
        data[i + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);
}

function draw() {
    if (!running) return;
    
    clearCanvas();
    
    drawText(CANVAS_WIDTH / 2, 20, "24px Arial", "Score: " + score, "#000000");

    if (file_text) {
        drawText(20, CANVAS_HEIGHT - 20, "36px Arial", file_text, "#f7f72f");
    };
    
    for (const square of squares) {
        drawRect(square.x, square.y, square.width, square.height, "#000000");
        drawRect(square.x + 4, square.y + 4, square.width - 8, square.height - 8, square.color);
        
        let new_x = square.x + (square.vx + Math.sign(square.vx) * speed_boost);
        let new_y = square.y + (square.vy + Math.sign(square.vy) * speed_boost);
        
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
            if (!player.dash && !player.invincible && collision(new_x, new_y, square.width, square.height, player.x, player.y, player.width, player.height)) {
                player.invincible = true;
                setTimeout(() => {player.invincible = false}, 300);
                
                player.health -= 20;
                player.regeneration_interrupt = true;
                setTimeout(() => {
                    player.regeneration_interrupt = false;
                }, 8000)
                
                if (player.health <= 0) {
                    cancelAnimationFrame(animation_id);
                    running = false;
                    alert("Game Over! Score: " + score);
                    window.location.reload();
                };
            }
        }
        
        if (new_x + square.width >= CANVAS_WIDTH) {
            square.vx = -SPEED - speed_boost;
        }
        
        if (new_x < 0) {
            square.vx = SPEED + speed_boost;
        }
        
        if (new_y + square.height >= CANVAS_HEIGHT) {
            square.vy = -SPEED - speed_boost;
        }
        
        if (new_y < 0) {
            square.vy = SPEED + speed_boost;
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
        if (keys_pressed.includes("q")) {
            if (!player.dash_cooldown) {
                let original_speed = player.speed;

                player.speed += 5;
                player.dash = true;
                
                player.dash_cooldown = true;
                setTimeout(() => {player.dash_cooldown = false}, 2000);
                setTimeout(() => {player.speed = original_speed; player.dash = false}, 450);
            }
        };
        
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            
            dx = (dx / len) * player.speed;
            dy = (dy / len) * player.speed;
        
            player.x += dx;
            player.y += dy;
        }
        
        player.x = Math.max(player.x, 0)
        player.y = Math.max(player.y, 0)
        player.x = Math.min(player.x, CANVAS_WIDTH - SQUARE_SIZE)
        player.y = Math.min(player.y, CANVAS_HEIGHT - SQUARE_SIZE)
        
        drawRect(player.x, player.y, player.width, player.height, "#000000");
        drawRect(player.x + 4, player.y + 4, player.width - 8, player.height - 8, player.invincible ? player.color.invincible : (player.dash ? player.color.dash : player.color.normal));
        
        drawRect(player.x - 4, player.y - 30, player.width + 8, 15, "#000000");
        drawRect(player.x - 2, player.y - 28, Math.ceil((player.health / player.max_health) * (player.width + 4)), 11, "#22f22c");
    };
}

function start() {
    const bossMusic = new Audio("assets/audio/final_boss_1.mp3");
    const bossMusic2 = new Audio("assets/audio/final_boss_2.mp3");
    const transition = new Audio("assets/audio/static.mp3");
    
    bossMusic.volume = 1;
    bossMusic2.volume = 1;
    transition.volume = 1;
    
    bossMusic.loop = false;
    bossMusic2.loop = false;
    transition.loop = false;
    
    let current = bossMusic;
    
    bossMusic.addEventListener('ended', () => {
        current = bossMusic2
        transition.play();
        player.invincible = true;
        
        transition_effect = true;
    });
    
    bossMusic2.addEventListener('ended', () => {
        current = bossMusic;
        transition.play();
        player.invincible = true;
        
        transition_effect = true;
    });
    
    transition.addEventListener('ended', () => {
        transition_effect = false;
        
        player.invincible = false;
        current.play();
    });
    
    current.play();
    
    let player = {
        x: (CANVAS_WIDTH / 2) - SQUARE_SIZE,
        y: (CANVAS_HEIGHT / 2) - SQUARE_SIZE,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        color: {
            normal: "#4287f5",
            invincible: "#f54024",
            dash: "#ffffff"
        },
        speed: 10,
        invincible: false,
        dash: false,
        health: 100,
        max_health: 100,
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
                color: `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`,
                id: i + 1
            };
            
            attempts += 1;
        } while (attempts < max_attempts && squares.some(square => collision(new_square.x, new_square.y, new_square.width, new_square.height, square.x, square.y, square.width, square.height) || collision(new_square.x, new_square.y, new_square.width, new_square.height, player.x - buffer, player.y - buffer, player.width + (buffer * 2), player.height + (buffer * 2))));
        
        squares.push(new_square);
    }
    
    setInterval(() => {
        if (Math.random() < 0.2) {
            let file = Math.floor(Math.random() * 6) + 1;
            
            save(file);
            setTimeout(() => {
                load(file);
            }, 3500);
        }
    }, 10000);
    
    setInterval(() => {
        score += 1;
    }, 200);

    setInterval(() => {
        for (const player in players) {
            if (!player.regeneration_interrupt && player.health < player.max_health) {
                player.health += Math.ceil(player.max_health / 20);
                player.health = Math.min(player.health, player.max_health);
            }
        }
    }, 300);
    
    function gameLoop() {
        if (transition_effect) {
            renderStaticEffectFrame();
        } else {
            draw();
        }
        animation_id = requestAnimationFrame(gameLoop);
    }
    
    animation_id = requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    clearCanvas();
    drawText(start_button.x + start_button.width / 2, CANVAS_HEIGHT / 3, "80px Arial", "dodge the bouncing squares", "#000000");
    
    drawRect(start_button.x - 2, start_button.y - 2, start_button.width + 4, start_button.height + 4, "#000000");

    drawRect(start_button.x, start_button.y, start_button.width, start_button.height, "#22f22c");
    drawText(start_button.x + start_button.width / 2, start_button.y + 15, "18px Arial", "Start", "#000000");
    
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    
    document.addEventListener('click', clickHandler, false);
});
