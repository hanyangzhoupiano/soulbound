/* CONSTANTS */
const canvas = document.getElementById("canvas");
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

/* VARIABLES */

let keys_pressed = [];

let cube_things = [];
let players = [];
let enemies = [];

let enemy_speed = 2;

let score = 0;

cube_things.push({
    orbit_center: [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2],
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    direction: 1,
    radius: 200,
    angle: 0,
    maxAngle: Math.PI * 2 / 6,
    speed: 0.05,
    id: 1
});

players.push({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    id: 1
});

/* code */
function keyDownHandler(e) {
    let index = keys_pressed.indexOf(e.key);
    if (index <= -1) {
        // add key to keys_pressed
        
        keys_pressed.push(e.key);
    }
}
                
function keyUpHandler(e) {
    let index = keys_pressed.indexOf(e.key);
    if (index > -1) {
        // remove key from keys_pressed
        
        keys_pressed.splice(index, 1);
    }
}

function collision(x1, y1, width1, height1, x2, y2, width2, height2) {
    return !(x1 + width1 <= x2 || x1 >= x2 + width2 || y1 + height1 <= y2 || y1 >= y2 + height2);
};

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    cube_things.forEach((cube_thing) => {
        players.forEach((plr) => {
            if (plr.id === cube_thing.id) {
                cube_thing.orbit_center = [plr.x + SQUARE_SIZE / 2, plr.y + SQUARE_SIZE / 2];
            }
        });
        
        // update cube thing and spin it a little
        cube_thing.x = cube_thing.orbit_center[0] + cube_thing.radius * Math.cos(cube_thing.angle) - SQUARE_SIZE / 2;
        cube_thing.y = cube_thing.orbit_center[1] + cube_thing.radius * Math.sin(cube_thing.angle) - SQUARE_SIZE / 2;

        // update angle
        cube_thing.angle += cube_thing.direction * cube_thing.speed;

        // reverse direction if angle exceeds maxAngle in either direction
        if (cube_thing.angle > cube_thing.maxAngle || cube_thing.angle < -cube_thing.maxAngle) {
            cube_thing.direction *= -1;
        }

        enemies.forEach((enemy) => {
            if (collision(cube_thing.x, cube_thing.y, SQUARE_SIZE, SQUARE_SIZE, enemy.x, enemy.y, SQUARE_SIZE, SQUARE_SIZE)) {
                let index = enemies.indexOf(enemy);
                if (index > -1) {
                    enemies.splice(index, 1)

                    score++;
                }
            }
        })
        
        // draw cube thing
        ctx.fillStyle = "#3683ff";
        ctx.fillRect(cube_thing.x, cube_thing.y, SQUARE_SIZE, SQUARE_SIZE);
    })

    // move enemies + draw enemies
    enemies.forEach((enemy) => {
        enemy.x -= enemy.multiplier * enemy_speed;
        if (enemy.x <= 0) {
            /*
            let index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1)
            }
            */

            clearInterval(window.drawInterval);
            clearInterval(window.enemyInterval);
            alert("You lose! (an enemy made it past you)")
            alert("Score: " + String(score))
            window.location.reload();
        }

        ctx.fillStyle = "#000000";
        ctx.fillRect(enemy.x, enemy.y, SQUARE_SIZE, SQUARE_SIZE);
    });

    // monitor keys pressed
    keys_pressed.forEach((key) => {
        let key_table = {
            "w": {action: "move", amount: [0, -5]},
            "a": {action: "move", amount: [-5, 0]},
            "s": {action: "move", amount: [0, 5]},
            "d": {action: "move", amount: [5, 0]}
        }
        
        if (key in key_table) {
            let key_info = key_table[key];

            if (key_info.action === "move") {
                players.forEach((plr) => {
                    plr.x += key_info.amount[0];
                    plr.y += key_info.amount[1];

                    // prevent player from going out of bounds
                    plr.x = Math.min(plr.x, CANVAS_WIDTH - SQUARE_SIZE);
                    plr.y = Math.min(plr.y, CANVAS_HEIGHT - SQUARE_SIZE);

                    plr.x = Math.max(plr.x, 0);
                    plr.y = Math.max(plr.y, 0);
                });
            }
        }
    });

    // draw players + enemy collision
    players.forEach((plr) => {
        enemies.forEach((enemy) => {
            if (collision(plr.x, plr.y, SQUARE_SIZE, SQUARE_SIZE, enemy.x, enemy.y, SQUARE_SIZE, SQUARE_SIZE)) {
                clearInterval(window.drawInterval);
                clearInterval(window.enemyInterval);
                alert("You lose!")
                alert("Score: " + String(score))
                window.location.reload();
            }
        })
        
        ctx.fillStyle = "#f54531";
        ctx.fillRect(plr.x, plr.y, SQUARE_SIZE, SQUARE_SIZE);
    });
}

/* main loop */
function init() {
    window.drawInterval = setInterval(draw, 1000 / FPS);
    window.enemyInterval = setInterval(function() {
        enemies.push({
            x: CANVAS_WIDTH,
            y: Math.floor(Math.random() * (CANVAS_HEIGHT - SQUARE_SIZE - 20) + 20),
            multiplier: Math.random() < 0.2 ? 2 : 1
        });
    }, Math.floor(Math.random() * 1700 + 300));
    window.dashInterval = setInterval(function() {
        setTimeout(function() {
            if (enemy_speed === 2) {
                enemy_speed = 5;
                setTimeout(function() {enemy_speed = 2}, 600);
            }
        }, Math.floor(Math.random() * 1500 + 500));
    }, 1000);
    
    // input handling
                  
    document.body.addEventListener("keydown", keyDownHandler);
    document.body.addEventListener("keyup", keyUpHandler);
}

document.addEventListener("DOMContentLoaded", init);
