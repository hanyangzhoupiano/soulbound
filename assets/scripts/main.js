/* CONSTANTS */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

/* FUNCTIONS */

let clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
let drawRect = (x, y, width, height, color) => {ctx.fillStyle = color; ctx.fillRect(x, y, width, height)};

function draw() {
    clearCanvas()
    drawRect(Math.floor(Math.random() * 350 + 50), Math.floor(Math.random() * 350 + 50), 50, 50, "#000000")
}

setInterval(draw, 50)
