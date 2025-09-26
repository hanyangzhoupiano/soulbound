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

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    cube_things.forEach((cube_thing) => {
        players.forEach((plr) => {
            if (plr.id === cube_thing.id) {
                cube_thing.orbit_center = [plr.x, plr.y];
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
        
        // draw cube thing
        ctx.fillRect(cube_thing.x, cube_thing.y, SQUARE_SIZE, SQUARE_SIZE);
    })

    // monitor keys pressed
    keys_pressed.forEach((key) => {
        let key_table = {
            "w": {action: "move", amount: [0, -2]},
            "a": {action: "move", amount: [-2, 0]},
            "s": {action: "move", amount: [0, 2]},
            "d": {action: "move", amount: [2, 0]}
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

    // draw players
    players.forEach((plr) => {
        ctx.fillRect(plr.x, plr.y, SQUARE_SIZE, SQUARE_SIZE);
    });
}

/* main loop */
function init() {
    setInterval(draw, 1000 / FPS);
    
    // input handling
                  
    document.body.addEventListener("keydown", keyDownHandler);
    document.body.addEventListener("keyup", keyUpHandler);
}

document.addEventListener("DOMContentLoaded", init);
