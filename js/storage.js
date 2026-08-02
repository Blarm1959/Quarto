(function () {
  "use strict";

  const STORAGE_KEY = "quarto.settings";

  function loadSettings(defaults) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  window.QuartoStorage = { loadSettings, saveSettings };
})();
