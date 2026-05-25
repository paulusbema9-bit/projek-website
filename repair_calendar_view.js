const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the insertion point: "if (mode === 'manajemenAcara') {"
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (mode === 'manajemenAcara') {")) {
        insertIdx = i;
        break;
    }
}

if (insertIdx !== -1) {
    // Check if we already injected
    if (!lines[insertIdx - 2].includes("mode === 'kalender'")) {
        const fixCode = `
                const kalArea = document.getElementById('viewKalenderSiaran');
                if (kalArea) kalArea.classList.add('d-none');
                
                if (mode === 'kalender') {
                    monitorArea.classList.add('d-none');
                    rekapArea.classList.add('d-none');
                    if (acaraArea) acaraArea.classList.add('d-none');
                    if (kalArea) {
                        kalArea.classList.remove('d-none');
                        if (window.renderKalenderSiaran) setTimeout(window.renderKalenderSiaran, 100);
                    }
                    return;
                }
`;
        lines.splice(insertIdx, 0, fixCode);
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log("switchView logic fixed!");
    } else {
        console.log("Already fixed.");
    }
} else {
    console.log("Could not find the insertion point.");
}
