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

let x = CANVAS_WIDTH / 2 - SQUARE_SIZE;
let y = CANVAS_WIDTH / 2 - SQUARE_SIZE;
let angle = 0;
const radius = 5;

/* code */

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillRect(x + (radius * Math.cos(angle)), x + (radius * Math.cos(angle)), SQUARE_SIZE, SQUARE_SIZE);

    angle += 1;
}

/* main loop */

function init() {
    setInterval(draw, 1000 / FPS);
}

document.addEventListener("DOMContentLoaded", init);
