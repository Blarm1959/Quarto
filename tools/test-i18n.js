const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const release = JSON.parse(fs.readFileSync(path.join(root, "release.json"), "utf8"));
const config = release.i18n;
if (release.schemaVersion !== 1) throw new Error("release.json schemaVersion must be 1");
if (!config?.enabled) throw new Error("i18n must be enabled");
if (!config.languages.includes(config.masterLanguage)) throw new Error("Master language must be listed in i18n.languages");
if (!config.languages.includes(config.defaultLanguage)) throw new Error("Default language must be listed in i18n.languages");

const folder = path.join(root, config.folder);
const masterPath = path.join(folder, `${config.masterLanguage}.json`);
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const masterKeys = Object.keys(master).sort();
if (!masterKeys.length) throw new Error("Master language contains no keys");

for (const language of config.languages) {
  const file = path.join(folder, `${language}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing language file: ${language}.json`);
  const messages = JSON.parse(fs.readFileSync(file, "utf8"));
  const keys = Object.keys(messages).sort();
  const missing = masterKeys.filter(key => !Object.prototype.hasOwnProperty.call(messages, key));
  const extra = keys.filter(key => !Object.prototype.hasOwnProperty.call(master, key));
  if (missing.length || extra.length) {
    throw new Error(`${language}: missing [${missing.join(", ")}], extra [${extra.join(", ")}]`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const referenced = [...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(match => match[1]);
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
for (const match of app.matchAll(/\bt\("([^"]+)"/g)) referenced.push(match[1]);
const unknown = [...new Set(referenced)].filter(key => !Object.prototype.hasOwnProperty.call(master, key));
if (unknown.length) throw new Error(`Unknown i18n keys: ${unknown.join(", ")}`);

console.log(`i18n validation passed (${config.languages.length} language, ${masterKeys.length} keys).`);
