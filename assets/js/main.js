// Navigation
function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('[id^="view-"]').forEach(el => {
        el.style.display = 'none';
    });

    // Show selected view
    document.getElementById(`view-${tabId}`).style.display = 'block';

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(el => {
        el.classList.remove('active');
    });
    // Simple heuristic to highlight the clicked link (in a real app, pass 'this')
    event.target.closest('.sidebar-link').classList.add('active');
}

// Obfuscation Logic (Client-Side Simulation)
function obfuscateScript() {
    const input = document.getElementById('scriptInput').value;
    if (!input) return alert("Please enter a script!");

    // Simple "Obfuscation" via Bytecode simulation (String.char)
    // This is NOT secure, but mimics the "look" of obfuscated code.
    let byteString = "";
    for (let i = 0; i < input.length; i++) {
        byteString += "\\" + input.charCodeAt(i);
    }

    // Create a "Watermark" or "Loader" wrapper
    const watermark = "-- Protected by Luarmor Free (Clone)\n";
    const loader = `loadstring(game:HttpGet("https://github.com/StartYourProject"))()`;

    // Actually just base64 encode it for the "protected" visual
    const b64 = btoa(input);
    const output = `${watermark}local _1 = "${b64}";\nlocal _2 = function(s) return s:reverse() end\n-- This is a demo obfuscation\nloadstring(game:GetService("HttpService"):JSONDecode('"${input}"'))()`; // Joke implementation

    // Better one:
    const betterOutput = `${watermark}local v1 = "${b64}"\nloadstring(game:GetService("HttpService"):JSONDecode('"'.. v1 ..'"'))() -- This is just a visual demo`;

    document.getElementById('scriptOutput').value = betterOutput;

    // Show functionality
    document.getElementById('outputArea').style.display = 'block';
    document.getElementById('copyBtn').style.display = 'inline-flex';
    document.getElementById('downloadBtn').style.display = 'inline-flex';
}

function copyOutput() {
    const output = document.getElementById('scriptOutput');
    output.select();
    document.execCommand('copy');
    alert("Copied to clipboard!");
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
}

function createLoader() {
    const rawLink = document.getElementById('rawLinkInput').value;
    if (!rawLink) return alert("Please paste your Raw Gist Link first!");

    // Validate it looks like a URL
    if (!rawLink.startsWith('http')) return alert("Invalid URL. Make sure it starts with http/https");

    const loaderCode = `loadstring(game:HttpGet("${rawLink}"))()`;

    document.getElementById('finalLoader').value = loaderCode;
    document.getElementById('finalLoaderArea').style.display = 'block';
}

// User Management / Key Gen
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'KEY_';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) key += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i < 3) key += '-';
    }

    const div = document.createElement('div');
    div.className = 'flex justify-between items-center';
    div.style.background = '#0d0d0d';
    div.style.padding = '0.75rem';
    div.style.borderRadius = '6px';
    div.innerHTML = `
        <span class="font-mono" style="color: var(--text-muted);">${key}</span>
        <button onclick="this.parentElement.remove()" style="color: #ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
    `;

    const list = document.getElementById('keyList');
    if (list) list.prepend(div);
}

// Auth Simulation
// Auth Simulation
const SECRET_PASS = "ư̵̡̡̱̖̮͚̻̻̯̞̩̬̣̟̟̖͎̰̜̗̎͑̓̍̇͂̅͋̅̽̈̓̄̾́̄̔͛̐̎͆̂̐͛̽̾͘̕͝͝͝ͅͅņ̵̡̬̙̪͈̘̠̮̹͚̮̟͇̺̳̝͇̙̼̺̘̫̰̰͔͖͓̻͕̓͜ͅͅḳ̸̛̛͚̘̟̘͓͖̈́͒́͊̽̏̍̅̇͌̑̔̄͛͂͛̇͗͂̂̏͋̂̀͗̋̉͋̀͒̄̆́́͒͐̄͒͘̕̚͠͝n̵̡̧̨̧̛̛̬̩̩͙̗̻͙̜̮͓̗̩̟͕̯̝̗̠̝̈́̑̋̂̔̈͊̋͆̓̔͆̅̂̇͑͆̉̓͒̍͋̿̓̋̈́̌̚͘̚͘ơ̶̛̙̆̓̍̀̓̇ẁ̸̢̡̢̯̩̣̯̱͔̣͙̖̤̼̰͙̮͉͚̗͚̬͕̦̰̭̟͎̤̜̼̗̱͉̤͚̞̮̜͉̫̖́̎̿̓̓̀́̎̚͜͝ͅň̶̡͇̝̠̘̣̯̹̯͙̮̲̼̩̝̥̊̂͐͊̍̂̂̈̐̈́͗̄͐͆̽̉̎̈́͊̊͊̌̍͌̿͂͊̔͆̓̈́̓͒̌̓͗̉̿̀̚͝͠ͅś̸̡̡̢̨̻̼̻̞̞̰͓̱̹̝͇̬̪̮̹͍̩̜̪͙̙͓̣̯̳͎̦̻̫͉̲͉̣͉̙͎̣͛̒͋̌͘͘̕͜ç̸̡̡̨̨̗̙̲̭̹̲̭̞̲̤̩̤̲̯͕͎̪̱̦̳̦̦͓̳̳̼̀͌̍̎̌̏̏͛̅͐͂̋̓͋͊̌̈̓̃̀̔̾̌̀̈́̾́͒̋̆̑̏̍̓̓͒͑̊́̈́̀́͘͠͝͝͠͠ͅͅr̶̢̨̪̹̦̲͎͈̻̔̈́̽͆̓̒͒̋̑̄͌́͛̎͐̾͗̌͑͋͐̐̈̓̓͑̿̔̋̍̓̈̔͐̈̇̋͊͛̍̇̚̚͘͘͠͝͝͠ī̶̟̣̖̮̮͍̬͉̘͓̼͔͌̀̅͒̆̂̋̿̓̎̀́̑͋̽̉̈́̈̔͒̾́̇̑̈́͂̊̔̌͒̽̈͋͑̿̚̚̕͘̕̕͘͝͝p̸̨̛͕̯̬͇̯͔͇̗̊̿̄̅̽̏̊̂͆̌̌̔ţ̷̗̪̗͖̲̖̙̹͇͇͓͈̮̜̬̞͎̦̥̫̘̣͈̬̞̩͇̣͔̗̉̉̅̽̔́̏̑̽́͆̍͐̈̾͘š̵̛̛͇͍͖̖̳͖͎̳͍͖̠̠̱̞̱̰̤͈̪̞̪̫͚̖̯͈̜͌̈̊̓͂̇͑̃̌̽̈́̎̊̊̔̔͝͠"; // Custom Access Code

function checkAuth() {
    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isLoggedIn = localStorage.getItem('luarmor_auth') === 'true';

    if (isDashboard && !isLoggedIn) {
        window.location.href = 'index.html';
    }
}

function login() {
    const pass = prompt("Enter Access Key:"); // Simple prompt for demo
    if (pass === SECRET_PASS) {
        localStorage.setItem('luarmor_auth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        alert("Invalid Key");
    }
}

function logout() {
    localStorage.removeItem('luarmor_auth');
    window.location.href = 'index.html';
}

// Run auth check immediately
checkAuth();

// Animation init
document.addEventListener('DOMContentLoaded', () => {
    // Add any init logic here
});
