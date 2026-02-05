/**
 * UnknownScripts - Main Application Logic
 * Clean, modular JavaScript for the protection panel
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    accessCode: "unknown2011scripts",
    storageKey: "unknownscripts_auth"
};

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

    if (password === null) return; // User cancelled

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

// Run auth check immediately
checkAuth();

// ============================================
// View Navigation (Dashboard)
// ============================================
function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewId) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Script Protection (Obfuscation)
// ============================================
function obfuscateScript() {
    const input = document.getElementById('scriptInput').value.trim();

    if (!input) {
        alert("⚠️ Please enter a script to protect!");
        return;
    }

    // Encode to Base64
    const encoded = btoa(unescape(encodeURIComponent(input)));

    // Generate a "protected" wrapper
    const watermark = "-- Protected by UnknownScripts\n-- Do not redistribute\n\n";

    const protectedCode = `${watermark}local _ENV = getfenv()
local _decode = function(s) 
    return (s:gsub('.', function(x) 
        local r, f = '', (x:byte() - 35) % 95 + 32
        for i = 8, 1, -1 do 
            r = r .. (f % 2^i - f % 2^(i-1) > 0 and '1' or '0') 
        end
        return string.char(tonumber(r, 2))
    end))
end

local _data = "${encoded}"
local _script = _decode(_data)

-- Runtime execution
loadstring(_script)()`;

    // Display output
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
        // Visual feedback
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

    // Create key element
    const keyItem = document.createElement('div');
    keyItem.className = 'key-item';
    keyItem.innerHTML = `
        <code>${key}</code>
        <div style="display: flex; align-items: center; gap: 12px;">
            <span class="key-status">Unused</span>
            <button class="key-delete" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add to list
    const keyList = document.getElementById('keyList');
    if (keyList) {
        keyList.insertBefore(keyItem, keyList.firstChild);
    }
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Setup sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view;
            if (viewId) {
                switchView(viewId);
            }
        });
    });
});
