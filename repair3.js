const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Change columns grid
html = html.replace(/<div class="col-md-6 col-lg-3">/g, '<div class="col-md-6 col-lg">');

// 2. Add the 5th Card
const targetHtml = `                                        <div class="icon-box">📄</div>
                                    </div>
                                </div>
                            </div>`;
const newCardHtml = `                                        <div class="icon-box">📄</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg">
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
if (!html.includes('id="statHariIni"')) {
    html = html.replace(targetHtml, newCardHtml);
}

// 3. Update stat iteration logic using regex to ignore line ending issues
const logicRegex = /let statTotal = window\.globalSemuaSurat \? window\.globalSemuaSurat\.length : 0;\s*window\.globalSemuaSurat\.forEach\(\(v\) => \{\s*const id = v\.id;\s*const r = window\.userAktif\?\.role;\s*const sRaw = v\.status \|\| "";\s*const isS = sRaw\.toLowerCase\(\)\.includes\("selesai disposisi"\) \|\| sRaw\.toLowerCase\(\)\.includes\("disetujui kepsta"\) \|\| sRaw\.toLowerCase\(\)\.includes\("berita acara selesai"\);\s*if \(sRaw\.toLowerCase\(\)\.includes\("selesai"\) \|\| sRaw\.toLowerCase\(\)\.includes\("disetujui"\)\) \{\s*statSelesai\+\+;\s*\} else if \(sRaw\.toLowerCase\(\)\.includes\("menunggu"\)\) \{\s*statMenunggu\+\+;\s*\}/g;

const newLogic = `let statTotal = 0;
                let statHariIni = 0;
                let dToday = new Date();
                dToday.setHours(0,0,0,0);

                window.globalSemuaSurat.forEach((v) => {
                    const id = v.id;
                    const r = window.userAktif?.role || "";
                    const rL = r.toLowerCase();
                    const idUser = window.userAktif?.id || "";
                    const sRaw = v.status || "";
                    const isS = sRaw.toLowerCase().includes("selesai disposisi") || sRaw.toLowerCase().includes("disetujui kepsta") || sRaw.toLowerCase().includes("berita acara selesai");
                    
                    let isMilikUser = false;
                    if (v.pic === idUser) isMilikUser = true;
                    else if (v.tujuanAkhir && v.tujuanAkhir.includes(r)) isMilikUser = true;
                    else if (v.tujuanStaf && v.tujuanStaf.includes(idUser)) isMilikUser = true;
                    else if (sRaw.toLowerCase().includes(rL)) isMilikUser = true;
                    else if (v.log && v.log.some(logItem => logItem.st.includes(r) || logItem.st.includes(idUser))) isMilikUser = true;
                    else if (r === "Kepala Stasiun" || r === "Admin" || r === "Sekretariat") isMilikUser = true;

                    if (isMilikUser) {
                        statTotal++;
                        if (sRaw.toLowerCase().includes("selesai") || sRaw.toLowerCase().includes("disetujui")) {
                            statSelesai++;
                        } else if (sRaw.toLowerCase().includes("menunggu")) {
                            statMenunggu++;
                        }
                        let dSurat = v.tgl ? v.tgl.toDate() : new Date();
                        dSurat.setHours(0,0,0,0);
                        if (dSurat.getTime() === dToday.getTime()) {
                            statHariIni++;
                        }
                    }`;

html = html.replace(logicRegex, newLogic);

// 4. Update the DOM assignment
html = html.replace(/if\(elT\) elT\.innerText = statTotal;/g, `if(elT) elT.innerText = statTotal;
                let elH = document.getElementById('statHariIni');
                if(elH) elH.innerText = statHariIni;`);

fs.writeFileSync(path, html, 'utf8');
console.log("Dashboard stats updated successfully!");
