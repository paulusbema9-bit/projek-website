const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let lines = fs.readFileSync(path, 'utf8').split('\n');

let statTotalLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="statTotal"')) {
        statTotalLineIdx = i;
        break;
    }
}

if (statTotalLineIdx !== -1) {
    // find the end of the column div (which is 6 closing divs away)
    // Actually, looking at the structure:
    // <h3 ... id="statTotal">
    // <span ...
    // </div>
    // </div>
    // <div class="icon-box">...</div>
    // </div>
    // </div>
    // </div>
    let divsToClose = 0;
    let endIdx = -1;
    for (let i = statTotalLineIdx; i < lines.length; i++) {
        if (lines[i].includes('</div>')) {
            divsToClose++;
            if (divsToClose === 5) { // 1 for the baseline d-flex, 1 for the title div, 1 for card-body, 1 for card, 1 for col
                endIdx = i;
                break;
            }
        }
    }

    if (endIdx !== -1) {
        // check if already injected
        const textAfter = lines.slice(endIdx, endIdx + 15).join('\n');
        if (!textAfter.includes('id="statHariIni"')) {
            const newCard = `                            <div class="col-md-6 col-lg">
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
                            </div>`;
            lines.splice(endIdx + 1, 0, newCard);
            
            // Also ensure the row has col-md-6 col-lg instead of col-md-6 col-lg-3 for ALL 5 cards
            let html = lines.join('\n');
            html = html.replace(/<div class="col-md-6 col-lg-3">/g, '<div class="col-md-6 col-lg">');
            
            fs.writeFileSync(path, html, 'utf8');
            console.log("5th card added successfully!");
        } else {
            console.log("Card already exists.");
        }
    } else {
        console.log("Could not find end of card div.");
    }
} else {
    console.log("Could not find statTotal line.");
}
