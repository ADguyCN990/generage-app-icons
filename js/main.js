// --- DOM Element Acquisition ---
const canvas = document.getElementById('iconCanvas');
const ctx = canvas.getContext('2d');
const iconTextarea = document.getElementById('iconText');
const textColorInput = document.getElementById('textColor');
const fontSizeInput = document.getElementById('fontSize');
const bgColor1Input = document.getElementById('bgColor1');
const bgColor2Input = document.getElementById('bgColor2');
const gradientDirectionSelect = document.getElementById('gradientDirection');
const gradientSmoothnessInput = document.getElementById('gradientSmoothness');
const fontFamilySelect = document.getElementById('fontFamily');
const downloadBtn = document.getElementById('downloadBtn');
const resetPositionBtn = document.getElementById('resetPositionBtn');
const individualModeSwitch = document.getElementById('individualModeSwitch');
const draggableTextContainer = document.getElementById('draggableTextContainer');

// --- State Management ---
let state = {
    characters: [], // Array to hold individual character objects { char, x, y, isDragging, offsetX, offsetY }
    isGroupDragging: false,
    groupDragOffsetX: 0,
    groupDragOffsetY: 0,
    get isIndividualMode() {
        return individualModeSwitch.checked;
    }
};

// --- Core Functions ---

/**
 * Initializes or resets the character positions based on the textarea content.
 */
function initializeCharacterStates() {
    const text = iconTextarea.value;
    const fontSize = parseInt(fontSizeInput.value, 10);
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalTextHeight) / 2 + lineHeight / 2;

    state.characters = [];
    let charIndex = 0;
    lines.forEach((line, lineIndex) => {
        const totalLineWidth = calculateLineWidth(line);
        const startX = (canvas.width - totalLineWidth) / 2;
        let currentX = startX;

        for (const char of line) {
            const charWidth = calculateLineWidth(char);
            state.characters.push({
                id: charIndex++,
                char: char,
                x: currentX + charWidth / 2, // Center of the character
                y: startY + lineIndex * lineHeight,
                isDragging: false,
                offsetX: 0,
                offsetY: 0
            });
            currentX += charWidth;
        }
    });
    updateTextPreview();
}

/**
 * Returns the current font style string based on selections.
 */
function getFontString() {
    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    return `bold ${fontSize}px ${fontFamily}`;
}

/**
 * Calculates the width of a text string.
 */
function calculateLineWidth(text) {
    ctx.font = getFontString();
    return ctx.measureText(text).width;
}

/**
 * Draws the background canvas (gradient + highlight).
 */
function drawCanvasBackground() {
    // 1. Draw linear gradient background
    const direction = gradientDirectionSelect.value;
    let x0, y0, x1, y1;

    switch (direction) {
        case 'to top right':
            x0 = 0; y0 = canvas.height; x1 = canvas.width; y1 = 0;
            break;
        case 'to bottom right':
            x0 = 0; y0 = 0; x1 = canvas.width; y1 = canvas.height;
            break;
        case 'to right':
            x0 = 0; y0 = canvas.height / 2; x1 = canvas.width; y1 = canvas.height / 2;
            break;
        case 'to left':
            x0 = canvas.width; y0 = canvas.height / 2; x1 = 0; y1 = canvas.height / 2;
            break;
        case 'to top':
            x0 = canvas.width / 2; y0 = canvas.height; x1 = canvas.width / 2; y1 = 0;
            break;
        case 'to bottom':
            x0 = canvas.width / 2; y0 = 0; x1 = canvas.width / 2; y1 = canvas.height;
            break;
        default:
            x0 = 0; y0 = canvas.height / 2; x1 = canvas.width; y1 = canvas.height / 2; // Default to left to right
            break;
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    const smoothness = parseInt(gradientSmoothnessInput.value, 10) / 100; // Normalize to 0-1

    // Adjust color stops based on smoothness
    const color1End = 0.5 - (0.5 * smoothness);
    const color2Start = 0.5 + (0.5 * smoothness);

    gradient.addColorStop(0, bgColor1Input.value);
    gradient.addColorStop(color1End, bgColor1Input.value);
    gradient.addColorStop(color2Start, bgColor2Input.value);
    gradient.addColorStop(1, bgColor2Input.value);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw top-left highlight
    const highlightGradient = ctx.createRadialGradient(0, 0, canvas.width * 0.5, 0, 0, canvas.width);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Updates the DOM to show the draggable character elements.
 */
function updateTextPreview() {
    draggableTextContainer.innerHTML = ''; // Clear previous elements
    const color = textColorInput.value;
    const font = getFontString();

    state.characters.forEach(charState => {
        const charEl = document.createElement('span');
        charEl.textContent = charState.char;
        charEl.style.position = 'absolute';
        charEl.style.left = `${charState.x}px`;
        charEl.style.top = `${charState.y}px`;
        charEl.style.transform = 'translate(-50%, -50%)'; // Center the element
        charEl.style.font = font;
        charEl.style.color = color;
        charEl.style.cursor = 'move';
        charEl.dataset.id = charState.id;
        
        // Add event listeners for dragging
        charEl.addEventListener('mousedown', handleMouseDown);
        
        draggableTextContainer.appendChild(charEl);
    });
}

// --- Event Handlers ---

function handleMouseDown(e) {
    // Allow native drag for range input
    if (e.target === gradientSmoothnessInput) {
        return;
    }
    e.preventDefault();
    const canvasRect = canvas.getBoundingClientRect();
    
    if (state.isIndividualMode) {
        const id = parseInt(e.target.dataset.id, 10);
        const charState = state.characters.find(c => c.id === id);
        if (charState) {
            charState.isDragging = true;
            charState.offsetX = e.clientX - canvasRect.left - charState.x;
            charState.offsetY = e.clientY - canvasRect.top - charState.y;
        }
    } else {
        state.isGroupDragging = true;
        state.groupDragOffsetX = e.clientX;
        state.groupDragOffsetY = e.clientY;
    }
    draggableTextContainer.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    e.preventDefault();
    const canvasRect = canvas.getBoundingClientRect();

    if (state.isIndividualMode) {
        const draggingChar = state.characters.find(c => c.isDragging);
        if (draggingChar) {
            const newX = e.clientX - canvasRect.left - draggingChar.offsetX;
            const newY = e.clientY - canvasRect.top - draggingChar.offsetY;
            draggingChar.x = Math.max(0, Math.min(canvas.width, newX));
            draggingChar.y = Math.max(0, Math.min(canvas.height, newY));
            updateTextPreview();
        }
    } else if (state.isGroupDragging) {
        const dx = e.clientX - state.groupDragOffsetX;
        const dy = e.clientY - state.groupDragOffsetY;

        state.characters.forEach(charState => {
            charState.x += dx;
            charState.y += dy;
        });

        state.groupDragOffsetX = e.clientX;
        state.groupDragOffsetY = e.clientY;
        updateTextPreview();
    }
}

function handleMouseUp(e) {
    state.isGroupDragging = false;
    state.characters.forEach(c => c.isDragging = false);
    draggableTextContainer.style.cursor = 'default';
}

function handleDownload() {
    drawCanvasBackground(); // Redraw background to ensure it's current

    ctx.fillStyle = textColorInput.value;
    ctx.font = getFontString();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw each character at its specific position
    state.characters.forEach(charState => {
        ctx.fillText(charState.char, charState.x, charState.y);
    });

    const link = document.createElement('a');
    link.download = `${iconTextarea.value.split('\n')[0]}_icon.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Redraw background after a short delay to restore the clean canvas for the user
    setTimeout(drawCanvasBackground, 100);
}

// --- Initial Setup & Event Listeners ---

// Register all event listeners
[bgColor1Input, bgColor2Input, gradientDirectionSelect, gradientSmoothnessInput].forEach(input => input.addEventListener('input', drawCanvasBackground));
[textColorInput, fontSizeInput, fontFamilySelect].forEach(input => input.addEventListener('input', updateTextPreview));
iconTextarea.addEventListener('input', initializeCharacterStates);
resetPositionBtn.addEventListener('click', initializeCharacterStates);
downloadBtn.addEventListener('click', handleDownload);

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

// Initial render on page load
window.onload = () => {
    drawCanvasBackground();
    initializeCharacterStates();
};