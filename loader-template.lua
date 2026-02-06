--[[
    UnknownScripts Loader v1.0
    Personal Script Protection System
    
    Usage:
    local Loader = loadstring(game:HttpGet("YOUR_LOADER_URL"))()
    Loader.execute({ key = "YOUR_KEY_HERE" })
]]

local UnknownScripts = {}

-- Configuration (Edit these values)
local CONFIG = {
    -- Add your valid keys here
    validKeys = {
        "KEY-DEMO-ABCD-1234",
        -- Add more keys as needed
    },
    
    -- Your protected script's Raw Gist URL
    scriptUrl = "PASTE_YOUR_PROTECTED_SCRIPT_RAW_URL_HERE",
    
    -- Settings
    keyCheckEnabled = true,
    debugMode = false
}

-- Internal Functions
local function log(msg)
    if CONFIG.debugMode then
        print("[UnknownScripts] " .. tostring(msg))
    end
end

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

local function fetchScript(url)
    local success, result = pcall(function()
        return game:HttpGet(url)
    end)
    
    if success then
        return result
    else
        warn("[UnknownScripts] Failed to fetch script: " .. tostring(result))
        return nil
    end
end

-- Public API
function UnknownScripts.execute(options)
    options = options or {}
    local key = options.key or ""
    
    log("Attempting execution with key: " .. string.sub(key, 1, 8) .. "...")
    
    -- Validate key
    if not isValidKey(key) then
        warn("[UnknownScripts] ❌ Invalid or expired key!")
        return false
    end
    
    log("✅ Key validated!")
    
    -- Fetch and execute the protected script
    local scriptCode = fetchScript(CONFIG.scriptUrl)
    
    if not scriptCode then
        warn("[UnknownScripts] ❌ Failed to load script!")
        return false
    end
    
    log("Script loaded, executing...")
    
    local success, err = pcall(function()
        loadstring(scriptCode)()
    end)
    
    if not success then
        warn("[UnknownScripts] ❌ Execution error: " .. tostring(err))
        return false
    end
    
    log("✅ Script executed successfully!")
    return true
end

function UnknownScripts.checkKey(key)
    return isValidKey(key)
end

function UnknownScripts.getVersion()
    return "1.0.0"
end

-- Return the loader object
return UnknownScripts
