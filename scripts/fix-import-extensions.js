// Script para ajustar imports relativos para .js no build
const fs = require("fs");
const path = require("path");

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    // Regex: import ... from "./algum-arquivo"; => import ... from "./algum-arquivo.js";
    content = content.replace(/(from\s+["'])(\.\.?\/[^"']+?)(["'])/g, (match, p1, p2, p3) => {
        if (p2.endsWith(".js") || p2.endsWith(".json")) return match;
        return `${p1}${p2}.js${p3}`;
    });
    fs.writeFileSync(filePath, content, "utf8");
}

function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith(".js")) {
            fixImportsInFile(fullPath);
        }
    });
}

const buildDir = path.join(__dirname, "..", "build");
walk(buildDir);
console.log("✔️ Imports corrigidos para extensão .js no build");
