// Toàn bộ JS logic từ <script> trong packgen.html được đặt ở đây. Không thay đổi logic/tính năng.

let uploadedFiles = [];
let packIcon = null;
let unicodeIndex = 0xE000;
let unicodeMapping = [];

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const generateBtn = document.getElementById('generateBtn');

const iconUploadArea = document.getElementById('iconUploadArea');
const iconInput = document.getElementById('iconInput');
const iconPreview = document.getElementById('iconPreview');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

iconUploadArea.addEventListener('click', () => iconInput.click());
iconUploadArea.addEventListener('dragover', handleIconDragOver);
iconUploadArea.addEventListener('dragleave', handleIconDragLeave);
iconUploadArea.addEventListener('drop', handleIconDrop);
iconInput.addEventListener('change', handleIconSelect);

function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
}

function handleIconDragOver(e) {
  e.preventDefault();
  iconUploadArea.classList.add('drag-over');
}

function handleIconDragLeave(e) {
  e.preventDefault();
  iconUploadArea.classList.remove('drag-over');
}

function handleIconDrop(e) {
  e.preventDefault();
  iconUploadArea.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  processIconFile(files[0]);
}

function handleIconSelect(e) {
  const file = e.target.files[0];
  if (file) {
    processIconFile(file);
  }
}

function processIconFile(file) {
  if (file && file.type === 'image/png') {
    packIcon = file;
    showIconPreview(file);
    showStatus('Pack icon uploaded successfully', 'success');
  } else {
    showStatus('Please upload a PNG file for the pack icon', 'error');
  }
}

function showIconPreview(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    iconPreview.innerHTML = `
      <div class="icon-item">
        <img src="${e.target.result}" alt="Pack Icon" style="width: 64px; height: 64px; border-radius: 4px; border: 1px solid #475569;">
        <div style="margin-top: 10px; color: var(--mainText);">
          <div>pack.png</div>
          <div style="font-size: 0.8rem; color: var(--text);">${formatFileSize(file.size)}</div>
        </div>
        <button onclick="removeIcon()" style="margin-top: 10px; background: #dc2626; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">Remove</button>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

function removeIcon() {
  packIcon = null;
  iconPreview.innerHTML = '';
  showStatus('Pack icon removed', 'success');
}

function processFiles(files) {
  const pngFiles = files.filter(file => file.type === 'image/png');

  if (pngFiles.length !== files.length) {
    showStatus('Only PNG files are supported. Some files were ignored.', 'error');
  }

  pngFiles.forEach(file => {
    if (!uploadedFiles.find(f => f.name === file.name)) {
      uploadedFiles.push(file);
    }
  });

  updateFileList();
  updateGenerateButton();

  if (pngFiles.length > 0) {
    showStatus(`Added ${pngFiles.length} PNG file(s)`, 'success');
  }
}

function updateFileList() {
  fileList.innerHTML = '';

  uploadedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    fileItem.innerHTML = `
      <div class="file-info">
        <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
    `;

    fileList.appendChild(fileItem);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  updateFileList();
  updateGenerateButton();
  showStatus('File removed', 'success');
}

function clearFiles() {
  uploadedFiles = [];
  unicodeIndex = 0xE000;
  unicodeMapping = [];
  updateFileList();
  updateGenerateButton();
  showStatus('All files cleared', 'success');
}

function updateGenerateButton() {
  generateBtn.disabled = uploadedFiles.length === 0;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';

  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 5000);
}

function updateProgress(percent) {
  progressFill.style.width = percent + '%';
  if (percent > 0) {
    progressBar.style.display = 'block';
  } else {
    progressBar.style.display = 'none';
  }
}

function generateUnicode() {
  return String.fromCharCode(unicodeIndex++);
}

async function generatePack() {
  if (uploadedFiles.length === 0) {
    showStatus('Please upload at least one PNG file', 'error');
    return;
  }

  generateBtn.disabled = true;
  updateProgress(10);
  showStatus('Generating resource pack...', 'success');
  unicodeMapping = []; // Reset mapping

  try {
    const zip = new JSZip();

    const packMeta = {
      pack: {
        pack_format: 9,
        description: [
          "",
          {
            text: document.getElementById('packName').value,
            bold: true,
            color: "#E54040"
          },
          {
            text: document.getElementById('packDescription').value,
            color: "#E54040"
          },
          {
            text: "\n"
          },
          {
            text: "Created by",
            color: "#f7d200"
          },
          {
            text: " " + document.getElementById('packAuthor').value,
            color: "#4068E5"
          }
        ]
      }
    };

    zip.file('pack.mcmeta', JSON.stringify(packMeta, null, 4));
    updateProgress(30);

    // Use custom pack icon or create default
    if (packIcon) {
      const iconData = await packIcon.arrayBuffer();
      zip.file('pack.png', iconData);
    } else {
      const defaultIcon = await createPackIcon();
      zip.file('pack.png', defaultIcon);
    }
    updateProgress(40);

    // Create font configuration
    const fontProviders = [];
    const ascent = parseInt(document.getElementById('ascent').value);
    const height = parseInt(document.getElementById('height').value);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const fileName = file.name.toLowerCase().replace('.png', '');
      const unicode = generateUnicode();
      const unicodeHex = unicode.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');

      // Store mapping for txt file
      unicodeMapping.push({
        filename: fileName,
        unicode: unicode,
        unicodeHex: unicodeHex
      });

      fontProviders.push({
        type: "bitmap",
        file: `minecraft:ranks/${fileName}.png`,
        ascent: ascent,
        height: height,
        chars: [unicode]
      });

      // Add image to zip
      const imageData = await file.arrayBuffer();
      zip.file(`assets/minecraft/textures/ranks/${fileName}.png`, imageData);

      updateProgress(40 + (i / uploadedFiles.length) * 35);
    }

    const fontConfig = {
      providers: fontProviders
    };

    zip.file('assets/minecraft/font/default.json', JSON.stringify(fontConfig, null, 4));
    updateProgress(80);

    // Create unicode mapping txt file
    let mappingContent = "RANK UNICODE MAPPING\n";
    mappingContent += "==================\n";
    mappingContent += `Pack: ${document.getElementById('packName').value}\n`;
    mappingContent += `Author: ${document.getElementById('packAuthor').value}\n`;
    mappingContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    mappingContent += "Filename\t\tUnicode Character\tUnicode Hex\n";
    mappingContent += "--------\t\t-----------------\t-----------\n";

    unicodeMapping.forEach(mapping => {
      mappingContent += `${mapping.filename}\t\t\t${mapping.unicode}\t\t\tU+${mapping.unicodeHex}\n`;
    });

    mappingContent += "\n\nHow to use:\n";
    mappingContent += "Copy the Unicode Character and paste it in your text/signs/books in Minecraft.\n";
    mappingContent += "The corresponding rank image will appear in place of the character.\n";

    zip.file('unicode_mapping.txt', mappingContent);
    updateProgress(90);

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'Nautical_Resource_pack.zip';
    link.click();

    updateProgress(100);
    showStatus(`Successfully generated resource pack with ${uploadedFiles.length} images and unicode mapping!`, 'success');

    setTimeout(() => {
      updateProgress(0);
    }, 2000);

  } catch (error) {
    console.error('Error generating pack:', error);
    showStatus('Error generating resource pack: ' + error.message, 'error');
    updateProgress(0);
  } finally {
    generateBtn.disabled = false;
  }
}

async function createPackIcon() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, '#38bdf8');
    gradient.addColorStop(1, '#0f172a');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Add border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    canvas.toBlob(resolve, 'image/png');
  });
}

// Initialize
updateGenerateButton();
