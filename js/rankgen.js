// All JS logic from the <script> tag in rankgen.html is placed here. No changes to logic or features.

const canvas = document.getElementById('rankCanvas');
const ctx = canvas.getContext('2d');
const loadingIndicator = document.getElementById('loadingIndicator');

const fontConfig = {
  default: {
    normal: {
      height: 9,
      letterWidth: 5,
      spacing: 1,
      enableShadow: true,
      borderSize: 1
    },
    shadow: {
      height: 9,
      letterWidth: 6,
      spacing: 0
    }
  },
  big_ranks: {
    normal: {
      height: 14,
      letterWidth: 8,
      spacing: 0,
      enableShadow: true,
      borderSize: 3
    },
    shadow: {
      height: 15,
      letterWidth: 10,
      spacing: 0
    }
  },
  border_ranks: {
    normal: {
      height: 11,
      letterWidth: 7,
      spacing: 1,
      enableShadow: false,
      borderSize: 1
    }
  }
};

let FONT_HEIGHT = 9;
let LETTER_WIDTH_NORMAL = 5;
let LETTER_WIDTH_SHADOW = 6;
let SPACING_NORMAL = 1;
let SPACING_SHADOW = 0;

let BORDER = 1;
const INNER_PADDING = 1;

const fontImages = {};
let availableFonts = ['default', 'big_ranks', 'border_ranks'];
let currentZoom = 6;
let rankWidth = 0;
let rankHeight = 0;
let animationFrame;
let imagesLoaded = false;
let backgroundImage = null;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

// Background image handling
const dropZone = document.getElementById('dropZone');
const backgroundImageInput = document.getElementById('backgroundImageInput');
const backgroundControls = document.getElementById('backgroundControls');
const removeBackgroundBtn = document.getElementById('removeBackground');
const backgroundInfo = document.getElementById('backgroundInfo');

// Drop zone events
dropZone.addEventListener('click', () => {
  backgroundImageInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleImageFile(files[0]);
  }
});

backgroundImageInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleImageFile(e.target.files[0]);
  }
});

removeBackgroundBtn.addEventListener('click', () => {
  backgroundImage = null;
  backgroundControls.style.display = 'none';
  dropZone.style.display = 'block';
  backgroundImageInput.value = '';
  generateRank();
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Calculate expected dimensions based on current settings
      const text = document.getElementById('rankText').value.toUpperCase();
      const fontStyle = document.getElementById('fontStyle').value;
      const enableShadow = document.getElementById('enableShadow').checked;
      const enableBorder = document.getElementById('enableBorder').checked;

      const expectedDimensions = calculateRankDimensions(text, fontStyle, enableShadow, enableBorder);

      // Check if dimensions match (allow some tolerance)
      const tolerance = 2;
      if (Math.abs(img.width - expectedDimensions.width) > tolerance ||
          Math.abs(img.height - expectedDimensions.height) > tolerance) {
        const proceed = confirm(
          `Warning: Image dimensions (${img.width}x${img.height}) don't match expected rank dimensions (${expectedDimensions.width}x${expectedDimensions.height}). ` +
          `The image may not fit properly. Continue anyway?`
        );
        if (!proceed) {
          return;
        }
      }

      backgroundImage = img;
      dropZone.style.display = 'none';
      backgroundControls.style.display = 'flex';
      backgroundInfo.textContent = `${file.name} (${img.width}x${img.height})`;
      generateRank();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function calculateRankDimensions(text, fontStyle, enableShadow, enableBorder) {
  const fontType = enableShadow ? 'shadow' : 'normal';
  const config = fontConfig[fontStyle][fontType] || fontConfig[fontStyle].normal;

  const letterWidth = enableShadow ?
    ((fontConfig[fontStyle].shadow || {}).letterWidth || fontConfig[fontStyle].normal.letterWidth + 1) :
    fontConfig[fontStyle].normal.letterWidth;
  const spacing = enableShadow ?
    ((fontConfig[fontStyle].shadow || {}).spacing || 0) :
    fontConfig[fontStyle].normal.spacing;

  const textLength = text.length;
  const innerTextWidth = textLength * letterWidth + (textLength - 1) * spacing;
  const innerWidth = innerTextWidth + INNER_PADDING * 2;
  const borderSize = enableBorder ? (config.borderSize || 1) : 0;
  const totalWidth = innerWidth + borderSize * 2;
  const totalHeight = config.height;

  return { width: totalWidth, height: totalHeight };
}

document.getElementById('rankText').addEventListener('input', function() {
  generateRank();
});

document.getElementById('fontStyle').addEventListener('change', function() {
  const selectedFont = this.value;
  const shadowToggle = document.getElementById('enableShadow');
  const shadowOption = document.querySelector('.option-toggle');

  if (fontConfig[selectedFont] && fontConfig[selectedFont].normal) {
    const supportsShadow = fontConfig[selectedFont].normal.enableShadow !== false;

    if (supportsShadow) {
      shadowOption.style.display = 'flex';
    } else {
      shadowOption.style.display = 'none';
      shadowToggle.checked = false;
    }
  }

  generateRank();
});

document.getElementById('borderColor').addEventListener('input', function() {
  document.getElementById('borderColorValue').textContent = this.value;
  generateRank();
});

document.getElementById('borderEndColor').addEventListener('input', function() {
  document.getElementById('borderEndColorValue').textContent = this.value;
  generateRank();
});

document.getElementById('bgColorStart').addEventListener('input', function() {
  document.getElementById('bgStartValue').textContent = this.value;
  generateRank();
});

document.getElementById('bgColorEnd').addEventListener('input', function() {
  document.getElementById('bgEndValue').textContent = this.value;
  generateRank();
});

document.getElementById('enableShadow').addEventListener('change', function() {
  generateRank();
});

document.getElementById('enableGradientBorder').addEventListener('change', function() {
  const borderEndColorPicker = document.querySelector('.color-picker:nth-child(2)');
  if (this.checked) {
    borderEndColorPicker.style.display = 'block';
  } else {
    borderEndColorPicker.style.display = 'none';
  }
  generateRank();
});

document.getElementById('enableBorder').addEventListener('change', function() {
  generateRank();
});

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

async function fetchAvailableFonts() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(['default', 'rounded', 'small', 'big_ranks', 'border_ranks']);
    }, 500);
  });
}

async function populateFontDropdown() {
  const fontSelect = document.getElementById('fontStyle');
  fontSelect.innerHTML = '';

  for (const font of availableFonts) {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font.charAt(0).toUpperCase() + font.slice(1).replace('_', ' ');
    fontSelect.appendChild(option);
  }
}

async function loadFontImages(fontStyle) {
  if (!fontImages[fontStyle]) {
    fontImages[fontStyle] = {
      normal: {},
      shadow: {}
    };
  }

  const loadPromises = [];

  for (const letter of letters) {
    if (letter === ' ') {
      const blankPromise = loadImage('font/blank.png');
      loadPromises.push(blankPromise);
      blankPromise.then(img => {
        fontImages[fontStyle].normal[letter] = img;
        fontImages[fontStyle].shadow[letter] = img;
      });
    } else {
      const normalPromise = loadImage(`font/${fontStyle}/${letter.toLowerCase()}.png`);
      loadPromises.push(normalPromise);

      normalPromise.then(img => {
        fontImages[fontStyle].normal[letter] = img;
      });

      if (fontConfig[fontStyle] &&
          fontConfig[fontStyle].normal &&
          fontConfig[fontStyle].normal.enableShadow !== false) {
        const shadowPromise = loadImage(`font/${fontStyle}/${letter.toLowerCase()}_shadow.png`);
        loadPromises.push(shadowPromise);

        shadowPromise.then(img => {
          fontImages[fontStyle].shadow[letter] = img;
        });
      }
    }
  }

  return Promise.all(loadPromises);
}

async function initializeFonts() {
  loadingIndicator.style.display = 'flex';
  canvas.style.display = 'none';

  try {
    availableFonts = await fetchAvailableFonts();
    await populateFontDropdown();

    for (const font of availableFonts) {
      if (font !== 'default' && font !== 'big_ranks' && font !== 'border_ranks') {
        fontConfig[font] = {
          normal: {
            height: 9,
            letterWidth: 5,
            spacing: 1,
            enableShadow: true,
            borderSize: 1
          },
          shadow: {
            height: 9,
            letterWidth: 6,
            spacing: 0
          }
        };
      }
    }

    await loadFontImages('default');

    const selectedFont = document.getElementById('fontStyle').value;
    const shadowToggle = document.getElementById('enableShadow');
    const shadowOption = document.querySelector('.option-toggle');

    if (fontConfig[selectedFont] && fontConfig[selectedFont].normal) {
      const supportsShadow = fontConfig[selectedFont].normal.enableShadow !== false;

      if (!supportsShadow) {
        shadowOption.style.display = 'none';
        shadowToggle.checked = false;
      }
    }

    // Initialize border end color visibility
    const gradientBorderEnabled = document.getElementById('enableGradientBorder').checked;
    const borderEndColorPicker = document.querySelector('.color-picker:nth-child(2)');
    borderEndColorPicker.style.display = gradientBorderEnabled ? 'block' : 'none';

    imagesLoaded = true;

    generateRank();
  } catch (error) {
    console.error("Error initializing fonts:", error);
  } finally {
    loadingIndicator.style.display = 'none';
    canvas.style.display = 'block';
  }
}

async function generateRank() {
  cancelAnimationFrame(animationFrame);

  const text = document.getElementById('rankText').value.toUpperCase();
  const fontStyle = document.getElementById('fontStyle').value;
  const borderColor = document.getElementById('borderColor').value;
  const borderEndColor = document.getElementById('borderEndColor').value;
  const bgColorStart = document.getElementById('bgColorStart').value;
  const bgColorEnd = document.getElementById('bgColorEnd').value;
  const enableShadow = document.getElementById('enableShadow').checked;
  const enableGradientBorder = document.getElementById('enableGradientBorder').checked;
  const enableBorder = document.getElementById('enableBorder').checked;

  let usesShadow = enableShadow;
  if (fontConfig[fontStyle] &&
      fontConfig[fontStyle].normal &&
      fontConfig[fontStyle].normal.enableShadow === false) {
    usesShadow = false;
  }

  if (!fontImages[fontStyle]) {
    loadingIndicator.style.display = 'flex';
    canvas.style.display = 'none';

    try {
      await loadFontImages(fontStyle);
    } catch (error) {
      console.error(`Error loading font "${fontStyle}":`, error);
      loadingIndicator.style.display = 'none';
      canvas.style.display = 'block';
      return;
    }

    loadingIndicator.style.display = 'none';
    canvas.style.display = 'block';
  }

  const fontType = usesShadow ? 'shadow' : 'normal';
  const config = fontConfig[fontStyle][fontType] || fontConfig[fontStyle].normal;

  FONT_HEIGHT = config.height;
  LETTER_WIDTH_NORMAL = fontConfig[fontStyle].normal.letterWidth;
  LETTER_WIDTH_SHADOW = (fontConfig[fontStyle].shadow || {}).letterWidth || LETTER_WIDTH_NORMAL + 1;
  SPACING_NORMAL = fontConfig[fontStyle].normal.spacing;
  SPACING_SHADOW = (fontConfig[fontStyle].shadow || {}).spacing || 0;

  const letterWidth = usesShadow ? LETTER_WIDTH_SHADOW : LETTER_WIDTH_NORMAL;
  const spacing = usesShadow ? SPACING_SHADOW : SPACING_NORMAL;

  const textLength = text.length;
  const innerTextWidth = textLength * letterWidth + (textLength - 1) * spacing;
  const innerWidth = innerTextWidth + INNER_PADDING * 2;
  const borderSize = enableBorder ? BORDER : 0;
  const totalWidth = innerWidth + borderSize * 2;

  rankWidth = totalWidth;
  rankHeight = FONT_HEIGHT;

  canvas.width = totalWidth;
  canvas.height = FONT_HEIGHT;

  drawRank(text, borderColor, borderEndColor, bgColorStart, bgColorEnd, usesShadow, fontStyle, enableGradientBorder, enableBorder);
}

function drawRank(text, borderColor, borderEndColor, bgColorStart, bgColorEnd, enableShadow, fontStyle, enableGradientBorder, enableBorder) {
  const letterWidth = enableShadow ? LETTER_WIDTH_SHADOW : LETTER_WIDTH_NORMAL;
  const spacing = enableShadow ? SPACING_SHADOW : SPACING_NORMAL;
  const fontType = enableShadow ? 'shadow' : 'normal';
  const borderSize = enableBorder ? BORDER : 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background (image or gradient)
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    bgGradient.addColorStop(0, bgColorStart);
    bgGradient.addColorStop(1, bgColorEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  let yPosition = 2;
  if (fontStyle === 'big_ranks') {
    yPosition = 4;
  } else if (fontStyle === 'border_ranks') {
    yPosition = 2;
  }

  let x = borderSize + INNER_PADDING;
  for (const char of text) {
    const upperChar = char.toUpperCase();
    const img = fontImages[fontStyle][fontType][upperChar];
    if (!img) continue;
    ctx.drawImage(img, x, yPosition);
    x += letterWidth + spacing;
  }

  // Draw border (if enabled)
  if (enableBorder) {
    if (enableGradientBorder) {
      // Draw gradient border
      const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      borderGradient.addColorStop(0, borderColor);
      borderGradient.addColorStop(1, borderEndColor);
      ctx.strokeStyle = borderGradient;
    } else {
      ctx.strokeStyle = borderColor;
    }

    ctx.lineWidth = borderSize;

    // Adjust for border width to ensure it's fully visible
    const halfBorder = borderSize / 2;
    ctx.strokeRect(
      halfBorder,
      halfBorder,
      canvas.width - borderSize,
      canvas.height - borderSize
    );
  }
}

function updateZoomDisplay() {
  document.getElementById('zoomLevel').textContent = `${currentZoom}x`;
  canvas.style.transform = `scale(${currentZoom})`;
}

function downloadImage() {
  const text = document.getElementById('rankText').value.toUpperCase();
  const fontStyle = document.getElementById('fontStyle').value;
  const borderColor = document.getElementById('borderColor').value;
  const borderEndColor = document.getElementById('borderEndColor').value;
  const bgColorStart = document.getElementById('bgColorStart').value;
  const bgColorEnd = document.getElementById('bgColorEnd').value;
  const enableGradientBorder = document.getElementById('enableGradientBorder').checked;
  const enableBorder = document.getElementById('enableBorder').checked;

  let enableShadow = document.getElementById('enableShadow').checked;
  if (fontConfig[fontStyle] &&
      fontConfig[fontStyle].normal &&
      fontConfig[fontStyle].normal.enableShadow === false) {
    enableShadow = false;
  }

  drawRank(text, borderColor, borderEndColor, bgColorStart, bgColorEnd, enableShadow, fontStyle, enableGradientBorder, enableBorder);

  const link = document.createElement('a');
  link.download = `nautical_${text.toLowerCase()}_rank.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function loadExample(text, borderColor, borderEndColor, bgColorStart, bgColorEnd, shadow, fontStyle, gradientBorder) {
  document.getElementById('rankText').value = text;
  document.getElementById('fontStyle').value = fontStyle;
  document.getElementById('borderColor').value = borderColor;
  document.getElementById('borderEndColor').value = borderEndColor;
  document.getElementById('bgColorStart').value = bgColorStart;
  document.getElementById('bgColorEnd').value = bgColorEnd;
  document.getElementById('enableGradientBorder').checked = gradientBorder;

  if (fontConfig[fontStyle] &&
      fontConfig[fontStyle].normal &&
      fontConfig[fontStyle].normal.enableShadow !== false) {
    document.getElementById('enableShadow').checked = shadow;
    document.querySelector('.option-toggle').style.display = 'flex';
  } else {
    document.getElementById('enableShadow').checked = false;
    document.querySelector('.option-toggle').style.display = 'none';
  }

  // Update color value displays
  document.getElementById('borderColorValue').textContent = borderColor;
  document.getElementById('borderEndColorValue').textContent = borderEndColor;
  document.getElementById('bgStartValue').textContent = bgColorStart;
  document.getElementById('bgEndValue').textContent = bgEndValue;

  // Update border end color visibility
  const borderEndColorPicker = document.querySelector('.color-picker:nth-child(2)');
  borderEndColorPicker.style.display = gradientBorder ? 'block' : 'none';

  generateRank();
}

function adjustZoom(change) {
  const newZoom = Math.max(2, Math.min(10, currentZoom + change));
  if (newZoom !== currentZoom) {
    currentZoom = newZoom;
    updateZoomDisplay();
  }
}

window.onload = function() {
  initializeFonts();
};
