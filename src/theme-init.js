if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}
chrome.storage.local.get(["settings"]).then(function (result) {
  var theme = result && result.settings && result.settings.theme;
  if (theme === 1) document.documentElement.classList.remove("dark");
  else if (theme === 2) document.documentElement.classList.add("dark");

  var paletteIndex = result && result.settings && result.settings.colorPalette;
  if (paletteIndex != null && typeof COLOR_PALETTES !== "undefined") {
    var palette = COLOR_PALETTES[paletteIndex];
    if (palette) {
      var s = document.documentElement.style;
      s.setProperty("--accent", palette.base);
      s.setProperty("--accent-hover", palette.hover);
      s.setProperty("--accent-dark", palette.dark);
      s.setProperty("--accent-light", palette.light);
      s.setProperty("--accent-focus", palette.focus);
      s.setProperty("--accent-darkbg", palette.darkBg);
    }
  }
});
