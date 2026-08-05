(function () {
  "use strict";

  const configuration = {
    defaultLanguage: "en-GB",
    masterLanguage: "en-GB",
    languages: ["en-GB"]
  };
  const STORAGE_KEY = "quarto.language";
  let language = configuration.defaultLanguage;
  let messages = {};

  function normaliseLanguage(value) {
    if (!value) return null;
    const exact = configuration.languages.find(item => item.toLowerCase() === String(value).toLowerCase());
    if (exact) return exact;
    const base = String(value).split("-")[0].toLowerCase();
    return configuration.languages.find(item => item.split("-")[0].toLowerCase() === base) || null;
  }

  function selectLanguage() {
    const saved = normaliseLanguage(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
    for (const candidate of navigator.languages || [navigator.language]) {
      const supported = normaliseLanguage(candidate);
      if (supported) return supported;
    }
    return configuration.defaultLanguage;
  }

  function format(template, values) {
    return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
  }

  function t(key, values = {}, fallback = key) {
    return format(messages[key] ?? fallback, values);
  }

  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n, {}, element.textContent);
    });
    ["aria-label", "title", "placeholder"].forEach(attribute => {
      root.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        const datasetName = `i18n${attribute.replace(/(^|-)([a-z])/g, (_, dash, letter) => letter.toUpperCase())}`;
        element.setAttribute(attribute, t(element.dataset[datasetName], {}, element.getAttribute(attribute) || ""));
      });
    });
    root.querySelectorAll("[data-i18n-content]").forEach(element => {
      element.setAttribute("content", t(element.dataset.i18nContent, {}, element.getAttribute("content") || ""));
    });
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? "rtl" : "ltr";
  }

  function isRtl(code) {
    return new Set(["ar", "he", "fa", "ur"]).has(String(code).split("-")[0].toLowerCase());
  }

  async function load(nextLanguage) {
    language = normaliseLanguage(nextLanguage) || configuration.defaultLanguage;
    const response = await fetch(`src/i18n/${language}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load language ${language}`);
    messages = await response.json();
    localStorage.setItem(STORAGE_KEY, language);
    apply();
    document.dispatchEvent(new CustomEvent("quarto:language-changed", { detail: { language } }));
    return language;
  }

  const ready = new Promise(resolve => {
    const begin = () => load(selectLanguage()).catch(error => {
      console.warn("Quarto language loading failed", error);
      language = configuration.defaultLanguage;
      apply();
      return language;
    }).then(resolve);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
    else begin();
  });

  window.QuartoI18n = { configuration, ready, t, apply, load, isRtl, get language() { return language; } };
})();
