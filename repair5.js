const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

// Replace the problematic flex-grow columns with fixed percentage columns
html = html.replace(/<div class="col-md-6 col-lg">/g, '<div class="col-md-6 col-lg-4">');

fs.writeFileSync(path, html, 'utf8');
console.log("Grid layout fixed!");
