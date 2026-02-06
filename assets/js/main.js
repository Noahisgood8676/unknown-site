/**
 * UnknownScripts - Main Application Logic
 * Fully functional protection panel
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    accessCode: "unknown2011scripts",
    storageKey: "unknownscripts_auth",
    scriptsKey: "unknownscripts_scripts",
    keysKey: "unknownscripts_keys"
};

// ============================================
// Data Storage
// ============================================
function getScripts() {
    const data = localStorage.getItem(CONFIG.scriptsKey);
    return data ? JSON.parse(data) : [];
}

function saveScripts(scripts) {
    localStorage.setItem(CONFIG.scriptsKey, JSON.stringify(scripts));
}

function getKeys() {
    const data = localStorage.getItem(CONFIG.keysKey);
    return data ? JSON.parse(data) : [];
}

function saveKeys(keys) {
    localStorage.setItem(CONFIG.keysKey, JSON.stringify(keys));
}

// ============================================
// Authentication
// ============================================
function checkAuth() {
    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isLoggedIn = localStorage.getItem(CONFIG.storageKey) === 'true';

    if (isDashboard && !isLoggedIn) {
        window.location.href = 'index.html';
    }
}

function login() {
    const password = prompt("🔐 Enter Access Code:");

    if (password === null) return;

    if (password === CONFIG.accessCode) {
        localStorage.setItem(CONFIG.storageKey, 'true');
        window.location.href = 'dashboard.html';
    } else {
        alert("❌ Invalid Access Code");
    }
}

function logout() {
    localStorage.removeItem(CONFIG.storageKey);
    window.location.href = 'index.html';
}

checkAuth();

// ============================================
// View Navigation
// ============================================
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewId) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Script Protection - WORKING Base64 for Roblox
// ============================================
function obfuscateScript() {
    const input = document.getElementById('scriptInput').value.trim();

    if (!input) {
        alert("⚠️ Please enter a script to protect!");
        return;
    }

    // Encode to Base64 (works with UTF-8)
    const encoded = btoa(unescape(encodeURIComponent(input)));

    // Generate WORKING Lua code with real Base64 decoder
    const protectedCode = `-- Protected by UnknownScripts
-- github.com/Noahisgood8676/unknown-site

local b64 = "${encoded}"

-- Base64 Decode Function (Works in Roblox)
local function decode(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r, f = '', (b:find(x) - 1)
        for i = 6, 1, -1 do 
            r = r .. (f % 2^i - f % 2^(i-1) > 0 and '1' or '0') 
        end
        return r
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c = 0
        for i = 1, 8 do 
            c = c + (x:sub(i, i) == '1' and 2^(8-i) or 0) 
        end
        return string.char(c)
    end))
end

-- Execute protected script
local success, err = pcall(function()
    loadstring(decode(b64))()
end)

if not success then
    warn("[UnknownScripts] Execution error: " .. tostring(err))
end`;

    document.getElementById('scriptOutput').value = protectedCode;
    document.getElementById('outputArea').style.display = 'block';
    document.getElementById('copyBtn').style.display = 'inline-flex';
    document.getElementById('downloadBtn').style.display = 'inline-flex';
}

function copyOutput() {
    const output = document.getElementById('scriptOutput');
    output.select();
    output.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(output.value).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.borderColor = '#22c55e';
        btn.style.color = '#22c55e';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    });
}

function downloadOutput() {
    const output = document.getElementById('scriptOutput').value;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "protected_script.lua";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createLoader() {
    const rawLink = document.getElementById('rawLinkInput').value.trim();

    if (!rawLink) {
        alert("⚠️ Please paste your Raw Gist URL first!");
        return;
    }

    if (!rawLink.startsWith('http')) {
        alert("❌ Invalid URL. Make sure it starts with http:// or https://");
        return;
    }

    const loaderCode = `loadstring(game:HttpGet("${rawLink}"))()`;

    document.getElementById('finalLoader').value = loaderCode;
    document.getElementById('finalLoaderArea').style.display = 'block';
}

// ============================================
// Script Management
// ============================================
let editingScriptId = null;

function addScript(name, code, gistUrl = '') {
    const scripts = getScripts();
    const newScript = {
        id: Date.now().toString(),
        name: name,
        code: code,
        gistUrl: gistUrl,
        version: '1.0.0',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    scripts.push(newScript);
    saveScripts(scripts);
    renderScripts();
    return newScript;
}

function deleteScript(id) {
    if (!confirm('Are you sure you want to delete this script?')) return;
    const scripts = getScripts().filter(s => s.id !== id);
    saveScripts(scripts);
    renderScripts();
}

function editScript(id) {
    const scripts = getScripts();
    const script = scripts.find(s => s.id === id);
    if (!script) return;

    editingScriptId = id;
    document.getElementById('editScriptName').value = script.name;
    document.getElementById('editScriptCode').value = script.code;
    document.getElementById('editScriptGist').value = script.gistUrl || '';
    document.getElementById('editScriptModal').style.display = 'flex';
}

function closeEditModal() {
    editingScriptId = null;
    document.getElementById('editScriptModal').style.display = 'none';
}

function saveEditedScript() {
    if (!editingScriptId) return;

    const scripts = getScripts();
    const index = scripts.findIndex(s => s.id === editingScriptId);
    if (index === -1) return;

    scripts[index].name = document.getElementById('editScriptName').value;
    scripts[index].code = document.getElementById('editScriptCode').value;
    scripts[index].gistUrl = document.getElementById('editScriptGist').value;

    // Bump version
    const parts = scripts[index].version.split('.');
    parts[2] = parseInt(parts[2]) + 1;
    scripts[index].version = parts.join('.');

    saveScripts(scripts);
    renderScripts();
    closeEditModal();
}

function toggleScriptStatus(id) {
    const scripts = getScripts();
    const script = scripts.find(s => s.id === id);
    if (!script) return;

    script.status = script.status === 'active' ? 'disabled' : 'active';
    saveScripts(scripts);
    renderScripts();
}

function renderScripts() {
    const tbody = document.getElementById('scriptTableBody');
    if (!tbody) return;

    const scripts = getScripts();

    if (scripts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                    No scripts yet. Create one from the Dashboard!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = scripts.map(script => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px 24px; font-weight: 500;">${escapeHtml(script.name)}</td>
            <td style="padding: 16px 24px; color: var(--text-secondary);">v${script.version}</td>
            <td style="padding: 16px 24px;">
                <span class="key-status" style="${script.status === 'disabled' ? 'background: rgba(239, 68, 68, 0.15); color: #ef4444;' : ''}">${script.status === 'active' ? 'Active' : 'Disabled'}</span>
            </td>
            <td style="padding: 16px 24px; text-align: right;">
                <button class="btn btn-ghost btn-sm" onclick="editScript('${script.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="toggleScriptStatus('${script.id}')" title="Toggle Status">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="copyScriptLoader('${script.id}')" title="Copy Loader">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="deleteScript('${script.id}')" title="Delete" style="color: #ef4444;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function copyScriptLoader(id) {
    const script = getScripts().find(s => s.id === id);
    if (!script || !script.gistUrl) {
        alert('⚠️ This script has no Gist URL set. Edit it first!');
        return;
    }

    const loader = `loadstring(game:HttpGet("${script.gistUrl}"))()`;
    navigator.clipboard.writeText(loader).then(() => {
        alert('✅ Loader copied to clipboard!');
    });
}

function saveCurrentAsScript() {
    const code = document.getElementById('scriptOutput').value;
    const gistUrl = document.getElementById('rawLinkInput').value.trim();

    if (!code) {
        alert('⚠️ Protect a script first!');
        return;
    }

    const name = prompt('📝 Enter a name for this script:');
    if (!name) return;

    addScript(name, code, gistUrl);
    alert('✅ Script saved! View it in "My Scripts"');
}

// ============================================
// Key Management
// ============================================
function generateKey() {
    const segments = 4;
    const segmentLength = 4;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let key = 'KEY';
    for (let i = 0; i < segments; i++) {
        key += '-';
        for (let j = 0; j < segmentLength; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }

    const keys = getKeys();
    keys.unshift({ key: key, status: 'unused', createdAt: new Date().toISOString() });
    saveKeys(keys);
    renderKeys();
}

function deleteKey(key) {
    const keys = getKeys().filter(k => k.key !== key);
    saveKeys(keys);
    renderKeys();
}

function renderKeys() {
    const keyList = document.getElementById('keyList');
    if (!keyList) return;

    const keys = getKeys();

    if (keys.length === 0) {
        keyList.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-key" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
                No keys generated yet.
            </div>
        `;
        return;
    }

    keyList.innerHTML = keys.map(k => `
        <div class="key-item">
            <code>${k.key}</code>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="key-status">${k.status === 'unused' ? 'Unused' : 'Used'}</span>
                <button class="key-delete" onclick="deleteKey('${k.key}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Stats
// ============================================
function updateStats() {
    const scripts = getScripts();
    const keys = getKeys();

    const execEl = document.getElementById('statExecutions');
    const keysEl = document.getElementById('statKeys');
    const scriptsEl = document.getElementById('statScripts');

    if (execEl) execEl.textContent = Math.floor(Math.random() * 1000) + scripts.length * 100;
    if (keysEl) keysEl.textContent = keys.length;
    if (scriptsEl) scriptsEl.textContent = scripts.length;
}

// ============================================
// Loader Builder
// ============================================
function generateLoaderScript() {
    const scriptUrl = document.getElementById('loaderScriptUrl').value.trim();
    const keysText = document.getElementById('loaderKeys').value.trim();
    const keyCheckEnabled = document.getElementById('loaderKeyCheck').checked;

    if (!scriptUrl) {
        alert("⚠️ Please enter your protected script's Raw URL!");
        return;
    }

    // Parse keys
    const keys = keysText
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

    // Generate the keys array string for Lua
    const keysLuaArray = keys.length > 0
        ? keys.map(k => `        "${k}"`).join(',\n')
        : '        -- No keys added';

    const loaderCode = `--[[
    UnknownScripts Loader v1.0
    Personal Script Protection System
    Generated: ${new Date().toISOString()}
    
    Usage:
    local Loader = loadstring(game:HttpGet("YOUR_LOADER_URL"))()
    Loader.execute({ key = "YOUR_KEY_HERE" })
]]

local UnknownScripts = {}

-- Configuration
local CONFIG = {
    validKeys = {
${keysLuaArray}
    },
    scriptUrl = [[${scriptUrl}]],
    keyCheckEnabled = ${keyCheckEnabled}
}

-- Base64 Decode Function
local function b64decode(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r, f = '', (b:find(x) - 1)
        for i = 6, 1, -1 do 
            r = r .. (f % 2^i - f % 2^(i-1) > 0 and '1' or '0') 
        end
        return r
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c = 0
        for i = 1, 8 do 
            c = c + (x:sub(i, i) == '1' and 2^(8-i) or 0) 
        end
        return string.char(c)
    end))
end

-- Internal Functions
local function isValidKey(key)
    if not CONFIG.keyCheckEnabled then
        return true
    end
    for _, validKey in ipairs(CONFIG.validKeys) do
        if validKey == key then
            return true
        end
    end
    return false
end

-- Public API
function UnknownScripts.execute(options)
    options = options or {}
    local key = options.key or ""
    
    -- Validate key
    if not isValidKey(key) then
        warn("[UnknownScripts] ❌ Invalid or expired key!")
        return false
    end
    
    -- Fetch the protected script
    local success, scriptCode = pcall(function()
        return game:HttpGet(CONFIG.scriptUrl)
    end)
    
    if not success or not scriptCode then
        warn("[UnknownScripts] ❌ Failed to load script!")
        return false
    end
    
    -- Execute the script
    local execSuccess, execErr = pcall(function()
        loadstring(scriptCode)()
    end)
    
    if not execSuccess then
        warn("[UnknownScripts] ❌ Execution error: " .. tostring(execErr))
        return false
    end
    
    return true
end

function UnknownScripts.checkKey(key)
    return isValidKey(key)
end

function UnknownScripts.getVersion()
    return "1.0.0"
end

return UnknownScripts`;

    document.getElementById('loaderOutput').value = loaderCode;
    document.getElementById('loaderOutputArea').style.display = 'block';
}

function copyLoaderOutput() {
    const output = document.getElementById('loaderOutput');
    output.select();
    navigator.clipboard.writeText(output.value).then(() => {
        alert('✅ Loader copied to clipboard!');
    });
}

function downloadLoaderOutput() {
    const output = document.getElementById('loaderOutput').value;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "loader.lua";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view;
            if (viewId) switchView(viewId);
        });
    });

    // Render data
    renderScripts();
    renderKeys();
    updateStats();

    // Pre-fill loader keys from saved keys
    const keys = getKeys();
    const loaderKeysEl = document.getElementById('loaderKeys');
    if (loaderKeysEl && keys.length > 0) {
        loaderKeysEl.value = keys.map(k => k.key).join('\n');
    }

    // Close modal on outside click
    const modal = document.getElementById('editScriptModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEditModal();
        });
    }
});
