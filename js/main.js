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
const presetSelect = document.getElementById('presetSelect');
const newPresetNameInput = document.getElementById('newPresetName');
const savePresetBtn = document.getElementById('savePresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');

// --- State Management ---
let state = {
    characters: [], // Array to hold individual character objects { char, x, y, isDragging, offsetX, offsetY }
    isGroupDragging: false,
    groupDragOffsetX: 0,
    groupDragOffsetY: 0,
    get isIndividualMode() {
        return individualModeSwitch.checked;
    },
    presets: [] // Array to hold user-defined and default presets
};

// --- Preset Management Functions ---

function loadPresets() {
    const storedPresets = localStorage.getItem('iconGeneratorPresets');
    if (storedPresets) {
        state.presets = JSON.parse(storedPresets);
    } else {
        state.presets = [...DEFAULT_PRESETS];
    }
    populatePresets();
}

function savePresets() {
    localStorage.setItem('iconGeneratorPresets', JSON.stringify(state.presets));
    populatePresets();
}

function populatePresets() {
    presetSelect.innerHTML = '';
    state.presets.forEach((preset, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = preset.name;
        presetSelect.appendChild(option);
    });
    // Select the first preset by default or the last selected one
    if (state.presets.length > 0) {
        presetSelect.value = 0;
        applyPreset(state.presets[0]);
    }
}

function applyPreset(preset) {
    if (preset.type === "gradient") {
        bgColor1Input.value = preset.bgColor1;
        bgColor2Input.value = preset.bgColor2;
        gradientDirectionSelect.value = preset.gradientDirection;
        gradientSmoothnessInput.value = preset.gradientSmoothness;
    } else if (preset.type === "image") {
        // Future: Handle image background application
        console.log("Image preset selected: ", preset.imageUrl);
    }
    drawCanvasBackground();
}

function handleSavePreset() {
    const name = newPresetNameInput.value.trim();
    if (!name) {
        alert("请输入方案名称！");
        return;
    }
    const existingPreset = state.presets.find(p => p.name === name);
    if (existingPreset) {
        if (!confirm(`方案 "${name}" 已存在，是否覆盖？`)) {
            return;
        }
        // Update existing preset
        existingPreset.bgColor1 = bgColor1Input.value;
        existingPreset.bgColor2 = bgColor2Input.value;
        existingPreset.gradientDirection = gradientDirectionSelect.value;
        existingPreset.gradientSmoothness = gradientSmoothnessInput.value;
        existingPreset.type = "gradient"; // Ensure type is gradient when saving current settings
    } else {
        // Add new preset
        state.presets.push({
            name: name,
            type: "gradient",
            bgColor1: bgColor1Input.value,
            bgColor2: bgColor2Input.value,
            gradientDirection: gradientDirectionSelect.value,
            gradientSmoothness: gradientSmoothnessInput.value
        });
    }
    savePresets();
    newPresetNameInput.value = '';
}

function handleDeletePreset() {
    const selectedIndex = presetSelect.value;
    if (selectedIndex === "") {
        alert("请选择要删除的方案！");
        return;
    }
    // Check if it's a default preset (by comparing with DEFAULT_PRESETS array)
    const selectedPreset = state.presets[selectedIndex];
    const isDefault = DEFAULT_PRESETS.some(defaultP => 
        defaultP.name === selectedPreset.name && 
        defaultP.type === selectedPreset.type &&
        defaultP.bgColor1 === selectedPreset.bgColor1 &&
        defaultP.bgColor2 === selectedPreset.bgColor2 &&
        defaultP.gradientDirection === selectedPreset.gradientDirection &&
        defaultP.gradientSmoothness === selectedPreset.gradientSmoothness
    );

    if (isDefault) {
        alert("默认方案不能删除！");
        return;
    }

    if (confirm(`确定要删除方案 "${state.presets[selectedIndex].name}" 吗？`)) {
        state.presets.splice(selectedIndex, 1);
        savePresets();
        // Select the first preset after deletion
        if (state.presets.length > 0) {
            presetSelect.value = 0;
            applyPreset(state.presets[0]);
        }
    }
}

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

function applyPreset(preset) {
    // Hide all controls initially
    document.getElementById('bgColor1').closest('.row').style.display = 'none';
    document.getElementById('gradientDirection').closest('.mb-1').style.display = 'none';
    document.getElementById('gradientSmoothness').closest('.mb-2').style.display = 'none';

    if (preset.type === "gradient") {
        bgColor1Input.value = preset.bgColor1;
        bgColor2Input.value = preset.bgColor2;
        gradientDirectionSelect.value = preset.gradientDirection;
        gradientSmoothnessInput.value = preset.gradientSmoothness;
        
        // Show gradient controls
        document.getElementById('bgColor1').closest('.row').style.display = 'flex';
        document.getElementById('gradientDirection').closest('.mb-1').style.display = 'block';
        document.getElementById('gradientSmoothness').closest('.mb-2').style.display = 'block';

    } else if (preset.type === "image") {
        // For image presets, we don't need to set gradient inputs
        // The drawCanvasBackground will handle loading the image
        console.log("Image preset selected: ", preset.imageUrl);
    }
    drawCanvasBackground();
}

function handleSavePreset() {
    const name = newPresetNameInput.value.trim();
    if (!name) {
        alert("请输入方案名称！");
        return;
    }
    const existingPreset = state.presets.find(p => p.name === name);
    
    // Determine the type of preset to save based on current UI state or a new input (if added)
    // For now, we assume saving the current gradient settings.
    const currentPresetType = "gradient"; 

    const newPreset = {
        name: name,
        type: currentPresetType,
        // Only save gradient properties for now
        bgColor1: bgColor1Input.value,
        bgColor2: bgColor2Input.value,
        gradientDirection: gradientDirectionSelect.value,
        gradientSmoothness: gradientSmoothnessInput.value
    };

    if (existingPreset) {
        if (!confirm(`方案 "${name}" 已存在，是否覆盖？`)) {
            return;
        }
        // Update existing preset
        Object.assign(existingPreset, newPreset);
    } else {
        // Add new preset
        state.presets.push(newPreset);
    }
    savePresets();
    newPresetNameInput.value = '';
}

function handleDeletePreset() {
    const selectedIndex = presetSelect.value;
    if (selectedIndex === "") {
        alert("请选择要删除的方案！");
        return;
    }
    // Check if it's a default preset (by comparing with DEFAULT_PRESETS array)
    const selectedPreset = state.presets[selectedIndex];
    const isDefault = DEFAULT_PRESETS.some(defaultP => 
        defaultP.name === selectedPreset.name && 
        defaultP.type === selectedPreset.type &&
        // Compare gradient properties if type is gradient
        (defaultP.type === "gradient" ? (
            defaultP.bgColor1 === selectedPreset.bgColor1 &&
            defaultP.bgColor2 === selectedPreset.bgColor2 &&
            defaultP.gradientDirection === selectedPreset.gradientDirection &&
            defaultP.gradientSmoothness === selectedPreset.gradientSmoothness
        ) : true) && // If not gradient, don't compare gradient properties
        // Compare image properties if type is image (future)
        (defaultP.type === "image" ? (defaultP.imageUrl === selectedPreset.imageUrl) : true)
    );

    if (isDefault) {
        alert("默认方案不能删除！");
        return;
    }

    if (confirm(`确定要删除方案 "${state.presets[selectedIndex].name}" 吗？`)) {
        state.presets.splice(selectedIndex, 1);
        savePresets();
        // Select the first preset after deletion
        if (state.presets.length > 0) {
            presetSelect.value = 0;
            applyPreset(state.presets[0]);
        }
    }
}

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
    const currentPreset = state.presets[presetSelect.value];

    if (currentPreset && currentPreset.type === "image") {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Draw highlight on top of image
            const highlightGradient = ctx.createRadialGradient(0, 0, canvas.width * 0.5, 0, 0, canvas.width);
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = highlightGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        img.src = currentPreset.imageUrl;
    } else { // Default to gradient if no preset or gradient type
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
        charEl.style.letterSpacing = '0.02em'; // Add proportional letter spacing
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
[textColorInput, fontSizeInput, fontFamilySelect].forEach(input => input.addEventListener('input', () => {
    updateTextPreview();
    // Re-initialize character states if font size changes to recalculate layout
    if (input === fontSizeInput) {
        initializeCharacterStates();
    }
}));
iconTextarea.addEventListener('input', initializeCharacterStates);
resetPositionBtn.addEventListener('click', initializeCharacterStates);
downloadBtn.addEventListener('click', handleDownload);

presetSelect.addEventListener('change', (e) => {
    applyPreset(state.presets[e.target.value]);
});
presetSelect.addEventListener('change', (e) => {
    applyPreset(state.presets[e.target.value]);
});
savePresetBtn.addEventListener('click', handleSavePreset);
deletePresetBtn.addEventListener('click', handleDeletePreset);

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

// Initial render on page load
window.onload = () => {
    loadPresets(); // Load presets first
    drawCanvasBackground();
    initializeCharacterStates();
};