const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

if (!html.toLowerCase().includes('charset="utf-8"') && !html.toLowerCase().includes("charset=utf-8")) {
  html = html.replace(/<head>/i, '<head>\n    <meta charset="UTF-8" />');
}

fs.writeFileSync(file, html, "utf8");

console.log("index.html com UTF-8 confirmado.");
