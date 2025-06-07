let menuItems = [];
let selectedSlot = null;
let currentFormat = 'deluxemenus';
let currentSkriptAddon = 'builtin';

function selectFormat(format) {
    currentFormat = format;

    // Update format buttons
    document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show/hide Skript addon selector
    const addonSelector = document.getElementById('skriptAddonSelector');
    if (format === 'skript') {
        addonSelector.classList.add('active');
    } else {
        addonSelector.classList.remove('active');
    }

    // Update form visibility
    updateFormVisibility();

    // Update format indicator
    updateFormatIndicator();

    // Regenerate code
    generateCode();
}

function selectSkriptAddon(addon) {
    currentSkriptAddon = addon;

    // Update addon buttons
    document.querySelectorAll('.addon-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update format indicator
    updateFormatIndicator();

    // Regenerate code
    generateCode();
}

function updateFormVisibility() {
    const isDeluxeMenus = currentFormat === 'deluxemenus';

    // Some fields are DeluxeMenus specific
    document.getElementById('updateIntervalGroup').style.display = isDeluxeMenus ? 'block' : 'none';
}

function updateFormatIndicator() {
    const indicator = document.getElementById('formatIndicator');
    if (currentFormat === 'deluxemenus') {
        indicator.textContent = 'DeluxeMenus';
        indicator.style.background = 'var(--accent)';
    } else {
        const addonNames = {
            'builtin': 'Skript Built-in',
            'skriptgui': 'Skript-GUI',
            'skbee': 'skBee',
            'tuske': 'TuSKe'
        };
        indicator.textContent = addonNames[currentSkriptAddon];
        indicator.style.background = 'var(--secondary-accent)';
    }
}

function initializePreview() {
    const preview = document.getElementById('menuPreview');
    const size = parseInt(document.getElementById('menuSize').value);
    preview.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const slot = document.createElement('div');
        slot.className = 'preview-slot';
        slot.textContent = i;
        slot.onclick = () => selectSlot(i);
        preview.appendChild(slot);
    }
}

function selectSlot(slotNumber) {
    document.querySelectorAll('.preview-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    const slots = document.querySelectorAll('.preview-slot');
    slots[slotNumber].classList.add('selected');

    selectedSlot = slotNumber;

    const existingItem = menuItems.find(item => item.slot === slotNumber);
    if (existingItem) {
        populateItemForm(existingItem);
    } else {
        addMenuItem(slotNumber);
    }
}

function addMenuItem(slotNumber = null) {
    const slot = slotNumber !== null ? slotNumber : (selectedSlot !== null ? selectedSlot : 0);

    const existingIndex = menuItems.findIndex(item => item.slot === slot);
    if (existingIndex !== -1) {
        populateItemForm(menuItems[existingIndex]);
        return;
    }

    const itemId = Date.now();
    const item = {
        id: itemId,
        slot: slot,
        material: 'STONE',
        displayName: '&7Example Item',
        lore: ['&8Click me!'],
        amount: 1,
        leftClickCommands: [],
        rightClickCommands: [],
        requirements: []
    };

    menuItems.push(item);
    renderItems();
    updatePreview();
}

function removeMenuItem(itemId) {
    menuItems = menuItems.filter(item => item.id !== itemId);
    renderItems();
    updatePreview();
}

function renderItems() {
    const container = document.getElementById('itemsContainer');

    if (menuItems.length === 0) {
        container.innerHTML = '<div class="empty-state">Click on the preview grid above to add items, or use the button below</div>';
        return;
    }

    container.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <button class="remove-item" onclick="removeMenuItem(${item.id})">×</button>
            <h4>Slot ${item.slot} - ${item.displayName}</h4>

            <div class="form-row">
                <div class="form-group">
                    <label>Material:</label>
                    <input type="text" value="${item.material}" onchange="updateItem(${item.id}, 'material', this.value)" placeholder="STONE">
                </div>
                <div class="form-group">
                    <label>Amount:</label>
                    <input type="number" value="${item.amount}" onchange="updateItem(${item.id}, 'amount', this.value)" min="1" max="64">
                </div>
            </div>

            <div class="form-group">
                <label>Display Name:</label>
                <input type="text" value="${item.displayName}" onchange="updateItem(${item.id}, 'displayName', this.value)" placeholder="&7Item Name">
            </div>

            <div class="form-group">
                <label>Lore (one line per entry):</label>
                <textarea rows="3" onchange="updateItem(${item.id}, 'lore', this.value.split('\\n').filter(line => line.trim()))" placeholder="&8First line of lore\n&8Second line of lore">${item.lore.join('\\n')}</textarea>
            </div>

            <div class="form-group">
                <label>Left Click Commands (one per line):</label>
                <textarea rows="2" onchange="updateItem(${item.id}, 'leftClickCommands', this.value.split('\\n').filter(line => line.trim()))" placeholder="give %player% diamond 1\ntell %player% You got a diamond!">${item.leftClickCommands.join('\\n')}</textarea>
            </div>

            <div class="form-group">
                <label>Right Click Commands (one per line):</label>
                <textarea rows="2" onchange="updateItem(${item.id}, 'rightClickCommands', this.value.split('\\n').filter(line => line.trim()))" placeholder="tell %player% Right clicked!">${item.rightClickCommands.join('\\n')}</textarea>
            </div>
        </div>
    `).join('');
}

function updateItem(itemId, property, value) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        item[property] = value;
        updatePreview();
    }
}

function updatePreview() {
    const slots = document.querySelectorAll('.preview-slot');
    const size = parseInt(document.getElementById('menuSize').value);

    for (let i = 0; i < size; i++) {
        slots[i].className = 'preview-slot';
        slots[i].textContent = i;
    }

    menuItems.forEach(item => {
        if (item.slot < size) {
            slots[item.slot].classList.add('occupied');
            slots[item.slot].textContent = item.material.substring(0, 3);
            slots[item.slot].title = `${item.displayName} (${item.material})`;
        }
    });
}

function generateDeluxeMenusCode() {
    const menuName = document.getElementById('menuName').value || 'example_menu';
    const menuTitle = document.getElementById('menuTitle').value || '&6Example Menu';
    const menuSize = document.getElementById('menuSize').value;
    const openCommand = document.getElementById('openCommand').value;
    const permission = document.getElementById('permission').value;
    const updateInterval = document.getElementById('updateInterval').value;

    let config = `${menuName}:\n`;
    config += `  menu_title: '${menuTitle}'\n`;
    config += `  size: ${menuSize}\n`;

    if (openCommand) {
        config += `  open_command: '${openCommand}'\n`;
    }

    if (permission) {
        config += `  open_requirement:\n`;
        config += `    requirements:\n`;
        config += `      permission:\n`;
        config += `        type: has permission\n`;
        config += `        permission: '${permission}'\n`;
        config += `        deny_commands:\n`;
        config += `        - '[message] &cYou don\\'t have permission to use this menu!'\n`;
    }

    if (updateInterval && updateInterval !== '20') {
        config += `  update_interval: ${updateInterval}\n`;
    }

    config += `  items:\n`;

    if (menuItems.length === 0) {
        config += `    # No items configured - add some items above!\n`;
    } else {
        menuItems.forEach(item => {
            config += `    '${item.slot}':\n`;
            config += `      material: ${item.material}\n`;
            config += `      amount: ${item.amount}\n`;
            config += `      display_name: '${item.displayName}'\n`;

            if (item.lore && item.lore.length > 0) {
                config += `      lore:\n`;
                item.lore.forEach(line => {
                    if (line.trim()) config += `      - '${line}'\n`;
                });
            }

            if (item.leftClickCommands && item.leftClickCommands.length > 0) {
                config += `      left_click_commands:\n`;
                item.leftClickCommands.forEach(cmd => {
                    if (cmd.trim()) config += `      - '${cmd}'\n`;
                });
            }

            if (item.rightClickCommands && item.rightClickCommands.length > 0) {
                config += `      right_click_commands:\n`;
                item.rightClickCommands.forEach(cmd => {
                    if (cmd.trim()) config += `      - '${cmd}'\n`;
                });
            }

            config += `\n`;
        });
    }

    return config;
}

function generateSkriptBuiltinCode() {
    const menuName = document.getElementById('menuName').value || 'example_menu';
    const menuTitle = document.getElementById('menuTitle').value || '&6Example Menu';
    const menuSize = parseInt(document.getElementById('menuSize').value);
    const openCommand = document.getElementById('openCommand').value;
    const permission = document.getElementById('permission').value;

    let code = `# Skript Built-in GUI for ${menuName}\n\n`;

    if (openCommand) {
        code += `command /${openCommand}:\n`;
        if (permission) {
            code += `    permission: ${permission}\n`;
            code += `    permission message: &cYou don't have permission to use this command!\n`;
        }
        code += `    trigger:\n`;
        code += `        open_${menuName}_gui(player)\n\n`;
    }

    code += `function open_${menuName}_gui(p: player):\n`;
    code += `    open chest with ${Math.ceil(menuSize / 9)} rows named "${menuTitle}" to {_p}\n`;
    code += `    wait 1 tick\n`;

    if (menuItems.length === 0) {
        code += `    # No items configured - add some items above!\n`;
    } else {
        menuItems.forEach(item => {
            const itemName = item.displayName.replace(/&/g, '§');
            code += `    set slot ${item.slot} of {_p}'s current inventory to ${item.amount} ${item.material.toLowerCase()}`;

            if (item.displayName !== '&7Example Item' || item.lore.length > 0) {
                code += ` named "${item.displayName}"`;
                if (item.lore.length > 0) {
                    const loreString = item.lore.map(line => `"${line}"`).join(', ');
                    code += ` with lore ${loreString}`;
                }
            }
            code += `\n`;
        });
    }

    code += `\non inventory click:\n`;
    code += `    if inventory name of player's current inventory is "${menuTitle}":\n`;
    code += `        cancel event\n`;

    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            if (item.leftClickCommands.length > 0 || item.rightClickCommands.length > 0) {
                code += `        if clicked slot is ${item.slot}:\n`;

                if (item.leftClickCommands.length > 0) {
                    code += `            if click type is left mouse button:\n`;
                    item.leftClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to player\n`;
                            } else {
                                code += `                make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }

                if (item.rightClickCommands.length > 0) {
                    code += `            if click type is right mouse button:\n`;
                    item.rightClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to player\n`;
                            } else {
                                code += `                make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }
            }
        });
    }

    return code;
}

function generateSkriptGuiCode() {
    const menuName = document.getElementById('menuName').value || 'example_menu';
    const menuTitle = document.getElementById('menuTitle').value || '&6Example Menu';
    const menuSize = parseInt(document.getElementById('menuSize').value);
    const openCommand = document.getElementById('openCommand').value;
    const permission = document.getElementById('permission').value;

    let code = `# Skript-GUI for ${menuName}\n\n`;

    if (openCommand) {
        code += `command /${openCommand}:\n`;
        if (permission) {
            code += `    permission: ${permission}\n`;
            code += `    permission message: &cYou don't have permission to use this command!\n`;
        }
        code += `    trigger:\n`;
        code += `        open_${menuName}_gui(player)\n\n`;
    }

    code += `function open_${menuName}_gui(p: player):\n`;
    code += `    create a gui with virtual chest inventory with ${Math.ceil(menuSize / 9)} rows named "${menuTitle}":\n`;

    if (menuItems.length === 0) {
        code += `        # No items configured - add some items above!\n`;
    } else {
        menuItems.forEach(item => {
            code += `        make gui slot ${item.slot} with ${item.amount} ${item.material.toLowerCase()}`;

            if (item.displayName !== '&7Example Item' || item.lore.length > 0) {
                code += ` named "${item.displayName}"`;
                if (item.lore.length > 0) {
                    const loreString = item.lore.map(line => `"${line}"`).join(', ');
                    code += ` with lore ${loreString}`;
                }
            }

            if (item.leftClickCommands.length > 0 || item.rightClickCommands.length > 0) {
                code += `:\n`;

                if (item.leftClickCommands.length > 0) {
                    code += `            if gui-click-type is left mouse button:\n`;
                    item.leftClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to gui-player\n`;
                            } else {
                                code += `                make gui-player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }

                if (item.rightClickCommands.length > 0) {
                    code += `            if gui-click-type is right mouse button:\n`;
                    item.rightClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to gui-player\n`;
                            } else {
                                code += `                make gui-player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }
            } else {
                code += `\n`;
            }
        });
    }

    code += `    open last gui to {_p}\n`;

    return code;
}

function generateSkBeeCode() {
    const menuName = document.getElementById('menuName').value || 'example_menu';
    const menuTitle = document.getElementById('menuTitle').value || '&6Example Menu';
    const menuSize = parseInt(document.getElementById('menuSize').value);
    const openCommand = document.getElementById('openCommand').value;
    const permission = document.getElementById('permission').value;

    let code = `# skBee GUI for ${menuName}\n\n`;

    if (openCommand) {
        code += `command /${openCommand}:\n`;
        if (permission) {
            code += `    permission: ${permission}\n`;
            code += `    permission message: &cYou don't have permission to use this command!\n`;
        }
        code += `    trigger:\n`;
        code += `        open_${menuName}_gui(player)\n\n`;
    }

    code += `function open_${menuName}_gui(p: player):\n`;
    code += `    create gui with id "${menuName}" for {_p} with title "${menuTitle}" with ${Math.ceil(menuSize / 9)} rows\n`;

    if (menuItems.length === 0) {
        code += `    # No items configured - add some items above!\n`;
    } else {
        menuItems.forEach(item => {
            code += `    set slot ${item.slot} of gui "${menuName}" for {_p} to ${item.amount} ${item.material.toLowerCase()}`;

            if (item.displayName !== '&7Example Item' || item.lore.length > 0) {
                code += ` named "${item.displayName}"`;
                if (item.lore.length > 0) {
                    const loreString = item.lore.map(line => `"${line}"`).join(', ');
                    code += ` with lore ${loreString}`;
                }
            }
            code += `\n`;
        });
    }

    code += `    open gui "${menuName}" to {_p}\n\n`;

    code += `on gui click:\n`;
    code += `    if gui-id of event-gui is "${menuName}":\n`;
    code += `        cancel event\n`;

    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            if (item.leftClickCommands.length > 0 || item.rightClickCommands.length > 0) {
                code += `        if clicked slot is ${item.slot}:\n`;

                if (item.leftClickCommands.length > 0) {
                    code += `            if click type is left mouse button:\n`;
                    item.leftClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to player\n`;
                            } else {
                                code += `                make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }

                if (item.rightClickCommands.length > 0) {
                    code += `            if click type is right mouse button:\n`;
                    item.rightClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `                execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `                send "${cleanCmd}" to player\n`;
                            } else {
                                code += `                make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }
            }
        });
    }

    return code;
}

function generateTuSKeCode() {
    const menuName = document.getElementById('menuName').value || 'example_menu';
    const menuTitle = document.getElementById('menuTitle').value || '&6Example Menu';
    const menuSize = parseInt(document.getElementById('menuSize').value);
    const openCommand = document.getElementById('openCommand').value;
    const permission = document.getElementById('permission').value;

    let code = `# TuSKe GUI for ${menuName}\n\n`;

    if (openCommand) {
        code += `command /${openCommand}:\n`;
        if (permission) {
            code += `    permission: ${permission}\n`;
            code += `    permission message: &cYou don't have permission to use this command!\n`;
        }
        code += `    trigger:\n`;
        code += `        open_${menuName}_gui(player)\n\n`;
    }

    code += `function open_${menuName}_gui(p: player):\n`;
    code += `    open virtual chest inventory with size ${menuSize} named "${menuTitle}" to {_p}\n`;
    code += `    wait 1 tick\n`;

    if (menuItems.length === 0) {
        code += `    # No items configured - add some items above!\n`;
    } else {
        menuItems.forEach(item => {
            code += `    format gui slot ${item.slot} of {_p} with ${item.amount} ${item.material.toLowerCase()}`;

            if (item.displayName !== '&7Example Item' || item.lore.length > 0) {
                code += ` named "${item.displayName}"`;
                if (item.lore.length > 0) {
                    const loreString = item.lore.map(line => `"${line}"`).join(', ');
                    code += ` with lore ${loreString}`;
                }
            }

            if (item.leftClickCommands.length > 0 || item.rightClickCommands.length > 0) {
                code += ` to run:\n`;

                if (item.leftClickCommands.length > 0) {
                    code += `        if gui click type is left mouse button:\n`;
                    item.leftClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `            execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `            send "${cleanCmd}" to player\n`;
                            } else {
                                code += `            make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }

                if (item.rightClickCommands.length > 0) {
                    code += `        if gui click type is right mouse button:\n`;
                    item.rightClickCommands.forEach(cmd => {
                        if (cmd.trim()) {
                            if (cmd.includes('console')) {
                                const cleanCmd = cmd.replace(/\[console\]\s*/, '');
                                code += `            execute console command "${cleanCmd}"\n`;
                            } else if (cmd.includes('message')) {
                                const cleanCmd = cmd.replace(/\[message\]\s*/, '');
                                code += `            send "${cleanCmd}" to player\n`;
                            } else {
                                code += `            make player execute command "/${cmd}"\n`;
                            }
                        }
                    });
                }
            } else {
                code += `\n`;
            }
        });
    }

    return code;
}

function generateCode() {
    let code = '';

    switch (currentFormat) {
        case 'deluxemenus':
            code = generateDeluxeMenusCode();
            break;
        case 'skript':
            switch (currentSkriptAddon) {
                case 'builtin':
                    code = generateSkriptBuiltinCode();
                    break;
                case 'skriptgui':
                    code = generateSkriptGuiCode();
                    break;
                case 'skbee':
                    code = generateSkBeeCode();
                    break;
                case 'tuske':
                    code = generateTuSKeCode();
                    break;
            }
            break;
    }

    document.getElementById('output').textContent = code;
}

function copyToClipboard() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        btn.style.background = '#10b981';

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.background = 'var(--accent)';
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard. Please select and copy manually.');
    });
}

function clearAll() {
    if (confirm('Are you sure you want to clear all items? This cannot be undone.')) {
        menuItems = [];
        selectedSlot = null;
        renderItems();
        updatePreview();
        document.getElementById('output').textContent = 'Click "Generate Code" to see your configuration...';
    }
}

function toggleAccordion(id) {
    const content = document.getElementById(id);
    const header = content.previousElementSibling;
    const arrow = header.querySelector('span');

    content.classList.toggle('active');
    arrow.textContent = content.classList.contains('active') ? '▲' : '▼';
}

function populateItemForm(item) {
    renderItems();
}

// Event listeners
document.getElementById('menuSize').addEventListener('change', () => {
    initializePreview();
    updatePreview();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializePreview();
    updateFormVisibility();
    updateFormatIndicator();
    generateCode();
});



// Function to load material icons dynamically
function loadMaterialIcons() {
    const materialIconsContainer = document.getElementById('material-icons');
    // Example materials, replace with actual Minecraft 1.21.4 materials
    const materials = ['stone', 'dirt', 'iron_ore'];
    materials.forEach(material => {
        const icon = document.createElement('img');
        icon.src = `path/to/icons/${material}.png`;
        icon.alt = material;
        icon.className = 'material-icon';
        materialIconsContainer.appendChild(icon);
    });
}

// Event listener for material input
const materialInput = document.getElementById('material-input');
materialInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const icons = document.querySelectorAll('.material-icon');
    icons.forEach(icon => {
        if (icon.alt.includes(query)) {
            icon.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    });
});

// Call the function to load icons on DOM content loaded
document.addEventListener('DOMContentLoaded', loadMaterialIcons);
