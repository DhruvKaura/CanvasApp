const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let currentX = 0;
let currentY = 0;

function startPosition(e) {
    painting = true;
    currentX = e.clientX || e.touches[0].clientX;
    currentY = e.clientY || e.touches[0].clientY;
    ctx.beginPath();
    ctx.moveTo(currentX - canvas.offsetLeft, currentY - canvas.offsetTop);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
    saveCanvas();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = getCurrentColor();
    ctx.lineTo(e.clientX || e.touches[0].clientX - canvas.offsetLeft, e.clientY || e.touches[0].clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX || e.touches[0].clientX - canvas.offsetLeft, e.clientY || e.touches[0].clientY - canvas.offsetTop);
}

function saveCanvas() {
    localStorage.setItem('signatureCanvas', canvas.toDataURL());
}

function loadCanvas() {
    const dataURL = localStorage.getItem('signatureCanvas');
    if (dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function getCurrentColor() {
    const activeColor = document.querySelector('.colors .color.active');
    return activeColor ? activeColor.style.backgroundColor : '#000000';
}

function getCurrentBackgroundColor() {
    const activeBackgroundColor = document.querySelector('.background-color.active');
    return activeBackgroundColor ? activeBackgroundColor.style.backgroundColor : '#ffffff';
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mouseout', finishedPosition);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', startPosition);
canvas.addEventListener('touchend', finishedPosition);
canvas.addEventListener('touchmove', draw);

const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvas();
});

const downloadButton = document.getElementById('download-button');
downloadButton.addEventListener('click', () => {
    const format = prompt('Enter format (png or jpeg):');
    if (format === 'png' || format === 'jpeg') {
        const dataURL = downloadAsDataURL(canvas, format);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'signature.' + format;
        link.click();
    } else {
        alert('Invalid format. Please enter png or jpeg.');
    }
});

const backgroundColors = document.querySelectorAll('.background-color');
backgroundColors.forEach((color) => {
    color.addEventListener('click', () => {
        backgroundColors.forEach((c) => c.classList.remove('active'));
        color.classList.add('active');
        canvas.style.backgroundColor = getCurrentBackgroundColor();
        localStorage.setItem('backgroundColor', getCurrentBackgroundColor());
    });
});

const colors = document.querySelectorAll('.color');
colors.forEach((color) => {
    color.addEventListener('click', () => {
        colors.forEach((c) => c.classList.remove('active'));
        color.classList.add('active');
        ctx.strokeStyle = getCurrentColor();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    loadCanvas();
    const savedBackgroundColor = localStorage.getItem('backgroundColor');
    if (savedBackgroundColor) {
        document.querySelector(`.background-color[style="background-color: ${savedBackgroundColor};"]`).click();
    }
});

function downloadAsDataURL(canvas, format) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    tempCtx.globalCompositeOperation = 'destination-over';
    tempCtx.fillStyle = getCurrentBackgroundColor();
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL(format);
}
