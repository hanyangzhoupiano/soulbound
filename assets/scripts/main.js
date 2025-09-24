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

// orbit center (canvas center)
const centerX = CANVAS_WIDTH / 2;
const centerY = CANVAS_HEIGHT / 2;

let angle = 0;
let direction = 1;
const radius = 200;
const maxAngle = Math.PI * 2 / 3;
const speed = 0.05;

/* code */
function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const x = centerX + radius * Math.cos(angle) - SQUARE_SIZE / 2;
    const y = centerY + radius * Math.sin(angle) - SQUARE_SIZE / 2;

    ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

    angle += direction * speed;

    if (angle > maxAngle || angle < -maxAngle) {
        direction *= -1;
    }
}

/* main loop */
function init() {
    setInterval(draw, 1000 / FPS);
}

document.addEventListener("DOMContentLoaded", init);
