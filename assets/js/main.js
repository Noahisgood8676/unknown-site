/**
 * UnknownModule - Logic
 * Client-side encryption for Lua scripts
 */

const CONFIG = {
    accessCode: "unknown2011scripts",
    storageKey: "unknownscripts_auth"
};

// Auth Check - Only redirect if we are on the dashboard and NOT logged in
if (window.location.pathname.includes('dashboard.html')) {
    if (localStorage.getItem(CONFIG.storageKey) !== 'true') {
        window.location.href = 'index.html';
    }
}

function login() {
    const password = prompt("🔐 Enter Access Code:");
    if (password === CONFIG.accessCode) {
        localStorage.setItem(CONFIG.storageKey, 'true');
        window.location.href = 'dashboard.html';
    } else if (password !== null) {
        alert("❌ Invalid Access Code");
    }
}

function logout() {
    localStorage.removeItem(CONFIG.storageKey);
    window.location.href = 'index.html';
}

// ==========================================
// Encryption Logic (XOR + Byte Shuffle)
// ==========================================
function encryptScript() {
    const source = document.getElementById('sourceScript').value;
    const password = document.getElementById('scriptPassword').value;
    const outputArea = document.getElementById('resultArea');
    const demoPassSpan = document.getElementById('demoPass');

    if (!source || !password) {
        alert("⚠️ Please enter both your script and a password.");
        return;
    }

    // 1. Generate Key from Password (Simple Hash)
    let keyBytes = [];
    for (let i = 0; i < password.length; i++) {
        keyBytes.push(password.charCodeAt(i));
    }

    // 2. Encrypt Content (XOR)
    let encryptedBytes = [];
    for (let i = 0; i < source.length; i++) {
        let charCode = source.charCodeAt(i);
        let keyChar = keyBytes[i % keyBytes.length];
        // XOR Operation
        let encrypted = charCode ^ keyChar;
        // Additional shift based on key len to scramble further
        encrypted = (encrypted + keyBytes.length) % 256;
        encryptedBytes.push(encrypted);
    }

    // 3. Format as Lua Table
    const luaTable = "{" + encryptedBytes.join(",") + "}";

    // 4. Generate the Loader Payload
    // This Lua code runs on the client. It takes the password input,
    // recreates the decryption key, decrypts the bytes, and runs loadstring.
    const finalLua = `--[[
    Protected by UnknownScripts 🛡️
    Auth Required.
]]

return function(pass)
    if not pass or type(pass) ~= "string" then
        return warn("[Unknown] Password required!")
    end

    local enc = ${luaTable}
    local function decrypt(data, key)
        local res = {}
        local keyLen = #key
        local keyBytes = {string.byte(key, 1, -1)}
        
        for i = 1, #data do
            local k = keyBytes[(i-1) % keyLen + 1]
            local b = data[i]
            -- Reverse the shift
            b = (b - keyLen) % 256
            -- Reverse the XOR
            table.insert(res, string.char(bit32.bxor(b, k)))
        end
        return table.concat(res)
    end

    -- Attempt Decrypt
    local success, result = pcall(function()
        return decrypt(enc, pass)
    end)

    if not success then return warn("[Unknown] Decryption Error") end

    -- Verify (Simple check if it looks like Lua)
    -- If password is wrong, 'result' will be garbage and loadstring will fail usually
    
    local func, err = loadstring(result)
    if not func then
        warn("[Unknown] Invalid Password (Or compilation failed)")
        return
    end

    func() -- Run the script
end`;

    document.getElementById('finalOutput').value = finalLua;
    demoPassSpan.textContent = password;
    outputArea.style.display = 'block';

    // Scroll to result
    outputArea.scrollIntoView({ behavior: 'smooth' });
}

function copyToClipboard() {
    const copyText = document.getElementById("finalOutput");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("✅ Code copied!");
}

function downloadScript() {
    const text = document.getElementById("finalOutput").value;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "locked_script.lua";
    a.click();
}

// ==========================================
// Saved Scripts Library
// ==========================================
function getLibrary() {
    const data = localStorage.getItem('unknownscripts_library');
    try {
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveToLibrary() {
    const output = document.getElementById('finalOutput').value;
    const pass = document.getElementById('scriptPassword').value;
    // Extract first line or use generic name
    const source = document.getElementById('sourceScript').value;
    let name = source.split('\n')[0].substring(0, 30);

    if (name.startsWith('--')) name = name.substring(2).trim();
    if (!name || name.length < 2) name = "Untitled Script " + new Date().toLocaleTimeString();

    if (!output) return alert("⚠️ Encrypt a script first!");

    const lib = getLibrary();
    lib.unshift({
        id: Date.now().toString(),
        name: name,
        password: pass,
        code: output,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('unknownscripts_library', JSON.stringify(lib));
    renderLibrary();
    alert("✅ Saved to Library!");
}

function deleteScript(id) {
    if (!confirm("Are you sure?")) return;
    const lib = getLibrary().filter(s => s.id !== id);
    localStorage.setItem('unknownscripts_library', JSON.stringify(lib));
    renderLibrary();
}

function copySavedScript(id) {
    const lib = getLibrary();
    const script = lib.find(s => s.id === id);
    if (script) {
        navigator.clipboard.writeText(script.code);
        alert("✅ Encrypted code copied!");
    }
}

function renderLibrary() {
    const list = document.getElementById('savedScriptsList');
    if (!list) return; // Not on dashboard?

    const lib = getLibrary();

    if (lib.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                No saved scripts yet. Encrypt one and click "Save to Library".
            </div>
        `;
        return;
    }

    list.innerHTML = lib.map(s => `
        <div style="background: var(--bg-primary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(s.name)}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    <i class="fas fa-key"></i> Pass: <span style="font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${escapeHtml(s.password)}</span>
                    <span style="margin: 0 8px;">•</span>
                    ${s.date}
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="copySavedScript('${s.id}')" class="btn btn-outline btn-sm" title="Copy Code">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="deleteScript('${s.id}')" class="btn btn-outline btn-sm" style="border-color: #ef4444; color: #ef4444;" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial Render
document.addEventListener('DOMContentLoaded', renderLibrary);
