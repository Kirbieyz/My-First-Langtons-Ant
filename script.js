const cellSize = 10;
let stepsPerFrame = 50, iterations = 0, coloredCells = 0;
const colors = ["#FF8DA1", "#734F96", "#00FFFF", "#FFA500", "#CCCCFF", "#DFFF00"]/* davoli colors for now */, cellStates = new Map();
const turningRules = [1, -1, 1, -1, 1, -1];
const ants = []
let scale = 1, offsetX = 0, offsetY = 0;
let isPanning = false, startPan = {};
const canvas = document.getElementById("antCanv");
const toDCanv = canvas.getContext("2d");
const pauseButton = document.getElementById("pauseButton");

pauseButton.addEventListener("click", () => {
    stepsPerFrame = stepsPerFrame === 0 ? 50 : 0;
    pauseButton.textContent = stepsPerFrame === 0 ? "Resume" : "Pause";
})

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        stepsPerFrame = stepsPerFrame === 0 ? 50 : 0;
    }
});

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

window.addEventListener("resize", resize);
resize();

canvas.addEventListener("wheel", event => {
    event.preventDefault()
    const worldX = (event.offsetX - offsetX) / (cellSize * scale);
    const worldY = (event.offsetY - offsetY) / (cellSize * scale);
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    scale *= factor;
    offsetX = event.offsetX - worldX * (cellSize * scale);
    offsetY = event.offsetY - worldY * (cellSize * scale);
});

canvas.addEventListener("mousedown", event => {
    isPanning = true;
    startPan = {x: event.clientX, y: event.clientY, offX: offsetX, offY: offsetY};
});

window.addEventListener("mousemove", event => {
    if (!isPanning) return;
    offsetX = startPan.offX + (event.clientX - startPan.x);
    offsetY = startPan.offY + (event.clientY - startPan.y);
});

window.addEventListener("mouseup", () => {isPanning = false;});

function createAnt(x, y, dir = 0) {
    ants.push({x, y, dir})
}

function step() {
    if (stepsPerFrame > 0) {
        iterations++;
    }
    for (const ant of ants) {
        const key = `${ant.x},${ant.y}`;
        const state = cellStates.has(key) ? cellStates.get(key) : 0; 
        const newState = (state + 1) % colors.length;
        if (!cellStates.has(key)) {
            coloredCells++;
        }
        cellStates.set(key, newState);
        ant.dir = (ant.dir + turningRules[state] + 4) % 4;
        if (ant.dir === 0) ant.y--;
        else if (ant.dir === 1) ant.x++;
        else if (ant.dir === 2) ant.y++;
        else ant.x--;
    }
}

for (let i = 100; i > 0; i--) {
    createAnt(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 3))
}

function draw() {
    toDCanv.save();
    toDCanv.setTransform(1, 0, 0, 1, 0, 0);
    toDCanv.clearRect(0, 0, canvas.width, canvas.height);
    toDCanv.translate(offsetX, offsetY);
    toDCanv.scale(scale, scale);
    for (const [key, state] of cellStates.entries()) {
        const [x, y] = key.split(",").map(Number);
        toDCanv.fillStyle = colors[state];
        toDCanv.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    toDCanv.fillStyle = "blue";
    for (const ant of ants) {
        toDCanv.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize, cellSize);
    }
    toDCanv.restore();
    toDCanv.fillStyle = "black";
    toDCanv.font = "16px Arial";
    toDCanv.fillText(`Colored Cells: ${coloredCells}`, 10, 20);

    const textWidth = toDCanv.measureText(`Colored Cells: ${coloredCells}`).width;
    const buttonX = 20 + textWidth;
    const buttonY = 5;
    const buttonWidth = 100;
    const buttonHeight = 30;

    /* code for the pause button please god save my soul its 3am */
    toDCanv.fillStyle = stepsPerFrame === 0 ? "#FF0000" : "#007BFF";
    toDCanv.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    const buttonText = stepsPerFrame === 0 ? "Resume" : "Pause";
    const buttonTextWidth = toDCanv.measureText(buttonText).width;
    toDCanv.fillStyle = "white";
    toDCanv.fillText(buttonText, buttonX + (buttonWidth - buttonTextWidth) / 2, buttonY + (buttonHeight + 16) / 2);
}

canvas.addEventListener("click", event => {
    const textWidth = toDCanv.measureText(`Colored Cells: ${coloredCells}`).width;
    const buttonX = 20 + textWidth, buttonY = 5, buttonWidth = 100, buttonHeight = 30;
    const x = event.offsetX;
    const y = event.offsetY;

    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        stepsPerFrame = stepsPerFrame === 0 ? 50 : 0;
    }
});

function animate() {
    for (let i = 0; i < stepsPerFrame; i++) step();
    draw();
    requestAnimationFrame(animate);
    if (iterations % 100 === 0 && stepsPerFrame > 0) {
        console.log(`Iterations: ${iterations}`);
    }
}

animate();
