// ==UserScript==
// @name         Bots made by Yuta1111x
// @version      6
// @description  Unlimited bots spawn with proxies [bypass altcha]
// @author       Yuta1111x
// @match        *://*.moomoo.io/*
// @require      https://cdn.jsdelivr.net/npm/msgpack-lite@0.1.26/dist/msgpack.min.js
// @icon         https://moomoo.io/img/favicon.png
// @grant        none
// @run-at       document-start
// ==/UserScript==

const getEl = id => document.getElementById(id);
const msgpack5 = window.msgpack;
document.msgpack = msgpack5;

// ============ PROXY CONFIG ============
// Proxies with random names (25 total)
const PROXY_LIST = [
    "wss://relay-alpha-7x-production.up.railway.app",
    "wss://node-bridge-k9-production.up.railway.app",
    "wss://stream-hub-m3-production.up.railway.app",
    "wss://data-pipe-z5-production.up.railway.app",
    "wss://net-core-q8-production.up.railway.app",
    "wss://flux-gate-r4-production.up.railway.app",
    "wss://sync-wave-j7-production.up.railway.app",
    "wss://pulse-link-x2-production.up.railway.app",
    "wss://echo-mesh-v9-production.up.railway.app",
    "wss://drift-node-h5-production.up.railway.app",
    "wss://core-flux-t8-production.up.railway.app",
    "wss://beam-sync-p3-production.up.railway.app",
    "wss://wave-port-k6-production.up.railway.app",
    "wss://link-mesh-q1-production.up.railway.app",
    "wss://node-gate-z4-production.up.railway.app",
    "wss://data-stream-w7-production.up.railway.app",
    "wss://pulse-net-m2-production.up.railway.app",
    "wss://echo-link-f9-production.up.railway.app",
    "wss://sync-port-b5-production.up.railway.app",
    "wss://flux-wave-c3-production.up.railway.app",
    "wss://grid-hub-x1-production.up.railway.app",
    "wss://mesh-core-y6-production.up.railway.app",
    "wss://port-link-d8-production.up.railway.app",
    "wss://wave-node-a4-production.up.railway.app",
    "wss://beam-gate-s7-production.up.railway.app"
];

// Old proxies (commented out)
/*
const OLD_PROXY_LIST = [
    "wss://botsproxy-production.up.railway.app",
    "wss://botsproxy2-production.up.railway.app",
    "wss://botsproxy3-production.up.railway.app",
    "wss://botsproxy4-production.up.railway.app",
    "wss://botsproxy5-production.up.railway.app",
    "wss://botsproxy6-production.up.railway.app",
    "wss://botsproxy7-production.up.railway.app",
    "wss://botsproxy8-production.up.railway.app",
    "wss://botsproxy9-production.up.railway.app",
    "wss://botsproxy10-production.up.railway.app",
    "wss://botsproxy11-production.up.railway.app",
    "wss://botsproxy12-production.up.railway.app",
    "wss://botsproxy13-production.up.railway.app",
    "wss://botsproxy14-production.up.railway.app",
    "wss://botsproxy15-production.up.railway.app",
    "wss://botsproxy16-production.up.railway.app",
    "wss://botsproxy17-production.up.railway.app",
    "wss://botsproxy18-production.up.railway.app",
    "wss://botsproxy19-production.up.railway.app",
    "wss://botsproxy20-production.up.railway.app"
];
*/
window.PROXY_LIST = PROXY_LIST;
const MAX_BOTS = 1 + PROXY_LIST.length * 2;

// ============ GRID REMOVAL ============
const GRID_ENABLED = false;
function inRange(value, min, max) { return value > min && value < max; }
function createHook(target, prop, callback) {
    const symbol = Symbol(prop);
    Object.defineProperty(target, prop, {
        get() { return this[symbol]; },
        set(value) { callback(this, symbol, value); },
        configurable: true
    });
}
createHook(window, "config", function(that, symbol, value) {
    if (typeof value === "object" && value.hasOwnProperty("maxScreenHeight")) {
        delete window.config;
        Object.defineProperty(window, "config", { value: value, configurable: false, writeable: false });
    }
});
CanvasRenderingContext2D.prototype.moveTo = new Proxy(CanvasRenderingContext2D.prototype.moveTo, {
    apply(target, _this, args) {
        if (!GRID_ENABLED) {
            const [x, y] = args;
            const { maxScreenWidth, maxScreenHeight } = window.config || {};
            if (inRange(x, 0, maxScreenWidth) || inRange(y, 0, maxScreenHeight)) return null;
        }
        return target.apply(_this, args);
    }
});

// Internal config (do not modify) - yuta: 1
const _$cfg = { _v: 1, _m: 0x59555441 };
const isAdmin = () => _$cfg._v === 1 && (_$cfg._m ^ 0x59555441) === 0;

// ============ ADVANCED GUI v3.0 ============
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    const initGUI = () => {
        if (!document.head || !document.body) {
            return setTimeout(initGUI, 50);
        }
        
        // Blood theme - dark & realistic
        const ACCENT = '#8b0000'; // Dark blood red
        const ACCENT_LIGHT = '#b91c1c';
        const ACCENT_GLOW = 'rgba(139, 0, 0, 0.5)';
        
        const style = document.createElement('style');
    style.innerHTML = `

        
        #modMenu {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 700px; max-width: 95vw;
            background: linear-gradient(145deg, #050505 0%, #0a0a0a 50%, #0d0808 100%);
            border-radius: 16px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.95), 0 0 60px ${ACCENT_GLOW}, inset 0 1px 0 rgba(139,0,0,0.2);
            color: #e8e8e8; font-family: 'Segoe UI', system-ui, sans-serif;
            opacity: 0; visibility: hidden; z-index: 99999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(139, 0, 0, 0.4);
            overflow: hidden;
        }
        #modMenu.show { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
        
        .mm-header {
            background: linear-gradient(135deg, #1a0000 0%, ${ACCENT} 50%, #1a0000 100%);
            padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(139,0,0,0.5);
        }
        .mm-title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
        .mm-title svg { width: 24px; height: 24px; }
        .mm-close {
            width: 32px; height: 32px; border-radius: 50%;
            background: rgba(0,0,0,0.3); border: none;
            color: #fff; cursor: pointer; font-size: 18px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .mm-close:hover { background: rgba(0,0,0,0.5); transform: rotate(90deg); }
        

        
        .mm-stats-bar {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
            padding: 12px 16px; background: rgba(0,0,0,0.6);
            border-bottom: 1px solid rgba(139,0,0,0.2);
        }
        .mm-stat { text-align: center; padding: 8px; background: rgba(139,0,0,0.08); border-radius: 8px; border: 1px solid rgba(139,0,0,0.15); }
        .mm-stat-num { font-size: 22px; font-weight: 700; color: ${ACCENT_LIGHT}; }
        .mm-stat-label { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        
        .mm-section-title {
            font-size: 10px; color: ${ACCENT_LIGHT}; margin-bottom: 10px;
            text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
            display: flex; align-items: center; gap: 6px;
        }
        .mm-section-title svg { width: 14px; height: 14px; opacity: 0.7; }
        
        .mm-row { display: flex; gap: 6px; margin-bottom: 6px; }
        .mm-btn {
            flex: 1; padding: 10px 8px; border: none; border-radius: 6px;
            background: rgba(139,0,0,0.15); color: #ccc;
            font-size: 11px; cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 4px;
            border: 1px solid rgba(139,0,0,0.25);
        }
        .mm-btn:hover { background: rgba(139,0,0,0.3); border-color: rgba(139,0,0,0.5); color: #fff; }
        .mm-btn.active { background: linear-gradient(135deg, ${ACCENT} 0%, #5c0000 100%); border-color: ${ACCENT}; color: #fff; box-shadow: 0 0 15px rgba(139,0,0,0.4); }
        .mm-btn.red { background: linear-gradient(135deg, #8b0000 0%, #5c0000 100%); border-color: #8b0000; }
        .mm-btn svg { width: 14px; height: 14px; }
        
        .mm-slider-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .mm-slider {
            flex: 1; -webkit-appearance: none; height: 6px; border-radius: 3px;
            background: rgba(255,255,255,0.1); outline: none;
        }
        .mm-slider::-webkit-slider-thumb {
            -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
            background: linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%);
            cursor: pointer; box-shadow: 0 2px 10px ${ACCENT_GLOW};
        }
        .mm-slider-val { min-width: 35px; text-align: center; font-size: 20px; font-weight: 700; color: ${ACCENT_LIGHT}; }
        
        .mm-quick-btns { display: flex; gap: 4px; margin-bottom: 8px; }
        .mm-quick-btn {
            flex: 1; padding: 6px; border: none; border-radius: 6px;
            background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
            font-size: 10px; cursor: pointer; transition: all 0.2s;
        }
        .mm-quick-btn:hover { background: rgba(220, 38, 38, 0.3); color: #fff; }
        
        .mm-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
        .mm-toggle-label { font-size: 11px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 6px; }
        .mm-toggle-label svg { width: 14px; height: 14px; opacity: 0.6; }
        .mm-toggle {
            width: 36px; height: 18px; border-radius: 9px;
            background: rgba(255,255,255,0.15); cursor: pointer;
            position: relative; transition: all 0.2s;
        }
        .mm-toggle.on { background: linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%); box-shadow: 0 0 10px rgba(139,0,0,0.5); }
        .mm-toggle::after {
            content: ''; position: absolute; top: 2px; left: 2px;
            width: 14px; height: 14px; border-radius: 50%;
            background: #fff; transition: all 0.2s;
        }
        .mm-toggle.on::after { left: 20px; }
        
        .mm-record-box {
            background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.2);
            border-radius: 8px; padding: 10px; margin-top: 8px;
        }
        .mm-record-info { font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .mm-record-ages { font-size: 12px; color: ${ACCENT_LIGHT}; font-weight: 600; }
        
        .mm-hint { text-align: center; padding: 10px; font-size: 10px; color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); }
        
        .mm-tabs { display: flex; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .mm-tab {
            flex: 1; padding: 12px; text-align: center; cursor: pointer;
            font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
            color: rgba(255,255,255,0.5); transition: all 0.2s; border: none; background: none;
        }
        .mm-tab:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.03); }
        .mm-tab.active { color: #ef4444; background: rgba(220, 38, 38, 0.1); border-bottom: 2px solid #dc2626; }
        .mm-tab svg { width: 14px; height: 14px; vertical-align: middle; margin-right: 6px; }
        .mm-tab-content { display: none; padding: 16px; }
        .mm-tab-content.active { display: block; }
        

        /* Custom scrollbar */
        .mm-proxy-grid::-webkit-scrollbar { width: 6px; }
        .mm-proxy-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 3px; }
        .mm-proxy-grid::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${ACCENT} 0%, #5c0000 100%); border-radius: 3px; }
        .mm-proxy-grid::-webkit-scrollbar-thumb:hover { background: ${ACCENT_LIGHT}; }
        
        .mm-proxy-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; max-height: 200px; overflow-y: auto; padding-right: 4px; }
        .mm-proxy-item {
            font-size: 9px; padding: 8px 10px; background: rgba(139,0,0,0.1);
            border-radius: 6px; display: flex; justify-content: space-between; align-items: center;
            border: 1px solid rgba(139,0,0,0.2); transition: all 0.2s;
        }
        .mm-proxy-item:hover { background: rgba(139,0,0,0.2); border-color: rgba(139,0,0,0.4); }
        .mm-proxy-status { width: 8px; height: 8px; border-radius: 50%; }
        .mm-proxy-status.online { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        .mm-proxy-status.offline { background: #ef4444; }
    `;
    document.head.appendChild(style);



    const menu = document.createElement('div');
    menu.id = 'modMenu';
    menu.innerHTML = `
        <div class="mm-header">
            <span class="mm-title">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8.5" cy="16" r="1.5"/><circle cx="15.5" cy="16" r="1.5"/><path d="M12 2v4"/><path d="M8 6h8"/>
                </svg>
                MultiBox Pro
            </span>
            <button class="mm-close" id="mmClose">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="mm-stats-bar">
            <div class="mm-stat">
                <div class="mm-stat-num" id="botCount">0</div>
                <div class="mm-stat-label">Active</div>
            </div>
            <div class="mm-stat">
                <div class="mm-stat-num" id="queueCount">0</div>
                <div class="mm-stat-label">Queue</div>
            </div>
            <div class="mm-stat">
                <div class="mm-stat-num" id="canSpawn">0</div>
                <div class="mm-stat-label">Can Join</div>
            </div>
            <div class="mm-stat">
                <div class="mm-stat-num" id="maxBots">${MAX_BOTS}</div>
                <div class="mm-stat-label">Total</div>
            </div>
            <div class="mm-stat">
                <div class="mm-stat-num" id="serverPlayers">0</div>
                <div class="mm-stat-label">Server</div>
            </div>
        </div>
        <div class="mm-tabs">
            <button class="mm-tab active" data-tab="bots">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8.5" cy="16" r="1.5"/><circle cx="15.5" cy="16" r="1.5"/></svg>
                Bots
            </button>
            <button class="mm-tab" data-tab="settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
            </button>
            <button class="mm-tab" data-tab="admin" id="adminTab" style="display:none;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin
            </button>
        </div>
        <div class="mm-tab-content active" id="tabBots">
        <div class="mm-section">
            <div class="mm-section-title">Spawn Bots</div>
            <div class="mm-slider-wrap">
                <input type="range" class="mm-slider" id="spawnSlider" min="1" max="${MAX_BOTS}" value="5">
                <span class="mm-slider-val" id="spawnVal">5</span>
            </div>
            <div class="mm-quick-btns">
                <button class="mm-quick-btn" data-val="1">1</button>
                <button class="mm-quick-btn" data-val="5">5</button>
                <button class="mm-quick-btn" data-val="10">10</button>
                <button class="mm-quick-btn" data-val="15">15</button>
                <button class="mm-quick-btn" id="btnMax">MAX</button>
            </div>
            <div class="mm-row">
                <button class="mm-btn active" id="btnSpawn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> SPAWN</button>
                <button class="mm-btn red" id="btnDC"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> DC ALL</button>
            </div>
            <div class="mm-row">
                <button class="mm-btn" id="btnJoinClan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Clan</button>
                <button class="mm-btn" id="btnCopyGear"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Gear</button>
                <button class="mm-btn" id="btnCopyWeapon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg> Weapon</button>
            </div>
        </div>
        <div class="mm-section">
            <div class="mm-section-title">Bot Mode</div>
            <div class="mm-row">
                <button class="mm-btn" id="btnFollow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg> Follow</button>
                <button class="mm-btn" id="btnSmart"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12l8-8"/></svg> Smart</button>
                <button class="mm-btn" id="btnStay"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/></svg> Stay</button>
                <button class="mm-btn" id="btnCursor"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg> Cursor</button>
            </div>
            <div class="mm-row">
                <button class="mm-btn" id="btnWood"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M12 22v-7l-2-2"/><path d="M17 8v.8A6 6 0 0 1 13.8 20v0H10v0A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z"/></svg> Wood</button>
                <button class="mm-btn" id="btnFood"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M8 12h8"/></svg> Food</button>
                <button class="mm-btn" id="btnStone"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/></svg> Stone</button>
                <button class="mm-btn" id="btnGold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><circle cx="12" cy="12" r="8"/><path d="M12 6v12"/><path d="M15 9.5c0-1-1.5-2-3-2s-3 1-3 2 1.5 1.5 3 2 3 1 3 2-1.5 2-3 2-3-1-3-2"/></svg> Gold</button>
            </div>
        </div>

        <div class="mm-section">
            <div class="mm-section-title">Bot Age Upgrades (Recording)</div>
            <div class="mm-record-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                Your upgrades are recorded automatically. Bots will copy your choices when they reach the same age.
            </div>
            <div class="mm-record-status" id="recordStatus">
                <span class="mm-rec-label">Recorded:</span>
                <span class="mm-rec-ages" id="recAges">None</span>
            </div>
            <div class="mm-row">
                <button class="mm-btn" id="btnClearRec">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    Clear Recording
                </button>
            </div>
        </div>
        </div>
        <div class="mm-tab-content" id="tabSettings">
            <div class="mm-section">
                <div class="mm-section-title">Bot Options</div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> Copy my actions (place/hit)</span>
                    <div class="mm-toggle on" id="togCopy"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Copy my direction</span>
                    <div class="mm-toggle on" id="togDir"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg> Copy my movement</span>
                    <div class="mm-toggle" id="togMove"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg> Auto upgrade bots</span>
                    <div class="mm-toggle" id="togAutoUpgrade"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Skip Upgrade (auto select)</span>
                    <div class="mm-toggle on" id="togSkipUpgrade"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Auto Heal (me)</span>
                    <div class="mm-toggle on" id="togAutoHealMe"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Auto Heal (bots)</span>
                    <div class="mm-toggle on" id="togAutoHealBots"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></svg> AutoAim (bots)</span>
                    <div class="mm-toggle" id="togAutoAim"></div>
                </div>
                <div class="mm-toggle-row">
                    <span class="mm-toggle-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Sync Attack [X]</span>
                    <div class="mm-toggle" id="togSync"></div>
                </div>
            </div>
        </div>
        <div class="mm-tab-content" id="tabAdmin">
            <div class="mm-section">
                <div class="mm-section-title">Proxy Status</div>
                <div class="mm-proxy-grid" id="proxyGrid"></div>
                <div class="mm-row" style="margin-top: 10px;">
                    <button class="mm-btn" id="btnCheckProxies">Check All</button>
                    <button class="mm-btn red" id="btnClearProxies"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> Clear All</button>
                </div>
            </div>
        </div>
        <div class="mm-hint">ESC toggle | X sync | v4.0 Blood by Yuta1111x</div>
    `;
    document.body.appendChild(menu);

    // Menu toggle
    let menuOpen = false;
    const toggleMenu = () => {
        menuOpen = !menuOpen;
        menu.classList.toggle('show', menuOpen);
    };
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') toggleMenu();
    });

    getEl('mmClose').onclick = () => { menuOpen = false; menu.classList.remove('show'); };
    
    // Tab switching
    document.querySelectorAll('.mm-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.mm-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.mm-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const tabId = 'tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
            getEl(tabId)?.classList.add('active');
        };
    });
    
    // Show admin tab if admin
    if (isAdmin()) {
        getEl('adminTab').style.display = 'block';
    }
    
    // Admin panel - proxy status
    if (isAdmin()) {
        const proxyGrid = getEl('proxyGrid');
        const updateProxyGrid = () => {
            proxyGrid.innerHTML = PROXY_LIST.map((proxy, i) => {
                const name = proxy.split('//')[1].split('.')[0];
                const usage = window.proxyUsage?.[proxy] || 0;
                return '<div class="mm-proxy-item"><span>' + name + '</span><span>' + usage + '/2</span><div class="mm-proxy-status online"></div></div>';
            }).join('');
        };
        updateProxyGrid();
        setInterval(updateProxyGrid, 1000);
        
        getEl('btnCheckProxies').onclick = async () => {
            for (let i = 0; i < PROXY_LIST.length; i++) {
                const proxy = PROXY_LIST[i];
                const name = proxy.split('//')[1].split('.')[0];
                try {
                    await fetch(proxy.replace('wss://', 'https://') + '/health', { mode: 'no-cors' });
                    console.log('[Admin] ' + name + ': OK');
                } catch (e) {
                    console.log('[Admin] ' + name + ': OFFLINE');
                }
            }
        };
        
        getEl('btnClearProxies').onclick = () => window.clearProxies?.();
    }

    // Slider handler
    const slider = getEl('spawnSlider');
    const sliderVal = getEl('spawnVal');
    slider.oninput = () => { sliderVal.textContent = slider.value; };
    
    // Quick buttons
    document.querySelectorAll('.mm-quick-btn').forEach(btn => {
        btn.onclick = () => {
            slider.value = btn.dataset.val;
            sliderVal.textContent = btn.dataset.val;
        };
    });

    // Button handlers
    getEl('btnSpawn').onclick = () => window.spawnBots?.(parseInt(slider.value) || 1);
    getEl('btnDC').onclick = () => window.disconnectAll?.();
    // Bot mode buttons with active state
    const modeButtons = ['btnFollow', 'btnSmart', 'btnStay', 'btnCursor', 'btnWood', 'btnFood', 'btnStone', 'btnGold'];
    const setModeActive = (activeBtn) => {
        modeButtons.forEach(id => getEl(id)?.classList.remove('active'));
        getEl(activeBtn)?.classList.add('active');
    };
    
    getEl('btnFollow').onclick = () => { window.botCommand?.('follow'); setModeActive('btnFollow'); };
    getEl('btnSmart').onclick = () => { window.botCommand?.('smart'); setModeActive('btnSmart'); };
    getEl('btnStay').onclick = () => { window.botCommand?.('stay'); setModeActive('btnStay'); };
    getEl('btnCursor').onclick = () => { window.botCommand?.('cursor'); setModeActive('btnCursor'); };
    getEl('btnWood').onclick = () => { window.botCommand?.('wood'); setModeActive('btnWood'); };
    getEl('btnFood').onclick = () => { window.botCommand?.('food'); setModeActive('btnFood'); };
    getEl('btnStone').onclick = () => { window.botCommand?.('stone'); setModeActive('btnStone'); };
    getEl('btnGold').onclick = () => { window.botCommand?.('gold'); setModeActive('btnGold'); };
    getEl('btnJoinClan').onclick = () => window.botsJoinClan?.();
    getEl('btnCopyGear').onclick = () => window.botsCopyGear?.();
    getEl('btnCopyWeapon').onclick = () => window.botsCopyWeapon?.();

    // Load saved settings from localStorage
    const loadSettings = () => {
        try {
            const saved = localStorage.getItem('multibox_settings');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    };
    const saveSettings = () => {
        const settings = {};
        ['botsCopyActions', 'botsCopyDir', 'botsCopyMove', 'botsAutoUpgrade', 'skipUpgrade', 'autoHealMe', 'autoHealBots', 'botsAutoAim', 'syncAttackEnabled'].forEach(k => {
            settings[k] = window[k];
        });
        localStorage.setItem('multibox_settings', JSON.stringify(settings));
    };
    const savedSettings = loadSettings();
    
    // Toggle handlers with localStorage
    const setupToggle = (id, key, def) => {
        // Load from saved or use default
        window[key] = savedSettings[key] !== undefined ? savedSettings[key] : def;
        const el = getEl(id);
        if (window[key]) el.classList.add('on');
        el.onclick = () => {
            window[key] = !window[key];
            el.classList.toggle('on', window[key]);
            saveSettings();
            console.log(`[MultiBox] ${key}: ${window[key] ? 'ON' : 'OFF'}`);
        };
    };
    setupToggle('togCopy', 'botsCopyActions', true);
    setupToggle('togDir', 'botsCopyDir', true);
    setupToggle('togMove', 'botsCopyMove', false);
    setupToggle('togAutoUpgrade', 'botsAutoUpgrade', false);
    setupToggle('togSkipUpgrade', 'skipUpgrade', true);
    setupToggle('togAutoHealMe', 'autoHealMe', true);
    setupToggle('togAutoHealBots', 'autoHealBots', true);
    setupToggle('togAutoAim', 'botsAutoAim', false);
    setupToggle('togSync', 'syncAttackEnabled', false);
    
    // Clear recording button
    getEl('btnClearRec').onclick = () => {
        window.recordedUpgrades = {};
        updateRecordedDisplay();
        console.log('[MultiBox] Upgrade recording cleared');
    };
    
    // Update recorded ages display
    const updateRecordedDisplay = () => {
        const ages = Object.keys(window.recordedUpgrades).sort((a,b) => a-b);
        getEl('recAges').textContent = ages.length ? ages.join(', ') : 'None';
    };
    window.updateRecordedDisplay = updateRecordedDisplay;

    // Fetch server player count from API
    const fetchServerPlayers = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const serverParam = urlParams.get('server'); // e.g. "frankfurt:RY"
            if (!serverParam) return;
            
            const [region, name] = serverParam.split(':');
            const isSandbox = window.location.hostname.includes('sandbox');
            const apiUrl = isSandbox 
                ? 'https://api-sandbox.moomoo.io/servers?v=1.26'
                : 'https://api.moomoo.io/servers?v=1.26';
            const res = await fetch(apiUrl);
            const servers = await res.json();
            const server = servers.find(s => s.region === region && s.name === name);
            if (server) {
                window.serverPlayerCount = server.playerCount;
            }
        } catch (e) {
            console.error('[MultiBox] Failed to fetch server info:', e);
        }
    };
    fetchServerPlayers();
    setInterval(fetchServerPlayers, 1000); // Update every 1 second
    
    // Update stats
    setInterval(() => {
        const activeBots = window.sockets ? Object.keys(window.sockets).filter(k => window.sockets[k]).length : 0;
        const queueBots = window.botsInQueue || 0;
        const serverPlayers = window.serverPlayerCount || 1;
        
        // Can Join = min(available proxy slots, available server slots)
        const proxySlots = MAX_BOTS - activeBots - queueBots; // How many more bots we can spawn
        const serverSlots = 40 - serverPlayers; // How many slots left on server
        const canJoin = Math.max(0, Math.min(proxySlots, serverSlots));
        
        if (getEl('botCount')) getEl('botCount').textContent = activeBots;
        if (getEl('queueCount')) getEl('queueCount').textContent = queueBots;
        if (getEl('canSpawn')) getEl('canSpawn').textContent = canJoin;
        if (getEl('maxBots')) getEl('maxBots').textContent = MAX_BOTS;
        if (getEl('serverPlayers')) getEl('serverPlayers').textContent = `${serverPlayers}/40`;
    }, 300);
    
    // MAX button handler - sets to CAN JOIN value
    getEl('btnMax').onclick = () => {
        const activeBots = window.sockets ? Object.keys(window.sockets).filter(k => window.sockets[k]).length : 0;
        const queueBots = window.botsInQueue || 0;
        const serverPlayers = window.serverPlayerCount || 1;
        const proxySlots = MAX_BOTS - activeBots - queueBots;
        const serverSlots = 40 - serverPlayers;
        const canJoin = Math.max(0, Math.min(proxySlots, serverSlots));
        slider.value = canJoin;
        sliderVal.textContent = canJoin;
    };
    }; // End of initGUI
    
    initGUI();
})();


// ============ CORE VARIABLES ============
let ws, width, height, mouseX = 0, mouseY = 0, dir = 0;
let primary = 0, secondary = null, foodType = 0, wallType = 3, spikeType = 6;
let millType = 10, boostType, turretType;
let sockets = {}, bots = {}, closed = false;
let myPlayer = {}, players = {}, playerss = [];
let enemiesNear = [], nearestEnemy, nearestEnemyAngle;
let treeList = [], bushList = [], stoneList = [], goldList = [];

window.botsStay = false;
window.playerFollowerGlobal = true;
window.botsCursorFollow = false;
window.botsSmartFollow = false;
window.botsAutoAim = false;
window.syncAttackEnabled = false;
window.syncCooldown = false;

// Range weapons: bow (9), repeater crossbow (12), crossbow (13), musket (15)
const RANGE_WEAPONS = [9, 12, 13, 15];

// Sync attack function - all bots + player shoot at same enemy
window.syncAttack = () => {
    if (window.syncCooldown || !nearestEnemy) return;
    
    const enemyX = nearestEnemy[1];
    const enemyY = nearestEnemy[2];
    const angle = Math.atan2(enemyY - myPlayer.y, enemyX - myPlayer.x);
    
    // Check if player has range weapon
    const playerHasRange = RANGE_WEAPONS.includes(secondary);
    
    // Find bots with range weapons
    const botsWithRange = [];
    for (let i in sockets) {
        const botWs = sockets[i];
        if (botWs && RANGE_WEAPONS.includes(botWs.secondary)) {
            botsWithRange.push(botWs);
        }
    }
    
    if (!playerHasRange && botsWithRange.length === 0) return;
    
    window.syncCooldown = true;
    
    // Player shoots
    if (playerHasRange && ws?.oldSend) {
        ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [secondary, 1]]))));
        ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['D', [angle]]))));
        ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [1, angle]]))));
        setTimeout(() => {
            ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [0]]))));
            ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [primary, 1]]))));
        }, 100);
    }
    
    // Bots shoot
    for (const botWs of botsWithRange) {
        botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [botWs.secondary, 1]]))));
        botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['D', [angle]]))));
        botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [1, angle]]))));
        setTimeout(() => {
            botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [0]]))));
            botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [botWs.primary, 1]]))));
        }, 100);
    }
    
    // 3 second cooldown
    setTimeout(() => { window.syncCooldown = false; }, 3000);
    console.log(`[Sync] Fired at enemy! Player: ${playerHasRange}, Bots: ${botsWithRange.length}`);
};

// X key for sync attack
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'x' && window.syncAttackEnabled) {
        window.syncAttack();
    }
});

// ============ PATHFINDER SYSTEM ============
// Store all game objects (buildings, spikes, etc.)
window.gameObjects = [];

// A* Pathfinder class
class Pathfinder {
    constructor(gridSize = 50) {
        this.gridSize = gridSize;
    }
    
    // Check if position collides with any object
    isBlocked(x, y, objects, botScale = 35) {
        for (const obj of objects) {
            if (!obj || obj.dead) continue;
            const dist = Math.hypot(x - obj.x, y - obj.y);
            const minDist = (obj.scale || 50) + botScale + 10; // Add buffer
            if (dist < minDist) return obj; // Return blocking object
        }
        return null;
    }
    
    // Get neighbors for A* (8 directions)
    getNeighbors(x, y) {
        const g = this.gridSize;
        return [
            {x: x + g, y: y},
            {x: x - g, y: y},
            {x: x, y: y + g},
            {x: x, y: y - g},
            {x: x + g, y: y + g},
            {x: x - g, y: y - g},
            {x: x + g, y: y - g},
            {x: x - g, y: y + g}
        ];
    }
    
    // Heuristic (Euclidean distance)
    heuristic(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }
    
    // A* pathfinding algorithm
    findPath(start, goal, objects, maxIterations = 500) {
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const key = (p) => `${Math.round(p.x)},${Math.round(p.y)}`;
        
        gScore.set(key(start), 0);
        fScore.set(key(start), this.heuristic(start, goal));
        
        let iterations = 0;
        
        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            
            // Get node with lowest fScore
            openSet.sort((a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity));
            const current = openSet.shift();
            const currentKey = key(current);
            
            // Check if we reached the goal (within gridSize distance)
            if (this.heuristic(current, goal) < this.gridSize * 2) {
                // Reconstruct path
                const path = [current];
                let curr = currentKey;
                while (cameFrom.has(curr)) {
                    const prev = cameFrom.get(curr);
                    path.unshift(prev);
                    curr = key(prev);
                }
                return { path, blocked: null };
            }
            
            closedSet.add(currentKey);
            
            // Check neighbors
            for (const neighbor of this.getNeighbors(current.x, current.y)) {
                const neighborKey = key(neighbor);
                
                if (closedSet.has(neighborKey)) continue;
                
                // Check if blocked
                const blockingObj = this.isBlocked(neighbor.x, neighbor.y, objects);
                if (blockingObj) continue;
                
                const tentativeG = (gScore.get(currentKey) || 0) + this.gridSize;
                
                if (!openSet.find(n => key(n) === neighborKey)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }
                
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, goal));
            }
        }
        
        // No path found - find closest blocking object to destroy
        const directPath = this.isBlocked(
            start.x + (goal.x - start.x) * 0.3,
            start.y + (goal.y - start.y) * 0.3,
            objects
        );
        
        return { path: null, blocked: directPath };
    }
    
    // Get next move direction for bot
    getNextMove(botX, botY, targetX, targetY, objects) {
        const start = { x: botX, y: botY };
        const goal = { x: targetX, y: targetY };
        
        // First check if direct path is clear
        const directBlock = this.isBlocked(
            botX + (targetX - botX) * 0.5,
            botY + (targetY - botY) * 0.5,
            objects
        );
        
        if (!directBlock) {
            // Direct path is clear
            return {
                angle: Math.atan2(targetY - botY, targetX - botX),
                attack: null,
                distance: Math.hypot(targetX - botX, targetY - botY)
            };
        }
        
        // Need pathfinding
        const result = this.findPath(start, goal, objects);
        
        if (result.path && result.path.length > 1) {
            // Follow path
            const next = result.path[1];
            return {
                angle: Math.atan2(next.y - botY, next.x - botX),
                attack: null,
                distance: Math.hypot(next.x - botX, next.y - botY)
            };
        }
        
        if (result.blocked) {
            // Attack blocking object
            return {
                angle: Math.atan2(result.blocked.y - botY, result.blocked.x - botX),
                attack: result.blocked,
                distance: Math.hypot(result.blocked.x - botX, result.blocked.y - botY)
            };
        }
        
        // Fallback - move directly
        return {
            angle: Math.atan2(targetY - botY, targetX - botX),
            attack: null,
            distance: Math.hypot(targetX - botX, targetY - botY)
        };
    }
}

const pathfinder = new Pathfinder(40);
window.serverPlayerCount = 1;
window.botsInQueue = 0;

// Proxy usage tracking: { proxyUrl: count } - max 2 per proxy
window.proxyUsage = {};
window.directUsed = false; // Track if direct connection is used

// Initialize proxy usage
PROXY_LIST.forEach(proxy => { window.proxyUsage[proxy] = 0; });

// Recorded upgrades from player (age -> upgrade packet data)
window.recordedUpgrades = {};
window.playerAge = 1; // Starts at 1, increments on each upgrade
window.skipUpgrade = true; // Auto select upgrade like script.js

// Auto upgrade function - sends H packet with upgrade ID
const autoSelectUpgrade = (upgradeId) => {
    if (ws?.oldSend) {
        ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['H', [upgradeId]]))));
        console.log(`[MultiBox] Auto-selected upgrade ${upgradeId}`);
    }
};
let autoaim = false, autoAttack = false, freeze = false;
let followingfarm = false, followingtype = null;
let pointer = true, pointingOnPosition = {};
let friend = [], LED = Date.now();

// ============ UTILITY FUNCTIONS ============
const dist = (a, b) => Math.sqrt(Math.pow(b.y - a[2], 2) + Math.pow(b.x - a[1], 2));
const toRad = angle => angle * (Math.PI / 180);
const doNewSend = e => ws?.oldSend(new Uint8Array(Array.from(msgpack5.encode(e))));
const sendForAll = (e, count) => {
    doNewSend(e);
    if (window.botsCopyActions && Object.keys(sockets).length > 0 && (!count ? !followingfarm : true)) {
        for (let i in sockets) sockets[i]?.oldSend(new Uint8Array(Array.from(msgpack5.encode(e))));
    }
};

// ============ AUTO HEAL SYSTEM ============
// Food healing values: apple=20, cookie=40, cheese=30
const FOOD_HEALING = { 0: 20, 1: 40, 2: 30 }; // foodType -> healing
window.autoHealMe = true;
window.autoHealBots = true;
window.playerHealth = 100;
window.playerShameCount = 0;

// Place food for player (like script.js je(0, dir))
const placeFood = (direction) => {
    if (!ws?.oldSend) return;
    // Select food item (slot 0)
    ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [foodType]]))));
    // Place it
    ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [1, direction]]))));
    // Deselect
    ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [0]]))));
    // Switch back to weapon
    ws.oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [primary, 1]]))));
};

// Calculate how many food needed to full heal
const getFoodNeeded = (health, foodHeal) => {
    if (health >= 100) return 0;
    return Math.ceil((100 - health) / foodHeal);
};

// Auto heal player when damaged
const autoHealPlayer = () => {
    if (!window.autoHealMe || window.playerHealth >= 100) return;
    if (window.playerShameCount >= 5) return; // Don't spam if shamed
    
    const healing = FOOD_HEALING[foodType] || 20;
    const needed = getFoodNeeded(window.playerHealth, healing);
    
    for (let i = 0; i < needed; i++) {
        placeFood(dir);
    }
};

// Auto heal bot
const autoHealBot = (botWs, botHealth, botFoodType, botDir) => {
    if (!window.autoHealBots || botHealth >= 100) return;
    
    const healing = FOOD_HEALING[botFoodType] || 20;
    const needed = getFoodNeeded(botHealth, healing);
    const send = e => botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(e))));
    
    for (let i = 0; i < needed; i++) {
        send(['z', [botFoodType]]);
        send(['F', [1, botDir]]);
        send(['F', [0]]);
    }
};

// ============ ALTCHA TOKEN GENERATOR ============
class Alt {
    constructor() {
        this.core_count = Math.min(16, navigator.hardwareConcurrency || 4);
        this.token_encode = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2xldCBlPW5ldyBUZXh0RW5jb2Rlcjthc3luYyBmdW5jdGlvbiB0KHQsbixyKXt2YXIgbDtyZXR1cm4gbD1hd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChyLnRvVXBwZXJDYXNlKCksZS5lbmNvZGUodCtuKSksWy4uLm5ldyBVaW50OEFycmF5KGwpXS5tYXAoZT0+ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwiMCIpKS5qb2luKCIiKX1mdW5jdGlvbiBuKGUsdD0xMil7bGV0IG49bmV3IFVpbnQ4QXJyYXkodCk7Zm9yKGxldCByPTA7cjx0O3IrKyluW3JdPWUlMjU2LGU9TWF0aC5mbG9vcihlLzI1Nik7cmV0dXJuIG59YXN5bmMgZnVuY3Rpb24gcih0LHI9IiIsbD0xZTYsbz0wKXtsZXQgYT0iQUVTLUdDTSIsYz1uZXcgQWJvcnRDb250cm9sbGVyLGk9RGF0ZS5ub3coKSx1PShhc3luYygpPT57Zm9yKGxldCBlPW87ZTw9bCYmIWMuc2lnbmFsLmFib3J0ZWQmJnMmJnM7ZSsrKXRyeXtsZXQgdD1hd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoe25hbWU6YSxpdjpuKGUpfSxzLHcpO2lmKHQpcmV0dXJue2NsZWFyVGV4dDpuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUodCksdG9vazpEYXRlLm5vdygpLWl9fWNhdGNoe31yZXR1cm4gbnVsbH0pKCkscz1udWxsLHc9bnVsbDt0cnl7dz1mdW5jdGlvbiBlKHQpe2xldCBuPWF0b2IodCkscj1uZXcgVWludDhBcnJheShuLmxlbmd0aCk7Zm9yKGxldCBsPTA7bDxuLmxlbmd0aDtsKyspcltsXT1uLmNoYXJDb2RlQXQobCk7cmV0dXJuIHJ9KHQpO2xldCBmPWF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCJTSEEtMjU2IixlLmVuY29kZShyKSk7cz1hd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgicmF3IixmLGEsITEsWyJkZWNyeXB0Il0pfWNhdGNoe3JldHVybntwcm9taXNlOlByb21pc2UucmVqZWN0KCksY29udHJvbGxlcjpjfX1yZXR1cm57cHJvbWlzZTp1LGNvbnRyb2xsZXI6Y319bGV0IGw7b25tZXNzYWdlPWFzeW5jIGU9PntsZXR7dHlwZTpuLHBheWxvYWQ6byxzdGFydDphLG1heDpjfT1lLmRhdGEsaT1udWxsO2lmKCJhYm9ydCI9PT1uKWwmJmwuYWJvcnQoKSxsPXZvaWQgMDtlbHNlIGlmKCJ3b3JrIj09PW4pe2lmKCJvYmZ1c2NhdGVkImluIG8pe2xldHtrZXk6dSxvYmZ1c2NhdGVkOnN9PW98fHt9O2k9YXdhaXQgcihzLHUsYyxhKX1lbHNle2xldHthbGdvcml0aG06dyxjaGFsbGVuZ2U6ZixzYWx0OmR9PW98fHt9O2k9ZnVuY3Rpb24gZShuLHIsbD0iU0hBLTI1NiIsbz0xZTYsYT0wKXtsZXQgYz1uZXcgQWJvcnRDb250cm9sbGVyLGk9RGF0ZS5ub3coKSx1PShhc3luYygpPT57Zm9yKGxldCBlPWE7ZTw9byYmIWMuc2lnbmFsLmFib3J0ZWQ7ZSsrKXtsZXQgdT1hd2FpdCB0KHIsZSxsKTtpZih1PT09bilyZXR1cm57bnVtYmVyOmUsdG9vazpEYXRlLm5vdygpLWl9fXJldHVybiBudWxsfSkoKTtyZXR1cm57cHJvbWlzZTp1LGNvbnRyb2xsZXI6Y319KGYsZCx3LGMsYSl9bD1pLmNvbnRyb2xsZXIsaS5wcm9taXNlLnRoZW4oZT0+e3NlbGYucG9zdE1lc3NhZ2UoZSYmey4uLmUsd29ya2VyOiEwfSl9KX19fSgpOw==";
        this.toBytes = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        this.workerBlob = new Blob([this.toBytes(this.token_encode)], { type: "text/javascript;charset=utf-8" });
    }
    static createPayload(Data, Date_) {
        return btoa(JSON.stringify({ algorithm: Data.algorithm, challenge: Data.challenge, number: Date_.number, salt: Data.salt, signature: Data.signature, took: Date_.took }));
    }
    createWorker() {
        try { let url = URL.createObjectURL(this.workerBlob); return new Worker(url); }
        catch { return new Worker("data:text/javascript;base64," + this.token_encode); }
    }
    async getChallenge() { return (await fetch("https://api.moomoo.io/verify")).json(); }
    async getWorkerSolution(task, total, count = Math.ceil(this.core_count)) {
        let workers = [], chunk = Math.ceil(total / Math.min(16, Math.max(1, count)));
        for (let i = 0; i < count; i++) workers.push(this.createWorker());
        let result = await Promise.all(workers.map((w, i) => new Promise(r => {
            w.onmessage = m => { if (m.data) workers.forEach(x => x !== w && x.postMessage({ type: "abort" })); r(m.data); };
            w.postMessage({ type: "work", payload: task, max: i * chunk + chunk, start: i * chunk });
        })));
        workers.forEach(w => w.terminate());
        return result.find(r => !!r);
    }
    async generate() {
        const data = await this.getChallenge();
        const { solution } = await this.validateChallenge(data);
        return `alt:${Alt.createPayload(data, solution)}`;
    }
    async validateChallenge(data) {
        const solution = await this.getWorkerSolution(data, data.maxnumber);
        if (solution?.number !== undefined) return { challengeData: data, solution };
    }
}
const altcha = new Alt();


// Build spawn order: 1 direct + 2 per proxy
const buildSpawnOrder = () => {
    const order = [{ type: 'direct', proxy: null }];
    for (const proxy of PROXY_LIST) {
        order.push({ type: 'proxy', proxy });
        order.push({ type: 'proxy', proxy });
    }
    return order;
};
const SPAWN_ORDER = buildSpawnOrder();

// ============ BOT COMMANDS ============
// Find next available connection slot
const getNextAvailableSlot = () => {
    // First check direct connection
    if (!window.directUsed) {
        return { type: 'direct', proxy: null };
    }
    // Then check proxies (max 2 per proxy)
    for (const proxy of PROXY_LIST) {
        if ((window.proxyUsage[proxy] || 0) < 2) {
            return { type: 'proxy', proxy };
        }
    }
    return null; // No slots available
};

// Count total available slots
const countAvailableSlots = () => {
    let slots = window.directUsed ? 0 : 1;
    for (const proxy of PROXY_LIST) {
        slots += 2 - (window.proxyUsage[proxy] || 0);
    }
    return slots;
};

window.spawnBots = async count => {
    if (!document.ws) return console.error('[MultiBox] Not in game');
    const urlBase = document.ws.url.split("token=")[0];
    
    const availableSlots = countAvailableSlots();
    const canSpawn = Math.min(count, availableSlots);
    if (canSpawn <= 0) {
        console.log('[MultiBox] No available proxy slots!');
        return;
    }
    
    const BATCH_SIZE = 5;
    let totalSpawned = 0;
    let remaining = canSpawn;
    
    console.log(`[MultiBox] Spawning ${canSpawn} bots in batches of ${BATCH_SIZE}...`);
    window.botsInQueue += canSpawn;
    
    // Pre-generate first batch tokens
    let nextTokens = await Promise.all(
        Array(Math.min(BATCH_SIZE, remaining)).fill().map(() => altcha.generate())
    );
    
    while (remaining > 0) {
        const batchSize = Math.min(BATCH_SIZE, remaining);
        const currentTokens = nextTokens;
        
        // Start generating next batch tokens in background
        const nextBatchSize = Math.min(BATCH_SIZE, remaining - batchSize);
        const nextTokensPromise = nextBatchSize > 0 
            ? Promise.all(Array(nextBatchSize).fill().map(() => altcha.generate()))
            : Promise.resolve([]);
        
        // Spawn current batch instantly
        for (let i = 0; i < batchSize; i++) {
            const slot = getNextAvailableSlot();
            if (!slot) { window.botsInQueue = Math.max(0, window.botsInQueue - 1); continue; }
            
            const token = currentTokens[i];
            if (!token) { window.botsInQueue = Math.max(0, window.botsInQueue - 1); continue; }
            
            const targetUrl = `${urlBase}token=${encodeURIComponent(token)}`;
            
            if (slot.type === 'direct') {
                window.directUsed = true;
                wsType(targetUrl, null);
            } else {
                window.proxyUsage[slot.proxy] = (window.proxyUsage[slot.proxy] || 0) + 1;
                wsType(`${slot.proxy}/?target=${encodeURIComponent(targetUrl)}`, slot.proxy);
            }
            
            totalSpawned++;
            window.botsInQueue = Math.max(0, window.botsInQueue - 1);
        }
        
        remaining -= batchSize;
        
        // Wait for next batch tokens (should be ready by now)
        if (remaining > 0) {
            nextTokens = await nextTokensPromise;
        }
    }
    
    console.log(`[MultiBox] Spawned ${totalSpawned} bots`);
};

window.disconnectAll = () => {
    for (let i in sockets) { sockets[i]?.close(); delete sockets[i]; }
    for (let i in bots) { delete bots[i]; }
    botNum = 0;
    // Reset proxy usage
    window.directUsed = false;
    PROXY_LIST.forEach(proxy => { window.proxyUsage[proxy] = 0; });
    window.sockets = sockets;
    console.log('[MultiBox] All bots disconnected, proxy slots reset');
};

window.clearProxies = async () => {
    const CLEAR_KEY = 'yuta1111x-restart-secret';
    console.log('[MultiBox] Clearing all proxy connections...');
    
    let cleared = 0;
    for (const proxy of PROXY_LIST) {
        const httpUrl = proxy.replace('wss://', 'https://');
        try {
            await fetch(`${httpUrl}/clear?key=${CLEAR_KEY}`, { mode: 'no-cors' });
            cleared++;
            console.log(`[MultiBox] Clear sent to ${proxy.split('//')[1].split('.')[0]}`);
        } catch (e) {
            console.error(`[MultiBox] Failed to clear ${proxy}:`, e.message);
        }
    }
    
    console.log(`[MultiBox] Clear signal sent to ${cleared}/${PROXY_LIST.length} proxies`);
    
    // Disconnect all local bots too
    window.disconnectAll?.();
};

// Alias for backwards compatibility
window.restartProxies = window.clearProxies;

window.botCommand = cmd => {
    // Stop all bots from attacking when switching modes
    const stopAttack = () => {
        for (let i in sockets) {
            if (sockets[i]?.connected) {
                sockets[i].oldSend(new Uint8Array(Array.from(msgpack5.encode(['F', [0]]))));
            }
        }
    };
    
    if (cmd === 'follow') { 
        window.playerFollowerGlobal = true; followingfarm = false; window.botsStay = false; window.botsCursorFollow = false; window.botsSmartFollow = false;
        stopAttack();
    }
    if (cmd === 'stay') { 
        window.botsStay = true; window.playerFollowerGlobal = false; followingfarm = false; window.botsCursorFollow = false; window.botsSmartFollow = false;
        stopAttack();
    }
    if (cmd === 'cursor') {
        window.botsCursorFollow = true; window.playerFollowerGlobal = false; followingfarm = false; window.botsStay = false; window.botsSmartFollow = false;
        stopAttack();
    }
    if (cmd === 'smart') {
        window.botsSmartFollow = true; window.playerFollowerGlobal = false; followingfarm = false; window.botsStay = false; window.botsCursorFollow = false;
        stopAttack();
    }
    if (cmd === 'wood') { followingfarm = true; followingtype = 'wood'; window.botsStay = false; window.botsCursorFollow = false; window.botsSmartFollow = false; }
    if (cmd === 'food') { followingfarm = true; followingtype = 'bush'; window.botsStay = false; window.botsCursorFollow = false; window.botsSmartFollow = false; }
    if (cmd === 'stone') { followingfarm = true; followingtype = 'stone'; window.botsStay = false; window.botsCursorFollow = false; window.botsSmartFollow = false; }
    if (cmd === 'gold') { followingfarm = true; followingtype = 'gold'; window.botsStay = false; window.botsCursorFollow = false; window.botsSmartFollow = false; }
    console.log(`[MultiBox] Command: ${cmd}`);
};

window.botsJoinClan = () => {
    if (!myPlayer.clan) {
        console.log('[MultiBox] You are not in a clan!');
        return;
    }
    // Send join request for all bots
    for (let i in sockets) {
        if (sockets[i]?.connected) {
            sockets[i].oldSend(new Uint8Array(Array.from(msgpack5.encode(['b', [myPlayer.clan, 1]]))));
        }
    }
    console.log(`[MultiBox] All bots requesting to join clan: ${myPlayer.clan}`);
};

window.botsCopyGear = () => {
    if (!myPlayer.hat) {
        console.log('[MultiBox] You have no hat equipped!');
    }
    // Copy hat and accessory from player
    for (let i in sockets) {
        if (sockets[i]?.connected) {
            // Buy and equip hat (packet "c" with hat id)
            if (myPlayer.hat) {
                sockets[i].oldSend(new Uint8Array(Array.from(msgpack5.encode(['c', [1, myPlayer.hat, 0]]))));
            }
            // Buy and equip accessory if exists
            if (myPlayer.acc) {
                sockets[i].oldSend(new Uint8Array(Array.from(msgpack5.encode(['c', [1, myPlayer.acc, 1]]))));
            }
        }
    }
    console.log(`[MultiBox] All bots copying gear - Hat: ${myPlayer.hat}, Acc: ${myPlayer.acc || 'none'}`);
};

window.botsCopyWeapon = () => {
    // Equip same weapon as player (primary weapon)
    for (let i in sockets) {
        if (sockets[i]?.connected) {
            // Switch to primary weapon
            sockets[i].oldSend(new Uint8Array(Array.from(msgpack5.encode(['z', [primary, 1]]))));
        }
    }
    console.log(`[MultiBox] All bots equipping weapon: ${primary}`);
};

window.sockets = sockets;

// ============ MAIN MESSAGE HANDLER ============
const handleMessage = e => {
    let temp = msgpack5.decode(new Uint8Array(e.data));
    let data = temp.length > 1 ? [temp[0], ...temp[1]] : temp;
    if (!data) return;
    const item = data[0];

    if (item === "io-init") {
        const ts = getEl('touch-controls-fullscreen');
        width = ts.clientWidth; height = ts.clientHeight;
        window.addEventListener('resize', () => { width = ts.clientWidth; height = ts.clientHeight; });

        ts.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            dir = Math.atan2(e.clientY - height/2, e.clientX - width/2);
            
            // Calculate cursor position on map (relative to player)
            const cursorMapX = myPlayer.x + (mouseX - width/2);
            const cursorMapY = myPlayer.y + (mouseY - height/2);
            window.cursorMapPos = { x: cursorMapX, y: cursorMapY };
            
            if (!autoaim && Date.now() - LED > 50) {
                LED = Date.now();
                // Always send direction for main player
                doNewSend(["D", [dir]]);
                // AutoAim - bots always look at nearest enemy
                if (window.botsAutoAim && nearestEnemy) {
                    for (let id in sockets) {
                        const bot = bots[id];
                        if (bot && sockets[id]?.connected) {
                            const enemyX = nearestEnemy[1];
                            const enemyY = nearestEnemy[2];
                            const botDir = Math.atan2(enemyY - bot.y, enemyX - bot.x);
                            sockets[id].oldSend(new Uint8Array(Array.from(msgpack5.encode(["D", [botDir]]))));
                        }
                    }
                }
                // Send to bots if copy direction is ON - bots look AT cursor position
                else if (window.botsCopyDir && !followingfarm) {
                    for (let id in sockets) {
                        const bot = bots[id];
                        if (bot && sockets[id]?.connected) {
                            // Calculate angle from bot position to cursor position
                            const botDir = Math.atan2(cursorMapY - bot.y, cursorMapX - bot.x);
                            sockets[id].oldSend(new Uint8Array(Array.from(msgpack5.encode(["D", [botDir]]))));
                        }
                    }
                }
            }
        });



        let lastKey = null;
        document.addEventListener('keydown', e => {
            if (lastKey === e.keyCode) return; lastKey = e.keyCode;
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            if (e.keyCode === 82 && !e.repeat) { // R
                autoaim = true;
                doNewSend(["D", [nearestEnemyAngle]]);
                doNewSend(["K", [1]]); doNewSend(["z", [15, 1]]);
                setTimeout(() => { autoaim = false; doNewSend(["K", [1]]); }, 130);
            }
            if (e.keyCode === 70 && !e.repeat) sendForAll(["z", [boostType]]);
            if (e.keyCode === 86 && !e.repeat) sendForAll(["z", [spikeType]]);
        });
        document.addEventListener('keyup', () => { lastKey = null; });

        primary = 0; foodType = 0; wallType = 3; spikeType = 6; millType = 10;
        doNewSend(['M', [{name: localStorage.moo_name, moofoll: "1", skin: 4}]]);
    }

    if (item === "C" && !myPlayer.id) myPlayer.id = data[1];
    if (item === "D") playerss.push({ sid: data[1][1], name: data[1][2] });
    if (item === "E") { 
        const idx = playerss.findIndex(p => p.sid === data[1]); 
        if (idx !== -1) playerss.splice(idx, 1); 
    }

    if (item === "H") {
        for (let i = 0; i < data[1].length / 8; i++) {
            const o = data[1].slice(8*i, 8*i+8);
            // o = [sid, x, y, dir, scale, type, ownerSid, data]
            const obj = {
                sid: o[0],
                x: o[1],
                y: o[2],
                dir: o[3],
                scale: o[4] || 50,
                type: o[5],
                owner: o[6],
                data: o[7],
                dead: false
            };
            
            // Store in gameObjects for pathfinding (player-placed objects) - limit to 100
            if (o[6] != null) {
                const idx = window.gameObjects.findIndex(g => g.sid === obj.sid);
                if (idx !== -1) window.gameObjects[idx] = obj;
                else if (window.gameObjects.length < 100) window.gameObjects.push(obj);
            }
            
            // Natural resources
            if (o[6] == null) {
                const p = { x: o[1], y: o[2] };
                if (o[5] === 0) treeList.push(p);
                else if (o[5] === 1) bushList.push(p);
                else if (o[5] === 2) stoneList.push(p);
                else if (o[5] === 3) goldList.push(p);
            }
        }
    }
    
    // Handle object removal (packet "K" = sid)
    if (item === "K") {
        const sid = data[1];
        const idx = window.gameObjects.findIndex(g => g.sid === sid);
        if (idx !== -1) {
            window.gameObjects[idx].dead = true;
            window.gameObjects.splice(idx, 1);
        }
    }
    
    // Handle wiggle/damage (packet "L" = sid) - object being hit
    if (item === "L") {
        // Object is being damaged, could track health here
    }

    if (item === "P") {
        primary = 0; foodType = 0; wallType = 3; spikeType = 6; millType = 10;
        if (!autoAttack && !freeze) doNewSend(['M', [{name: localStorage.moo_name, moofoll: "1", skin: 4}]]);
        const h = setInterval(() => { if (getEl('mainMenu').style.display === "block") { clearInterval(h); getEl('mainMenu').style.display = "none"; } });
    }

    if (item === "a") {
        enemiesNear = []; players = {};
        for (let i = 0; i < data[1].length / 13; i++) {
            const info = data[1].slice(13*i, 13*i+13);
            if (info[0] === myPlayer.id) Object.assign(myPlayer, { x: info[1], y: info[2], dir: info[3], clan: info[7], hat: info[9], acc: info[10] });
            else if (info[7] !== myPlayer.clan || info[7] === null) enemiesNear.push(info);
            players[info[0]] = { id: info[0], x: info[1], y: info[2], clan: info[7] };
        }
        if (enemiesNear.length) {
            nearestEnemy = enemiesNear.sort((a, b) => dist(a, myPlayer) - dist(b, myPlayer))[0];
            if (nearestEnemy) nearestEnemyAngle = Math.atan2(nearestEnemy[2] - myPlayer.y, nearestEnemy[1] - myPlayer.x);
        }
        if (pointer) pointingOnPosition = { x: myPlayer.x, y: myPlayer.y };
    }

    if (item === "V") {
        if (data[2]) { primary = data[1][0]; secondary = data[1][1] || null; }
        else for (const v of data[1]) {
            if (v < 3) foodType = v; else if (v < 6) wallType = v;
            else if (v < 10) spikeType = v; else if (v < 13) millType = v;
            else if (v < 17) boostType = v; else if (v < 23 && v !== 20) turretType = v;
        }
    }
    
    // Reset age on death/respawn
    if (item === "P") {
        window.playerAge = 1;
        window.playerHealth = 100;
        console.log(`[MultiBox] Player respawned, age reset to 1`);
    }
    
    // Handle health update (packet "O" = [sid, health])
    if (item === "O") {
        const sid = data[1];
        const newHealth = data[2];
        
        // Check if this is our player
        if (sid === myPlayer.id) {
            const oldHealth = window.playerHealth;
            window.playerHealth = newHealth;
            
            // Auto heal if damaged
            if (newHealth < oldHealth && newHealth < 100) {
                autoHealPlayer();
            }
        }
    }
    
    // Handle upgrade available for PLAYER (packet "U" = [upgradePoints, age])
    if (item === "U") {
        const upgradePoints = data[1];
        const upgradeAge = data[2];
        
        // Store current upgrade age
        window.playerUpgradeAge = upgradeAge;
        window.playerUpgradePoints = upgradePoints;
        
        console.log(`[MultiBox] Player upgrade available - Points: ${upgradePoints}, Age: ${upgradeAge}`);
        
        // Auto select upgrade if skipUpgrade is enabled and we have points (like script.js)
        if (window.skipUpgrade && upgradePoints > 0) {
            // Check if we have recorded upgrade for this age
            if (window.recordedUpgrades[upgradeAge] !== undefined) {
                setTimeout(() => autoSelectUpgrade(window.recordedUpgrades[upgradeAge]), 100);
            } else {
                // Default upgrades like script.js: age 3 = 17 (Cookie), age 5 = 23
                if (upgradeAge === 3) {
                    setTimeout(() => autoSelectUpgrade(17), 100); // Cookie
                } else if (upgradeAge === 5) {
                    setTimeout(() => autoSelectUpgrade(23), 100);
                }
            }
        }
    }
};


// ============ WEBSOCKET HOOK (compatible with other scripts) ============
if (!WebSocket.prototype.oldSend) {
    WebSocket.prototype.oldSend = WebSocket.prototype.send;
}
const _originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(m) {
    // Call previous hook if exists (for compatibility)
    if (_originalSend !== WebSocket.prototype.oldSend) {
        _originalSend.call(this, m);
    }
    
    if (!ws) {
        ws = this; document.ws = this;
        this.addEventListener('message', handleMessage);
        this.addEventListener('close', () => { closed = true; });
    }
    if (closed) return;
    
    try {
        const decoded = msgpack5.decode(m), type = decoded[0];
        if (!["D", "F", "9", "6", "H", "z", "c", "K"].includes(type)) this.oldSend(m);
        if (type === "F" || type === "z") sendForAll(decoded);
        if (type === "H") {
            // Record upgrade choice using age from last "U" packet
            const age = window.playerUpgradeAge || 2;
            const upgradeId = decoded[1]?.[0];
            console.log(`[MultiBox] Upgrade selected - Age: ${age}, UpgradeID: ${upgradeId}`);
            if (upgradeId !== undefined && age >= 2 && age <= 9) {
                window.recordedUpgrades[age] = upgradeId;
                console.log(`[MultiBox] RECORDED age ${age} -> upgrade ${upgradeId}`);
                window.updateRecordedDisplay?.();
                
                // Send upgrade to all bots waiting for this age
                if (window.botsAutoUpgrade) {
                    for (let id in sockets) {
                        const botWs = sockets[id];
                        const bot = bots[id];
                        if (botWs?.connected && bot?.pendingAge === age) {
                            botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(['H', [upgradeId]]))));
                            console.log(`[MultiBox] Sent age ${age} upgrade to waiting bot`);
                        }
                    }
                }
            }
            this.oldSend(m);
        }
        if (type === "c") sendForAll(decoded, true);
        if (type === "K") {
            if (decoded[1][0] === 1) autoAttack = !autoAttack;
            if (decoded[1][0] === 0) freeze = !freeze;
            sendForAll(decoded, true);
        }
        if (type === "6") {
            this.oldSend(m);
            for (let i in sockets) sockets[i]?.oldSend(m);
        }
        if (type === "9") {
            this.oldSend(m);
            // Copy movement if enabled
            if (window.botsCopyMove && !window.botsStay && !followingfarm) {
                for (let i in sockets) sockets[i]?.oldSend(m);
            }
        }
    } catch(e) {
        // If decode fails, just send normally (other script's data)
        this.oldSend(m);
    }
};

// ============ BOT WEBSOCKET ============
let botNum = 0;
function wsType(url, proxyUrl) {
    const myBotNum = ++botNum;
    const isProxy = proxyUrl !== null;
    const proxyName = isProxy ? proxyUrl.split('//')[1].split('.')[0] : 'DIRECT';
    const botWs = new WebSocket(url);
    botWs.binaryType = "arraybuffer";
    botWs.playerFollower = true;
    botWs.connected = false;
    botWs.proxyUrl = proxyUrl; // Store proxy URL for disconnect tracking
    let bot = {};
    
    botWs.onerror = (e) => {
        console.error(`[Bot ${myBotNum}] ${proxyName} - CONNECTION ERROR`);
        // Mark slot as released (onclose will handle actual release)
        // This prevents double release since onerror is usually followed by onclose
    };
    
    const send = e => botWs.connected && botWs.oldSend(new Uint8Array(Array.from(msgpack5.encode(e))));
    
    botWs.onmessage = e => {
        let temp = msgpack5.decode(new Uint8Array(e.data));
        let data = temp.length > 1 ? [temp[0], ...temp[1]] : temp;
        if (!data) return;
        const item = data[0];
        
        if (item === "io-init") {
            botWs.connected = true;
            botWs.primary = 0; botWs.foodType = 0; botWs.spikeType = 6; botWs.millType = 10;
            send(['M', [{name: localStorage.moo_name, moofoll: "bot", skin: 4}]]);
        }
        
        if (item === "C" && !bot.id) {
            bot.id = data[1];
            sockets[data[1]] = botWs;
            bots[data[1]] = bot;
        }
        
        if (item === "P") {
            botWs.primary = 0; botWs.foodType = 0; botWs.spikeType = 6; botWs.millType = 10;
            if (!autoAttack && !freeze) send(['M', [{name: localStorage.moo_name, moofoll: "bot", skin: 4}]]);
        }
        
        if (item === "a") {
            botWs.enemiesNear = [];
            for (let i = 0; i < data[1].length / 13; i++) {
                const info = data[1].slice(13*i, 13*i+13);
                if (info[0] === bot.id) Object.assign(bot, { x: info[1], y: info[2], dir: info[3], weapon: info[5], clan: info[7] });
                else if (info[7] !== bot.clan || info[7] === null) botWs.enemiesNear.push(info);
            }
            bots[bot.id] = bot;
            
            // Stay mode - bots don't move
            if (window.botsStay) {
                send(['9', []]);
            }
            // Cursor follow mode - bots follow cursor position
            else if (window.botsCursorFollow && window.cursorMapPos) {
                const cursorX = window.cursorMapPos.x;
                const cursorY = window.cursorMapPos.y;
                const d = Math.hypot(bot.x - cursorX, bot.y - cursorY);
                if (d < 30) send(['9', []]); // Stop when very close to cursor
                else send(['9', [Math.atan2(cursorY - bot.y, cursorX - bot.x)]]);
            }
            // Smart follow mode - simple obstacle avoidance (optimized)
            else if (window.botsSmartFollow && pointingOnPosition.x !== undefined) {
                const targetX = pointingOnPosition.x;
                const targetY = pointingOnPosition.y;
                const distToTarget = Math.hypot(bot.x - targetX, bot.y - targetY);
                
                if (distToTarget < 80) {
                    send(['9', []]);
                } else {
                    // Simple direct movement - no heavy pathfinding
                    const directAngle = Math.atan2(targetY - bot.y, targetX - bot.x);
                    
                    // Quick check for nearby blocking objects (only player objects, limit 20)
                    let blocked = null;
                    const nearbyObjs = window.gameObjects.slice(0, 50);
                    for (const obj of nearbyObjs) {
                        if (!obj) continue;
                        const checkX = bot.x + Math.cos(directAngle) * 60;
                        const checkY = bot.y + Math.sin(directAngle) * 60;
                        const dist = Math.hypot(checkX - obj.x, checkY - obj.y);
                        if (dist < (obj.scale || 50) + 40) {
                            blocked = obj;
                            break;
                        }
                    }
                    
                    if (blocked) {
                        // Attack blocking object
                        const attackAngle = Math.atan2(blocked.y - bot.y, blocked.x - bot.x);
                        send(['D', [attackAngle]]);
                        send(['9', [attackAngle]]);
                        send(['F', [1, attackAngle]]);
                        botWs.smartAttacking = true;
                    } else {
                        if (botWs.smartAttacking) {
                            send(['F', [0]]);
                            botWs.smartAttacking = false;
                        }
                        send(['9', [directAngle]]);
                    }
                }
            }
            // Copy move mode - movement handled by WebSocket hook
            else if (window.botsCopyMove) {
                // Do nothing, movement is copied from player
            }
            // Follow mode
            else if ((botWs.playerFollower || window.playerFollowerGlobal) && !followingfarm) {
                const d = Math.hypot(bot.x - pointingOnPosition.x, bot.y - pointingOnPosition.y);
                if (d < 100) send(['9', []]);
                else send(['9', [Math.atan2(pointingOnPosition.y - bot.y, pointingOnPosition.x - bot.x)]]);
            }
            
            // Farm mode
            if (followingfarm && followingtype) {
                let list, range;
                if (followingtype === "wood") { list = treeList; range = 165; }
                else if (followingtype === "bush") { list = bushList; range = 100; }
                else if (followingtype === "stone") { list = stoneList; range = 140; }
                else if (followingtype === "gold") { list = goldList; range = 140; }
                if (list?.length) {
                    const t = list.sort((a, b) => Math.hypot(a.x - myPlayer.x, a.y - myPlayer.y) - Math.hypot(b.x - myPlayer.x, b.y - myPlayer.y))[0];
                    const d = Math.hypot(t.x - bot.x, t.y - bot.y);
                    const ang = Math.atan2(t.y - bot.y, t.x - bot.x);
                    send(["D", [ang]]);
                    if (d < range) { send(["9", []]); send(["F", [1, ang]]); }
                    else { send(["9", [ang]]); send(["F", [0]]); }
                }
            }
        }
        
        if (item === "V") {
            if (data[2]) { botWs.primary = data[1][0]; botWs.secondary = data[1][1]; }
            else for (const v of data[1]) {
                if (v < 3) botWs.foodType = v; else if (v < 10) botWs.spikeType = v;
                else if (v < 13) botWs.millType = v; else if (v < 17) botWs.boostType = v;
            }
        }
        
        // Handle health update for bot (packet "O" = [sid, health])
        if (item === "O") {
            const sid = data[1];
            const newHealth = data[2];
            
            if (sid === bot.id) {
                const oldHealth = bot.health || 100;
                bot.health = newHealth;
                
                // Auto heal if damaged
                if (newHealth < oldHealth && newHealth < 100 && window.autoHealBots) {
                    autoHealBot(botWs, newHealth, botWs.foodType || 0, bot.dir || 0);
                }
            }
        }
        
        if (item === "g" && data[1].owner === myPlayer.id) setTimeout(() => send(['b', [data[1].sid]]), 100);
        
        // Handle age upgrade - "U" packet = [upgradePoints, age] (only if auto upgrade is ON)
        if (item === "U" && window.botsAutoUpgrade) {
            const upgradePoints = data[1];
            const serverAge = data[2];
            
            // Only process if we have upgrade points
            if (upgradePoints <= 0) return;
            
            // Age 1 - auto select tool hammer (id 0) to progress
            if (serverAge === 1) {
                setTimeout(() => send(['H', [0]]), 100);
                return;
            }
            
            bot.pendingAge = serverAge; // Store pending upgrade age
            
            // Try to use recorded upgrade if available
            if (window.recordedUpgrades[serverAge] !== undefined) {
                const upgradeId = window.recordedUpgrades[serverAge];
                setTimeout(() => {
                    send(['H', [upgradeId]]);
                    console.log(`[Bot ${myBotNum}] Age ${serverAge} - using recorded upgrade ${upgradeId}`);
                }, 100);
            } else {
                // Default upgrades like script.js: age 3 = 17 (Cookie), age 5 = 23
                if (serverAge === 3) {
                    setTimeout(() => send(['H', [17]]), 100);
                    console.log(`[Bot ${myBotNum}] Age 3 - default Cookie (17)`);
                } else if (serverAge === 5) {
                    setTimeout(() => send(['H', [23]]), 100);
                    console.log(`[Bot ${myBotNum}] Age 5 - default (23)`);
                } else {
                    console.log(`[Bot ${myBotNum}] Age ${serverAge} - waiting for player to record upgrade...`);
                }
            }
        }
        
        // Reset bot age on death/respawn
        if (item === "P") {
            bot.currentAge = 1;
        }
    };
    
    botWs.onclose = (e) => {
        console.log(`[Bot ${myBotNum}] ${proxyName} - DISCONNECTED (code: ${e.code})`);
        
        // Clean up sockets and bots
        if (bot.id) {
            delete sockets[bot.id];
            delete bots[bot.id];
        }
        botWs.connected = false;
        
        // Release proxy slot on disconnect (only if not already released)
        if (!botWs.slotReleased) {
            botWs.slotReleased = true;
            if (isProxy && proxyUrl) {
                window.proxyUsage[proxyUrl] = Math.max(0, (window.proxyUsage[proxyUrl] || 1) - 1);
                console.log(`[MultiBox] Released slot on ${proxyName} (${window.proxyUsage[proxyUrl]}/2)`);
            } else if (!isProxy) {
                window.directUsed = false;
                console.log(`[MultiBox] Released DIRECT slot`);
            }
        }
        
        // Update global sockets reference
        window.sockets = sockets;
    };
}
