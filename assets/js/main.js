/**
 * UnknownModule - Logic
 * Client-side encryption for Lua scripts
 */

// Auth Check
if (localStorage.getItem('unknownscripts_auth') !== 'true') {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('unknownscripts_auth');
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
