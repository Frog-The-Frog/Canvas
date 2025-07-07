const firebaseConfig = {
  apiKey: "AIzaSyAqx1W6le7VIudoEoLV2JV4BqvfqRHp1AQ",
  authDomain: "global-canvas-56b21.firebaseapp.com",
  databaseURL: "https://global-canvas-56b21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "global-canvas-56b21",
  storageBucket: "global-canvas-56b21.firebasestorage.app",
  messagingSenderId: "274409636551",
  appId: "1:274409636551:web:ad17e7bd581115a99db4e2",
  measurementId: "G-6ZSZXTX7CB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const eraserBtn = document.getElementById("eraser-btn");
const slider = document.getElementById("size-slider");
const sliderValue = document.getElementById("size-value");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isPainting = false;
let isEraser = false;
let currentSize = parseInt(slider.value);

slider.addEventListener("input", () => {
  currentSize = parseInt(slider.value);
  sliderValue.textContent = currentSize;
});

function toggleEraser() {
  isEraser = !isEraser;
  eraserBtn.textContent = isEraser ? "Silgi: Açık" : "Silgi: Kapalı";
}

function drawLine(x, y, fromFirebase = false, erase = false, size = currentSize) {
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = erase ? "white" : "black";
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  if (!fromFirebase) {
    db.ref("drawings").push({
      x,
      y,
      erase,
      size
    });
  }
}

canvas.addEventListener('mousedown', (e) => {
  isPainting = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);

  db.ref("drawings").push({
    x: e.clientX,
    y: e.clientY,
    erase: isEraser,
    size: currentSize,
    type: "start"
  });
});

canvas.addEventListener('mouseup', () => {
  isPainting = false;
  ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
  if (!isPainting) return;
  drawLine(e.clientX, e.clientY, false, isEraser, currentSize);

  db.ref("drawings").push({
    x: e.clientX,
    y: e.clientY,
    erase: isEraser,
    size: currentSize,
    type: "draw"
  });
});

db.ref("drawings").on("child_added", (snapshot) => {
  const { x, y, erase, size, type } = snapshot.val();
  ctx.lineWidth = size || 5;
  ctx.strokeStyle = erase ? "white" : "black";
  ctx.lineCap = 'round';

  if (type === "start") {
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else if (type === "draw") {
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
});
