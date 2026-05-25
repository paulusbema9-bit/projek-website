const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

const buggyHtml = `                                        <div class="icon-box">📄</div>
                                    </div>
                                </div>
                            <div class="col-md-6 col-lg-4">
                                <div class="card shadow-sm stat-card-info h-100 p-1">
                                    <div class="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <p class="stat-card-title">Total Dokumen Hari Ini</p>
                                            <div class="d-flex align-items-baseline">
                                                <h3 class="stat-card-value" id="statHariIni">0</h3>
                                            </div>
                                        </div>
                                        <div class="icon-box">📅</div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div id="viewMonitoring">`;

const fixedHtml = `                                        <div class="icon-box">📄</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <div class="card shadow-sm stat-card-info h-100 p-1">
                                    <div class="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <p class="stat-card-title">Total Dokumen Hari Ini</p>
                                            <div class="d-flex align-items-baseline">
                                                <h3 class="stat-card-value" id="statHariIni">0</h3>
                                            </div>
                                        </div>
                                        <div class="icon-box">📅</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="viewMonitoring">`;

// We will use string manipulation to find the exact spot and fix the div nesting
// Because `📄` might be messed up, let's use regex that ignores the icon.
const regex = /<div class="icon-box">[^<]+<\/div>\s*<\/div>\s*<\/div>\s*<div class="col-md-6 col-lg-4">\s*<div class="card shadow-sm stat-card-info h-100 p-1">\s*<div class="card-body d-flex justify-content-between align-items-center">\s*<div>\s*<p class="stat-card-title">Total Dokumen Hari Ini<\/p>\s*<div class="d-flex align-items-baseline">\s*<h3 class="stat-card-value" id="statHariIni">0<\/h3>\s*<\/div>\s*<\/div>\s*<div class="icon-box">[^<]+<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div id="viewMonitoring">/;

// Note: To be extremely safe, I will just read lines and splice manually.
let lines = html.split('\n');
let insertIdx = -1;
let removeIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="statTotal"')) {
        // We know statHariIni is nearby
        for (let j = i; j < i + 30; j++) {
            if (lines[j].includes('<div class="col-md-6 col-lg-4">') && lines[j+1] && lines[j+1].includes('stat-card-info')) {
                if (lines[j+4] && lines[j+4].includes('Total Dokumen Hari Ini')) {
                    insertIdx = j;
                    break;
                }
            }
        }
    }
}

if (insertIdx !== -1) {
    // Find the extra </div> at the end
    for (let k = insertIdx; k < insertIdx + 20; k++) {
        if (lines[k].includes('<div id="viewMonitoring">')) {
            // The extra </div> is one of the lines before this
            removeIdx = k - 2; // Usually right above the closing </div> of the row
            break;
        }
    }

    if (removeIdx !== -1) {
        // We add a </div> at insertIdx
        lines.splice(insertIdx, 0, '                            </div>');
        // We remove the extra </div> that was at removeIdx (which is now removeIdx + 1)
        lines.splice(removeIdx + 1, 1);

        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log("Div nesting fixed successfully!");
    } else {
        console.log("Could not find the extra closing div.");
    }
} else {
    console.log("Could not find the start of the Hari Ini card.");
}
