const cellSize = 10, stepsPerFrame = 50;
const colors = ["#FF8DA1", "#734F96", "#00FFFF", "#FFA500", "#CCCCFF", "#DFFF00"]/* davoli colors for now */, cellStates = new Map();
const turningRules = [1, -1, 1, -1, 1, -1];
const ants = []
let scale = 1, offsetX = 0, offsetY = 0;
let isPanning = false, startPan = {};

const canvas = document.getElementById("antCanv");
const toDCanv = canvas.getContext("2d");
function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight
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
    for (const ant of ants) {
        const key = `${ant.x},${ant.y}`;
        const state = cellStates.has(key) ? cellStates.get(key) : 0; 
        const newState = (state + 1) % colors.length;
        cellStates.set(key, newState);
        ant.dir = (ant.dir + turningRules[state] + 4) % 4;
        if (ant.dir === 0) ant.y--;
        else if (ant.dir === 1) ant.x++;
        else if (ant.dir === 2) ant.y++;
        else ant.x--;
    }
}

for (i = 5; i > 0; i--) {
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
}

function animate() {
    for (let i = 0; i < stepsPerFrame; i++) step();
    draw();
    requestAnimationFrame(animate);
}
animate();