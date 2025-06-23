/* CONSTANTS */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");
const FPS = 50

/* FUNCTIONS */

let clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
let drawRect = (x, y, width, height, color) => {ctx.fillStyle = color; ctx.fillRect(x, y, width, height)};
let drawText = (x, y, font, size, text) => {ctx.font = `${size}px ${font}`; ctx.fillText(text, x, y)};

function draw() {
    clearCanvas()
}

setInterval(draw, 1000 / FPS)
