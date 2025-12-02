/* CONSTANTS */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const grassImg = new Image();
grassImg.src = "./assets/images/grass.png";

/* SCALING */
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

/* SETTINGS */
const FPS = 50;

const MAP_WIDTH = 4000
const MAP_HEIGHT = 4000

const CANVAS_WIDTH = canvas.width / dpr;
const CANVAS_HEIGHT = canvas.height / dpr;

const SQUARE_SIZE = Math.ceil(CANVAS_WIDTH / 20);

/* VARIABLES */

let keys_pressed = [];

/* CLASSES */

class Player {
    constructor(id, {x = 0, y = 0} = {}) {
        this.x = x
        this.y = y
        this.width = SQUARE_SIZE
        this.height = SQUARE_SIZE
        this.id = id
    }
    
    move(x, y) {
        this.x += x
        this.y += y
    }
    
    draw(camera) {
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height)
    }
}

class Camera {
    constructor(player, {x = 0, y = 0} = {}) {
        this.player = player
        this.x = x
        this.y = y
        this.width = CANVAS_WIDTH
        this.height = CANVAS_HEIGHT
    }

    update() {
        this.x = this.player.x - this.width / 2;
        this.y = this.player.y - this.height / 2;

        this.x = Math.max(0, Math.min(this.x, MAP_WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, MAP_HEIGHT - this.height));
    }
}

/* code */
let player = new Player(1)
let camera = new Camera(player)

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

function collision(x1, y1, width1, height1, x2, y2, width2, height2) {
    return !(x1 + width1 <= x2 || x1 >= x2 + width2 || y1 + height1 <= y2 || y1 >= y2 + height2);
};

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (grassImg.complete) {
        const tileW = 72;
        const tileH = 72;
    
        const px = camera.x * 0.8;
        const py = camera.y * 0.8;
    
        const offsetX = Math.floor(-px % tileW);
        const offsetY = Math.floor(-py % tileH);
    
        for (let x = offsetX - tileW; x < CANVAS_WIDTH; x += tileW) {
            for (let y = offsetY - tileH; y < CANVAS_HEIGHT; y += tileH) {
                ctx.drawImage(grassImg, x, y, tileW, tileH);
            }
        }
    }

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
                player.move(key_info.amount[0], key_info.amount[1]);

                // prevent player from going out of bounds
                player.x = Math.min(player.x, MAP_WIDTH - SQUARE_SIZE);
                player.y = Math.min(player.y, MAP_HEIGHT - SQUARE_SIZE);

                player.x = Math.max(player.x, 0);
                player.y = Math.max(player.y, 0);
            }
        }
    });

    player.draw(camera)
    camera.update()
}

/* main loop */
function init() {
    window.drawInterval = setInterval(draw, 1000 / FPS);
                  
    document.body.addEventListener("keydown", keyDownHandler);
    document.body.addEventListener("keyup", keyUpHandler);
}

document.addEventListener("DOMContentLoaded", init);
