let colors = [];
let colorCounter = 0;
let globalFormatting = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false
};

// Initialize with two colors for gradient
function init() {
    addColor('#ff0000');
    addColor('#0000ff');
}

function addColor(hexValue = null) {
    const color = {
        id: colorCounter++,
        hex: hexValue || randomColor()
    };

    colors.push(color);
    renderColors();
    updatePreview();
}

function removeColor(id) {
    if (colors.length > 1) {
        colors = colors.filter(color => color.id !== id);
        renderColors();
        updatePreview();
    }
}

function updateColorHex(id, value) {
    // Ensure hex format
    if (!value.startsWith('#')) {
        value = '#' + value;
    }

    // Validate hex
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        const color = colors.find(c => c.id === id);
        if (color) {
            color.hex = value.toUpperCase();
            renderColors();
            updatePreview();
            updateExport();
        }
    }
}

function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
}

function renderColors() {
    const container = document.getElementById('colorsList');
    container.innerHTML = '';

    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-item';
        colorDiv.innerHTML = `
            <input type="color" class="color-input" value="${color.hex}"
                   onchange="updateColorHex(${color.id}, this.value)">
            <input type="text" class="hex-input" value="${color.hex}"
                   onchange="updateColorHex(${color.id}, this.value)"
                   oninput="updateColorHex(${color.id}, this.value)"
                   maxlength="7">
            <button class="random-color-btn" onclick="randomizeColor(${color.id})">Random</button>
            ${colors.length > 1 ? `<button class="trash-btn" onclick="removeColor(${color.id})" title="Remove Color">🗑️</button>` : ''}
        `;
        container.appendChild(colorDiv);
    });
}

function randomizeColor(id) {
    const newColor = randomColor();
    const color = colors.find(c => c.id === id);
    if (color) {
        color.hex = newColor;
        renderColors();
        updatePreview();
        updateExport();
    }
}

function toggleGlobalFormat(format) {
    globalFormatting[format] = !globalFormatting[format];
    const btn = document.getElementById(format + 'Btn');
    btn.classList.toggle('active', globalFormatting[format]);
    updatePreview();
    updateExport();
}

function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function getColorForPosition(position, totalLength) {
    if (colors.length === 0) return '#FFFFFF';
    if (colors.length === 1) return colors[0].hex;

    const segmentLength = totalLength / (colors.length - 1);
    const segmentIndex = Math.floor(position / segmentLength);
    const segmentProgress = (position % segmentLength) / segmentLength;

    if (segmentIndex >= colors.length - 1) {
        return colors[colors.length - 1].hex;
    }

    return interpolateColor(colors[segmentIndex].hex, colors[segmentIndex + 1].hex, segmentProgress);
}

function updatePreview() {
    const input = document.getElementById('previewInput');
    const output = document.getElementById('previewOutput');
    const text = input.value;

    if (!text) {
        output.innerHTML = 'Xem trước...';
        updateExport();
        return;
    }

    // Create styled text
    let styledText = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const color = getColorForPosition(i, text.length);

        let styles = [`color: ${color}`];

        if (globalFormatting.bold) styles.push('font-weight: bold');
        if (globalFormatting.italic) styles.push('font-style: italic');
        if (globalFormatting.underline) styles.push('text-decoration: underline');
        if (globalFormatting.strikethrough) styles.push('text-decoration: line-through');
        if (globalFormatting.underline && globalFormatting.strikethrough) {
            styles = styles.filter(s => !s.includes('text-decoration'));
            styles.push('text-decoration: underline line-through');
        }

        let displayChar = char;
        if (globalFormatting.obfuscate && char !== ' ' && char !== '\n') {
            displayChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }

        if (char === '\n') {
            styledText += '<br>';
        } else {
            styledText += `<span style="${styles.join('; ')}">${displayChar === ' ' ? '&nbsp;' : displayChar}</span>`;
        }
    }

    output.innerHTML = styledText;
    updateExport();
}

function updateExport() {
    const text = document.getElementById('previewInput').value;
    const format = document.getElementById('exportDropdown').value;
    const output = document.getElementById('exportOutput');

    if (!text) {
        output.textContent = 'Stella Studio...';
        return;
    }

    const exportCode = generateExport(text, format);
    output.textContent = exportCode;
}

function generateExport(text, format) {
    if (!text || colors.length === 0) return '';

    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const color = getColorForPosition(i, text.length);
        const hex = color.substring(1);
        const r = hex.substring(0, 2).toLowerCase();
        const g = hex.substring(2, 4).toLowerCase();
        const b = hex.substring(4, 6).toLowerCase();

        switch (format) {
            case 'minimessage':
                let mm = `<#${hex.toLowerCase()}>`;
                if (globalFormatting.bold) mm += '<b>';
                if (globalFormatting.italic) mm += '<i>';
                if (globalFormatting.underline) mm += '<u>';
                if (globalFormatting.strikethrough) mm += '<st>';
                if (globalFormatting.obfuscate) mm += '<obf>';
                mm += char;
                if (globalFormatting.obfuscate) mm += '</obf>';
                if (globalFormatting.strikethrough) mm += '</st>';
                if (globalFormatting.underline) mm += '</u>';
                if (globalFormatting.italic) mm += '</i>';
                if (globalFormatting.bold) mm += '</b>';
                result += mm;
                break;
            case 'bukkit':
                let bukkit = `&#${hex.toLowerCase()}`;
                if (globalFormatting.bold) bukkit += '&l';
                if (globalFormatting.italic) bukkit += '&o';
                if (globalFormatting.underline) bukkit += '&n';
                if (globalFormatting.strikethrough) bukkit += '&m';
                if (globalFormatting.obfuscate) bukkit += '&k';
                bukkit += char;
                result += bukkit;
                break;
            case 'legacy':
                let legacy = `§x§${r.charAt(0)}§${r.charAt(1)}§${g.charAt(0)}§${g.charAt(1)}§${b.charAt(0)}§${b.charAt(1)}`;
                if (globalFormatting.bold) legacy += '§l';
                if (globalFormatting.italic) legacy += '§o';
                if (globalFormatting.underline) legacy += '§n';
                if (globalFormatting.strikethrough) legacy += '§m';
                if (globalFormatting.obfuscate) legacy += '§k';
                legacy += char;
                result += legacy;
                break;
            case 'json':
                let jsonObj = {
                    text: char,
                    color: color.toLowerCase()
                };
                if (globalFormatting.bold) jsonObj.bold = true;
                if (globalFormatting.italic) jsonObj.italic = true;
                if (globalFormatting.underline) jsonObj.underlined = true;
                if (globalFormatting.strikethrough) jsonObj.strikethrough = true;
                if (globalFormatting.obfuscate) jsonObj.obfuscated = true;
                result += JSON.stringify(jsonObj) + ',';
                break;
            case 'essentials':
                let ess = `&x&${r.charAt(0)}&${r.charAt(1)}&${g.charAt(0)}&${g.charAt(1)}&${b.charAt(0)}&${b.charAt(1)}`;
                if (globalFormatting.bold) ess += '&l';
                if (globalFormatting.italic) ess += '&o';
                if (globalFormatting.underline) ess += '&n';
                if (globalFormatting.strikethrough) ess += '&m';
                if (globalFormatting.obfuscate) ess += '&k';
                ess += char;
                result += ess;
                break;
            case 'placeholderapi':
                let papi = `<#${hex.toLowerCase()}>`;
                if (globalFormatting.bold) papi += '&l';
                if (globalFormatting.italic) papi += '&o';
                if (globalFormatting.underline) papi += '&n';
                if (globalFormatting.strikethrough) papi += '&m';
                if (globalFormatting.obfuscate) papi += '&k';
                papi += char;
                result += papi;
                break;
            case 'doublehash':
                let dh = `##${hex.toLowerCase()}`;
                if (globalFormatting.bold) dh += '&l';
                if (globalFormatting.italic) dh += '&o';
                if (globalFormatting.underline) dh += '&n';
                if (globalFormatting.strikethrough) dh += '&m';
                if (globalFormatting.obfuscate) dh += '&k';
                dh += char;
                result += dh;
                break;
            case 'bbcode':
                let bb = `[COLOR=#${hex.toLowerCase()}]`;
                bb += char + '[/COLOR]';
                result += bb;
                break;
        }
    }
    if (format === 'json') {
        result = '[' + result.replace(/,$/, '') + ']';
    }
    return result;
}

function copyToClipboard() {
    const output = document.getElementById('exportOutput');
    const btn = document.getElementById('copyBtn');
    navigator.clipboard.writeText(output.textContent).then(() => {
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Copy to Clipboard';
        }, 1200);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    renderColors();
    updatePreview();
    updateExport();
});
