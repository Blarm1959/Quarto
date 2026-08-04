(function () {
  "use strict";

  function loadSettings(defaults) {
    return {
      ...defaults,
      playerNames: Array.isArray(defaults.playerNames) ? [...defaults.playerNames] : defaults.playerNames
    };
  }

  function saveSettings() {
    // Game setup settings are intentionally retained only for the current page session.
  }

  window.QuartoStorage = { loadSettings, saveSettings };
})();
