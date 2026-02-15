const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const CSS = fs.readFileSync(path.join(__dirname, "build/styles.css"), "utf8");

// Icon SVG data (from icon-data.js)
const ICONS = {
  moon: {
    viewBox: "0 0 512 512",
    secondary:
      "M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z",
    primary:
      "M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z",
  },
  mug: {
    viewBox: "0 0 512 512",
    secondary:
      "M139.3 67.3a94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 96.8 0H80.4a16.31 16.31 0 0 0-16.3 18 145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18a130.72 130.72 0 0 0-36.6-74.7zM287.9 142a130.72 130.72 0 0 0-36.6-74.7 94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18a145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18z",
    primary:
      "M400 192H32a32 32 0 0 0-32 32v192a96 96 0 0 0 96 96h192a96 96 0 0 0 96-96h16a112 112 0 0 0 0-224zm0 160h-16v-96h16a48 48 0 0 1 0 96z",
  },
  sun: {
    viewBox: "0 0 512 512",
    secondary:
      "M502.42 240.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.41-94.8a17.31 17.31 0 0 0-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4a17.31 17.31 0 0 0 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.41-33.5 47.3 94.7a17.31 17.31 0 0 0 31 0l47.31-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3a17.33 17.33 0 0 0 .2-31.1zm-155.9 106c-49.91 49.9-131.11 49.9-181 0a128.13 128.13 0 0 1 0-181c49.9-49.9 131.1-49.9 181 0a128.13 128.13 0 0 1 0 181z",
    primary: "M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z",
  },
  couch: {
    viewBox: "0 0 640 512",
    secondary:
      "M96 160H64a96 96 0 0 1 96-96h320a96 96 0 0 1 96 96h-32a64.06 64.06 0 0 0-64 64v64H160v-64a64.06 64.06 0 0 0-64-64z",
    primary:
      "M640 256a63.84 63.84 0 0 1-32 55.1V432a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16v-16H128v16a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V311.1A63.79 63.79 0 0 1 64 192h32a32 32 0 0 1 32 32v96h384v-96a32 32 0 0 1 32-32h32a64.06 64.06 0 0 1 64 64z",
  },
  backpack: {
    viewBox: "0 0 448 512",
    secondary:
      "M320 320H128a32 32 0 0 0-32 32v32h256v-32a32 32 0 0 0-32-32zM136 208h176a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H136a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8z",
    primary:
      "M96 512h256v-96H96zM320 80h-8V56a56.06 56.06 0 0 0-56-56h-64a56.06 56.06 0 0 0-56 56v24h-8A128 128 0 0 0 0 208v240a64 64 0 0 0 64 64V352a64.07 64.07 0 0 1 64-64h192a64.07 64.07 0 0 1 64 64v160a64 64 0 0 0 64-64V208A128 128 0 0 0 320 80zM184 56a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v24h-80zm136 144a8 8 0 0 1-8 8H136a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8z",
  },
  mailbox: {
    viewBox: "0 0 576 512",
    secondary:
      "M432 64H144a144 144 0 0 1 144 144v208a32 32 0 0 1-32 32h288a32 32 0 0 0 32-32V208A144 144 0 0 0 432 64zm80 208a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16v-48h-56a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h104a16 16 0 0 1 16 16z",
    primary:
      "M143.93 64C64.2 64 0 129.65 0 209.38V416a32 32 0 0 0 32 32h224a32 32 0 0 0 32-32V208A144 144 0 0 0 143.93 64zM224 240a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16zm272-48H392a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h56v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16z",
  },
  beach: {
    viewBox: "0 0 448 512",
    secondary:
      "M284.91 358.8a144 144 0 0 0-43.71-6.8h-45.07c10-42.85 25-122.77 21-202.33L238.89 128h27.39c11.16 48 28.58 142.41 18.63 230.8z",
    primary:
      "M241.2 352h-98.4A144 144 0 0 0 .36 474.78C-2.53 494.3 12.39 512 32.12 512h319.76c19.73 0 34.65-17.7 31.76-37.22A144 144 0 0 0 241.2 352zm206.62-238.36C439.69 67.43 393 32 336.53 32c-34.88 0-65.66 13.82-86.3 35.08C235.78 28.29 193.72 0 143.47 0 87 0 40.31 35.43 32.18 81.64a12.37 12.37 0 0 0 10.24 14.2 12.24 12.24 0 0 0 2.18.16H80l16-32 16 32h30.17c-34.21 35-39.62 86.88-14.54 122.58 4.36 6.2 13.14 7.31 18.5 1.95L238.89 128H368l16-32 16 32h35.4a12.38 12.38 0 0 0 12.6-12.18 12.24 12.24 0 0 0-.18-2.18z",
  },
  repeat: {
    viewBox: "0 0 512 512",
    secondary:
      "M422.66 422.66a12 12 0 0 1 0 17l-.49.46A247.11 247.11 0 0 1 256 504C119 504 8 393 8 256 8 119.19 119.65 7.76 256.46 8a247.12 247.12 0 0 1 170.85 68.69l-56.62 56.56A166.73 166.73 0 0 0 257.49 88C165.09 87.21 87.21 162 88 257.45 88.76 348 162.18 424 256 424a166.77 166.77 0 0 0 110.63-41.56A12 12 0 0 1 383 383z",
    primary:
      "M504 57.94V192a24 24 0 0 1-24 24H345.94c-21.38 0-32.09-25.85-17-41L463 41c15.15-15.15 41-4.44 41 16.94z",
  },
  calendar: {
    viewBox: "0 0 448 512",
    secondary:
      "M0 192v272a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V192zm192 176a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-96a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16zm112-240h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16zm-192 0h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16z",
    primary:
      "M448 112v80H0v-80a48 48 0 0 1 48-48h48v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h128v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h48a48 48 0 0 1 48 48z",
  },
  setting: {
    viewBox: "0 0 512 512",
    secondary:
      "M487.75 315.6l-42.6-24.6a192.62 192.62 0 0 0 0-70.2l42.6-24.6a12.11 12.11 0 0 0 5.5-14 249.2 249.2 0 0 0-54.7-94.6 12 12 0 0 0-14.8-2.3l-42.6 24.6a188.83 188.83 0 0 0-60.8-35.1V25.7A12 12 0 0 0 311 14a251.43 251.43 0 0 0-109.2 0 12 12 0 0 0-9.4 11.7v49.2a194.59 194.59 0 0 0-60.8 35.1L89.05 85.4a11.88 11.88 0 0 0-14.8 2.3 247.66 247.66 0 0 0-54.7 94.6 12 12 0 0 0 5.5 14l42.6 24.6a192.62 192.62 0 0 0 0 70.2l-42.6 24.6a12.08 12.08 0 0 0-5.5 14 249 249 0 0 0 54.7 94.6 12 12 0 0 0 14.8 2.3l42.6-24.6a188.54 188.54 0 0 0 60.8 35.1v49.2a12 12 0 0 0 9.4 11.7 251.43 251.43 0 0 0 109.2 0 12 12 0 0 0 9.4-11.7v-49.2a194.7 194.7 0 0 0 60.8-35.1l42.6 24.6a11.89 11.89 0 0 0 14.8-2.3 247.52 247.52 0 0 0 54.7-94.6 12.36 12.36 0 0 0-5.6-14.1zm-231.4 36.2a95.9 95.9 0 1 1 95.9-95.9 95.89 95.89 0 0 1-95.9 95.9z",
    primary:
      "M256.35 319.8a63.9 63.9 0 1 1 63.9-63.9 63.9 63.9 0 0 1-63.9 63.9z",
  },
};

function icon(name, size = "100%", extraClass = "") {
  const d = ICONS[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" style="width:${size};height:${size}" class="${extraClass}"><path d="${d.secondary}" class="fa-secondary" fill="currentColor"/><path d="${d.primary}" class="fa-primary" fill="currentColor"/></svg>`;
}

function chromeFrame(content, { title = "TabNap", url = "", popupMode = false, width = 1280, height = 800 }) {
  const tabBarHeight = 38;
  const addressBarHeight = 52;
  const totalChromeHeight = tabBarHeight + addressBarHeight;
  const contentHeight = height - totalChromeHeight;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: ${width}px; height: ${height}px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #DEE1E6; }
.chrome-window { width: 100%; height: 100%; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
.tab-bar { height: ${tabBarHeight}px; background: #DEE1E6; display: flex; align-items: flex-end; padding: 0 8px; }
.tab { height: 30px; background: white; border-radius: 8px 8px 0 0; padding: 0 16px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #202124; min-width: 200px; max-width: 240px; }
.tab-icon { width: 14px; height: 14px; flex-shrink: 0; }
.tab-icon img { width: 100%; height: 100%; }
.tab-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tab-close { margin-left: auto; opacity: 0.5; font-size: 14px; }
.tab-inactive { background: transparent; color: #5f6368; }
.address-bar-area { height: ${addressBarHeight}px; background: white; display: flex; align-items: center; padding: 0 16px; gap: 12px; border-bottom: 1px solid #dadce0; }
.nav-buttons { display: flex; gap: 8px; color: #5f6368; }
.nav-btn { width: 20px; height: 20px; }
.url-bar { flex: 1; height: 32px; background: #F1F3F4; border-radius: 16px; display: flex; align-items: center; padding: 0 16px; font-size: 13px; color: #5f6368; }
.url-prefix { color: #5f6368; }
.url-domain { color: #202124; }
.content-area { flex: 1; background: white; overflow: hidden; position: relative; }

${popupMode ? `
.popup-overlay { position: absolute; top: 0; right: 50px; z-index: 100; }
.popup-frame { width: 384px; border-radius: 0 0 8px 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); overflow: hidden; background: white; }
.page-behind { width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
.page-behind-content { text-align: center; color: #9aa0a6; }
` : ""}

:root { --grid-border: #dadce0; --accent: #7c3aed; --accent-hover: #6d28d9; --accent-dark: #a78bfa; --accent-light: #ede9fe; --accent-focus: #ddd6fe; --accent-darkbg: #2e1065; }
.fa-secondary { opacity: 0.5; }
.grid-borders > * { border-right: 1px solid var(--grid-border); border-bottom: 1px solid var(--grid-border); }
.grid-borders > *:nth-child(3n) { border-right: none; }
.grid-borders > *:nth-child(n+7) { border-bottom: none; }
</style>
</head>
<body>
<div class="chrome-window">
  <div class="tab-bar">
    <div class="tab">
      <div class="tab-icon"><div style="width:14px;height:14px;color:#50525A">${icon("moon", "14px")}</div></div>
      <div class="tab-title">${title}</div>
      <div class="tab-close">&times;</div>
    </div>
    <div class="tab tab-inactive" style="min-width:140px">
      <div class="tab-title" style="color:#5f6368">New Tab</div>
    </div>
  </div>
  <div class="address-bar-area">
    <div class="nav-buttons">
      <svg class="nav-btn" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      <svg class="nav-btn" viewBox="0 0 24 24" fill="none" stroke="#bdc1c6" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
      <svg class="nav-btn" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
    </div>
    <div class="url-bar">
      <span class="url-prefix">${url}</span>
    </div>
  </div>
  <div class="content-area">
    ${content}
  </div>
</div>
</body>
</html>`;
}

// Screenshot 1: Popup with 3x3 snooze grid
function popupScreenshot() {
  const buttons = [
    { text: "Later Today", icon: "mug" },
    { text: "Tonight", icon: "moon" },
    { text: "Tomorrow", icon: "sun" },
    { text: "Next Weekend", icon: "couch" },
    { text: "Next Week", icon: "backpack" },
    { text: "In a month", icon: "mailbox" },
    { text: "Someday", icon: "beach" },
    { text: "Repeatedly", icon: "repeat" },
    { text: "Pick a Date", icon: "calendar" },
  ];

  const grid = buttons
    .map(
      (b) => `
    <div class="group flex flex-col justify-center items-center bg-white text-chrome-700 hover:bg-chrome-100 cursor-pointer" style="padding:4px 0">
      <div style="height:64px;width:64px;padding:12px;display:flex;align-items:center;justify-content:center;margin-top:8px">
        ${icon(b.icon)}
      </div>
      <div style="font-size:14px;font-weight:500">${b.text}</div>
    </div>`
    )
    .join("");

  const popup = `
    <div style="width:384px;height:384px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr)" class="grid-borders overflow-hidden">
      ${grid}
    </div>
    <div style="width:384px;font-size:16px;background:white;border-top:1px solid #dadce0;display:flex;align-items:center;color:#5f6368">
      <div style="flex:1;padding:16px">
        <span style="padding:2px 8px;margin-right:8px;background:#7c3aed;color:white;font-size:12px;border-radius:4px">3</span>
        Tabs Napping
      </div>
      <div style="padding:16px">
        <div style="height:20px;width:20px;color:#5f6368">${icon("setting", "20px")}</div>
      </div>
    </div>
  `;

  // Background page content - show some fake tabs as if user is browsing
  const bgTabs = `
    <div style="width:100%;height:100%;background:#f8f9fa;display:flex;flex-direction:column;align-items:center;padding-top:120px;">
      <div style="width:560px;text-align:center;">
        <div style="font-size:72px;color:#dadce0;margin-bottom:24px">
          <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#dadce0" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M21 21l-4.35-4.35M10 7v6l4 2"/></svg>
        </div>
        <div style="width:100%;height:44px;background:white;border-radius:24px;border:1px solid #dadce0;display:flex;align-items:center;padding:0 20px;color:#9aa0a6;font-size:16px;">Search Google or type a URL</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:24px;margin-top:48px;">
          ${["GitHub", "Stack Overflow", "MDN Docs", "Twitter", "YouTube"]
            .map(
              (name) => `
            <div style="text-align:center">
              <div style="width:56px;height:56px;border-radius:12px;background:white;border:1px solid #e8eaed;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#5f6368;font-weight:600;font-size:18px">${name[0]}</div>
              <div style="font-size:12px;color:#5f6368">${name}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  const content = `
    ${bgTabs}
    <div class="popup-overlay">
      <div class="popup-frame">${popup}</div>
    </div>
  `;

  return chromeFrame(content, {
    title: "New Tab",
    url: "chrome-extension://tabnap/popup.html",
    popupMode: true,
  });
}

// Screenshot 2: Tab list with snoozed tabs
function tabListScreenshot() {
  const tabs = [
    { title: "How to Build a Chrome Extension - MDN Web Docs", label: "Later Today", time: "in 2h 30m", url: "developer.mozilla.org", letter: "M", color: "#1A73E8" },
    { title: "React 19 Release Notes - Official Blog", label: "Tonight", time: "in 5h", url: "react.dev", letter: "R", color: "#087ea4" },
    { title: "The Complete Guide to Flexbox - CSS Tricks", label: "Tomorrow", time: "Tomorrow at 9:00 AM", url: "css-tricks.com", letter: "C", color: "#f46b22" },
    { title: "GitHub - anthropics/claude-code", label: "Tomorrow", time: "Tomorrow at 9:00 AM", url: "github.com", letter: "G", color: "#24292e" },
    { title: "Hacker News - Top Stories", label: "Next Weekend", time: "Saturday at 9:00 AM", url: "news.ycombinator.com", letter: "Y", color: "#ff6600" },
    { title: "TypeScript 5.4 Release Announcement", label: "Next Week", time: "Monday at 9:00 AM", url: "devblogs.microsoft.com", letter: "D", color: "#3178c6" },
    { title: "Figma - Design System Templates", label: "In a month", time: "Mar 15 at 9:00 AM", url: "figma.com", letter: "F", color: "#a259ff" },
    { title: "Rust Programming Language Book", label: "Someday", time: "May 15 at 9:00 AM", url: "doc.rust-lang.org", letter: "R", color: "#dea584" },
  ];

  const grouped = {
    "Today": tabs.slice(0, 2),
    "Tomorrow": tabs.slice(2, 4),
    "This Week": tabs.slice(4, 5),
    "Next Week": tabs.slice(5, 6),
    "Later": tabs.slice(6),
  };

  let tabListHTML = "";
  for (const [label, groupTabs] of Object.entries(grouped)) {
    tabListHTML += `
      <div style="font-size:12px;font-weight:600;color:#9aa0a6;text-transform:uppercase;letter-spacing:0.05em;padding:8px 0;margin-top:24px">${label} &middot; ${groupTabs.length} ${groupTabs.length === 1 ? "tab" : "tabs"}</div>
    `;
    for (const tab of groupTabs) {
      tabListHTML += `
        <div style="display:flex;align-items:center;border-bottom:1px solid #dadce0;cursor:pointer;border-radius:4px;padding:16px">
          <div style="width:24px;height:24px;border-radius:4px;background:${tab.color};color:white;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:16px">${tab.letter}</div>
          <div style="flex:1;min-width:0;margin-right:8px">
            <div style="font-weight:500;color:#202124;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${tab.title}</div>
            <div style="display:flex;font-size:14px;color:#9aa0a6;gap:16px">
              <div>${tab.label}</div>
              <div>${tab.time}</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  const content = `
    <div style="width:100%;height:100%;background:#F8F9FA;overflow:hidden">
      <div style="position:fixed;height:56px;width:100%;display:flex;background:white;color:#202124;padding:0 24px;border-bottom:1px solid #dadce0;align-items:center;z-index:10">
        <div style="display:flex;font-size:20px;margin-right:24px;align-items:center">
          <div style="height:32px;width:32px;margin-right:8px;margin-top:-4px;color:#7c3aed">${icon("moon", "32px")}</div>
          TabNap
        </div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid #7c3aed;color:#7c3aed">
          Home
          <span style="margin-left:8px;padding:1px 6px;font-size:12px;background:#7c3aed;color:white;border-radius:9999px">8</span>
        </div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid transparent;color:#5f6368">History</div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid transparent;color:#5f6368">Settings</div>
      </div>
      <div style="padding-top:72px;padding-left:24px;padding-right:24px">
        <h1 style="font-size:18px;font-weight:600;color:#202124;margin-bottom:16px">Snoozed Tabs</h1>
        <input type="text" placeholder="Search snoozed tabs..." style="width:100%;padding:8px 16px;border:1px solid #dadce0;border-radius:6px;font-size:14px;background:white;color:#202124;outline:none;margin-bottom:8px" />
        ${tabListHTML}
      </div>
    </div>
  `;

  return chromeFrame(content, {
    title: "TabNap",
    url: "chrome-extension://tabnap/page.html#list",
  });
}

// Screenshot 3: Settings page
function settingsScreenshot() {
  function settingRow(iconName, text, desc, control) {
    return `
      <div style="display:flex;align-items:center;border-bottom:1px solid #dadce0;padding:16px 0">
        <div style="height:24px;width:24px;margin-right:24px;color:#5f6368">${icon(iconName, "24px")}</div>
        <div style="flex:1">
          <div style="font-size:16px;color:#202124">${text}</div>
          ${desc ? `<div style="font-size:12px;color:#9aa0a6;margin-top:2px">${desc}</div>` : ""}
        </div>
        <div style="width:64px"></div>
        ${control}
      </div>
    `;
  }

  function dropdown(value) {
    return `<div style="margin-left:24px;padding:4px 8px;border-radius:6px;background:white;border:1px solid #dadce0;font-size:14px;color:#202124">${value}</div>`;
  }

  function toggle(on) {
    return `<div style="margin-left:24px;width:40px;height:20px;border-radius:10px;${
      on ? "background:#7c3aed" : "background:#dadce0"
    };display:flex;align-items:center;padding:0 2px"><div style="height:16px;width:16px;border-radius:8px;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.2);${
      on ? "margin-left:20px" : ""
    }"></div></div>`;
  }

  const palettes = [
    { name: "Blue", color: "#1A73E8" },
    { name: "Amber", color: "#B45309" },
    { name: "Emerald", color: "#059669" },
    { name: "Rose", color: "#E11D48" },
    { name: "Violet", color: "#7C3AED", active: true },
    { name: "Teal", color: "#0D9488" },
    { name: "Orange", color: "#EA580C" },
    { name: "Indigo", color: "#4F46E5" },
    { name: "Fuchsia", color: "#A21CAF" },
    { name: "Slate Steel", color: "#475569" },
  ];

  const paletteHTML = palettes
    .map(
      (p) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:9999px;cursor:pointer;border:1px solid ${
      p.active ? "#7c3aed" : "#dadce0"
    };${p.active ? "background:#ede9fe" : ""}">
      <div style="height:16px;width:16px;border-radius:8px;background:${p.color}"></div>
      <span style="font-size:14px;color:#202124">${p.name}</span>
    </div>`
    )
    .join("");

  const content = `
    <div style="width:100%;height:100%;background:#F8F9FA;overflow:hidden">
      <div style="position:fixed;height:56px;width:100%;display:flex;background:white;color:#202124;padding:0 24px;border-bottom:1px solid #dadce0;align-items:center;z-index:10">
        <div style="display:flex;font-size:20px;margin-right:24px;align-items:center">
          <div style="height:32px;width:32px;margin-right:8px;margin-top:-4px;color:#7c3aed">${icon("moon", "32px")}</div>
          TabNap
        </div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid transparent;color:#5f6368">Home</div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid transparent;color:#5f6368">History</div>
        <div style="height:100%;display:flex;font-size:16px;align-items:center;padding:0 16px;cursor:pointer;border-bottom:2px solid #7c3aed;color:#7c3aed">Settings</div>
      </div>
      <div style="padding-top:72px;padding-left:24px;padding-right:24px">
        <div style="font-size:14px;font-weight:600;color:#202124;text-transform:uppercase;letter-spacing:0.05em;margin-top:32px;margin-bottom:12px">Appearance</div>
        ${settingRow("sun", "Theme", "Choose light, dark, or match your system", dropdown("System default"))}
        <div style="display:flex;align-items:center;border-bottom:1px solid #dadce0;padding:16px 0">
          <div style="height:24px;width:24px;margin-right:24px;color:#5f6368"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:24px;height:24px"><path d="M256 0C114.6 0 0 100.3 0 224c0 70.1 36.9 132.6 94.5 173.7 9.6 6.9 15.2 18.1 13.5 29.9l-9.4 66.2c-3.4 23.8 17.7 44.2 41.5 40.1l72.4-12.4c6.3-1.1 12.8-.4 18.7 2 20.1 7.9 41.8 12.4 64.8 12.4 141.4 0 256-100.3 256-224S397.4 0 256 0z" class="fa-secondary" fill="currentColor"/><path d="M144 256a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm80-96a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm112 0a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm80 96a32 32 0 1 1-64 0 32 32 0 0 1 64 0z" class="fa-primary" fill="currentColor"/></svg></div>
          <div style="flex:1">
            <div style="font-size:16px;color:#202124">Accent color</div>
            <div style="font-size:12px;color:#9aa0a6;margin-top:2px">Sets the primary color across the extension</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${paletteHTML}</div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:600;color:#202124;text-transform:uppercase;letter-spacing:0.05em;margin-top:32px;margin-bottom:12px">Snooze Settings</div>
        ${settingRow("mug", "Later Today starts", "How far from now 'Later Today' wakes the tab", dropdown("in 3 hours"))}
        ${settingRow("moon", "Tonight starts at", "", dropdown("7:00 PM"))}
        ${settingRow("sun", "Tomorrow starts at", "", dropdown("9:00 AM"))}
      </div>
    </div>
  `;

  return chromeFrame(content, {
    title: "TabNap - Settings",
    url: "chrome-extension://tabnap/page.html#settings",
  });
}

// Small promo tile (440x280)
function smallPromoTile() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 440px; height: 280px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.fa-secondary { opacity: 0.5; }
</style>
</head>
<body>
<div style="width:440px;height:280px;background:linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;position:relative;overflow:hidden">
  <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;opacity:0.1;color:white">${icon("moon", "120px")}</div>
  <div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;opacity:0.08;color:white">${icon("moon", "80px")}</div>
  <div style="width:64px;height:64px;color:white;margin-bottom:16px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.2))">${icon("moon", "64px")}</div>
  <div style="font-size:32px;font-weight:700;letter-spacing:-0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2)">TabNap</div>
  <div style="font-size:16px;opacity:0.9;margin-top:8px;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Give your tabs a nap, as a treat.</div>
</div>
</body>
</html>`;
}

// Marquee promo tile (1400x560)
function marqueePromoTile() {
  // Snooze button grid (mini version)
  const buttons = [
    { text: "Later Today", icon: "mug" },
    { text: "Tonight", icon: "moon" },
    { text: "Tomorrow", icon: "sun" },
    { text: "Next Weekend", icon: "couch" },
    { text: "Next Week", icon: "backpack" },
    { text: "In a month", icon: "mailbox" },
    { text: "Someday", icon: "beach" },
    { text: "Repeatedly", icon: "repeat" },
    { text: "Pick a Date", icon: "calendar" },
  ];

  const miniGrid = buttons
    .map(
      (b) => `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 4px">
      <div style="width:36px;height:36px;color:#5f6368;margin-bottom:4px">${icon(b.icon, "36px")}</div>
      <div style="font-size:11px;color:#5f6368;font-weight:500;white-space:nowrap">${b.text}</div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1400px; height: 560px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.fa-secondary { opacity: 0.5; }
.grid-borders > * { border-right: 1px solid #dadce0; border-bottom: 1px solid #dadce0; }
.grid-borders > *:nth-child(3n) { border-right: none; }
.grid-borders > *:nth-child(n+7) { border-bottom: none; }
</style>
</head>
<body>
<div style="width:1400px;height:560px;background:linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #312e81 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
  <!-- Background decorations -->
  <div style="position:absolute;top:40px;left:60px;width:160px;height:160px;opacity:0.06;color:white">${icon("moon", "160px")}</div>
  <div style="position:absolute;bottom:30px;right:80px;width:100px;height:100px;opacity:0.05;color:white">${icon("sun", "100px")}</div>
  <div style="position:absolute;top:60px;right:200px;width:60px;height:60px;opacity:0.04;color:white">${icon("mug", "60px")}</div>

  <!-- Left side: Text -->
  <div style="flex:1;padding-left:100px;color:white;z-index:1">
    <div style="width:72px;height:72px;color:white;margin-bottom:24px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3))">${icon("moon", "72px")}</div>
    <div style="font-size:52px;font-weight:800;letter-spacing:-1px;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,0.2)">TabNap</div>
    <div style="font-size:22px;opacity:0.9;margin-top:12px;font-weight:400;text-shadow:0 1px 4px rgba(0,0,0,0.2)">Give your tabs a little nap, as a treat.</div>
    <div style="margin-top:24px;display:flex;gap:16px">
      <div style="font-size:14px;opacity:0.7;display:flex;align-items:center;gap:6px">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.5 4.5l-7 7L3 8"/></svg>
        Free & Open Source
      </div>
      <div style="font-size:14px;opacity:0.7;display:flex;align-items:center;gap:6px">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.5 4.5l-7 7L3 8"/></svg>
        No Data Collected
      </div>
      <div style="font-size:14px;opacity:0.7;display:flex;align-items:center;gap:6px">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.5 4.5l-7 7L3 8"/></svg>
        Works Offline
      </div>
    </div>
  </div>

  <!-- Right side: Popup mockup -->
  <div style="margin-right:100px;z-index:1">
    <div style="background:white;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden">
      <div style="width:300px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr)" class="grid-borders">
        ${miniGrid}
      </div>
      <div style="border-top:1px solid #dadce0;padding:10px 12px;display:flex;align-items:center;font-size:14px;color:#5f6368">
        <span style="padding:1px 6px;margin-right:8px;background:#7c3aed;color:white;font-size:11px;border-radius:4px">3</span>
        Tabs Napping
        <div style="margin-left:auto;width:16px;height:16px;color:#5f6368">${icon("setting", "16px")}</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const outputDir = path.join(__dirname, "store-assets");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const assets = [
    { name: "screenshot-1-popup.png", html: popupScreenshot(), width: 1280, height: 800 },
    { name: "screenshot-2-tab-list.png", html: tabListScreenshot(), width: 1280, height: 800 },
    { name: "screenshot-3-settings.png", html: settingsScreenshot(), width: 1280, height: 800 },
    { name: "small-promo-tile.png", html: smallPromoTile(), width: 440, height: 280 },
    { name: "marquee-promo-tile.png", html: marqueePromoTile(), width: 1400, height: 560 },
  ];

  for (const asset of assets) {
    const page = await browser.newPage();
    await page.setViewport({ width: asset.width, height: asset.height, deviceScaleFactor: 2 });
    await page.setContent(asset.html, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(outputDir, asset.name),
      type: "png",
      clip: { x: 0, y: 0, width: asset.width, height: asset.height },
    });
    await page.close();
    console.log(`Generated ${asset.name} (${asset.width}x${asset.height})`);
  }

  await browser.close();
  console.log(`\nAll assets saved to ${outputDir}/`);
}

main().catch(console.error);
