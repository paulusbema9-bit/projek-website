const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Inject FullCalendar in HEAD
const headInjection = `
    <!-- FullCalendar -->
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js'></script>
    <style>
        .fc-event {
            cursor: pointer;
            padding: 2px 4px;
        }
        .fc-toolbar-title {
            font-size: 1.25em !important;
            font-weight: 700;
        }
        .fc-button-primary {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
        }
        .fc-button-active {
            background-color: #0b5ed7 !important;
            border-color: #0a58ca !important;
        }
        .fc-day-today {
            background-color: #e8f4fd !important;
        }
    </style>
</head>`;
if (!html.includes('fullcalendar@6.1.15')) {
    html = html.replace('</head>', headInjection);
}

// 2. Inject Sub-Menu in Data & Monitoring
const menuInjection = `                                    <button id="nav_riwayatDisposisi" onclick="switchView('riwayatDisposisi')"
                                        class="list-group-item list-group-item-action py-2 bg-transparent menu-nav-link text-muted"><i class="bi bi-clock-history me-2"></i>Riwayat Disposisi</button>
                                    <button id="nav_kalender" onclick="switchView('kalender')"
                                        class="list-group-item list-group-item-action py-2 bg-transparent fw-bold menu-nav-link text-info"><i class="bi bi-calendar-check me-2"></i>Jadwal Siaran</button>`;
if (!html.includes('id="nav_kalender"')) {
    html = html.replace(/<button id="nav_riwayatDisposisi"[^>]*>[\s\S]*?<\/button>/, menuInjection);
}

// 3. Inject Kalender Container
const viewInjection = `                        <div id="viewKalenderSiaran" class="d-none">
                            <div class="card p-4 shadow-sm">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="fw-bold text-primary m-0"><i class="bi bi-calendar-week me-2"></i>Kalender Jadwal Siaran Produksi</h5>
                                    <div>
                                        <button class="btn btn-sm btn-outline-secondary" onclick="renderKalenderSiaran()">🔄 Refresh</button>
                                    </div>
                                </div>
                                <div id="calendar" style="min-height: 600px;"></div>
                            </div>
                        </div>

                        <div id="viewMonitoring">`;
if (!html.includes('id="viewKalenderSiaran"')) {
    html = html.replace('<div id="viewMonitoring">', viewInjection);
}

// 4. Update switchView Logic
const switchViewLogicOld = `                const monitorArea = document.getElementById('viewMonitoring');
                const rekapArea = document.getElementById('viewRekap');
                const acaraArea = document.getElementById('viewAcara');
                
                if (acaraArea) acaraArea.classList.add('d-none');`;

const switchViewLogicNew = `                const monitorArea = document.getElementById('viewMonitoring');
                const rekapArea = document.getElementById('viewRekap');
                const acaraArea = document.getElementById('viewAcara');
                const kalArea = document.getElementById('viewKalenderSiaran');
                
                if (acaraArea) acaraArea.classList.add('d-none');
                if (kalArea) kalArea.classList.add('d-none');`;
if (!html.includes('const kalArea = document.getElementById(\'viewKalenderSiaran\');')) {
    html = html.replace(switchViewLogicOld, switchViewLogicNew);
}

const switchModeOld = `                if (mode.startsWith('rekap')) {
                    if (monitorArea) monitorArea.classList.add('d-none');
                    if (rekapArea) rekapArea.classList.remove('d-none');
                    document.getElementById('formTitle').innerText = judulMap[mode] || 'Rekap Dokumen';
                } else if (mode === 'acara') {
                    if (monitorArea) monitorArea.classList.add('d-none');
                    if (rekapArea) rekapArea.classList.add('d-none');
                    if (acaraArea) acaraArea.classList.remove('d-none');
                } else {`;
const switchModeNew = `                if (mode === 'kalender') {
                    if (monitorArea) monitorArea.classList.add('d-none');
                    if (rekapArea) rekapArea.classList.add('d-none');
                    if (kalArea) {
                        kalArea.classList.remove('d-none');
                        if (window.renderKalenderSiaran) setTimeout(window.renderKalenderSiaran, 100);
                    }
                } else if (mode.startsWith('rekap')) {
                    if (monitorArea) monitorArea.classList.add('d-none');
                    if (rekapArea) rekapArea.classList.remove('d-none');
                    document.getElementById('formTitle').innerText = judulMap[mode] || 'Rekap Dokumen';
                } else if (mode === 'acara') {
                    if (monitorArea) monitorArea.classList.add('d-none');
                    if (rekapArea) rekapArea.classList.add('d-none');
                    if (acaraArea) acaraArea.classList.remove('d-none');
                } else {`;
if (!html.includes(`if (mode === 'kalender')`)) {
    html = html.replace(switchModeOld, switchModeNew);
}

// 5. Inject Render Kalender Logic at the end of the script (before loadDataFromFirestore)
const renderLogic = `
            // ==========================================
            // LOGIKA KALENDER SIARAN PRODUKSI
            // ==========================================
            function parseTanggalSiaran(teks) {
                if (!teks) return [];
                let hasil = [];
                const teksLower = teks.toLowerCase();
                const bulanMap = { 'jan':0,'feb':1,'mar':2,'apr':3,'mei':4,'jun':5,'jul':6,'agu':7,'sep':8,'okt':9,'nov':10,'des':11 };
                
                const regexAngka = /\\b([1-9]|[12]\\d|3[01])\\b/g;
                const matchAngka = [...teksLower.matchAll(regexAngka)].map(m => parseInt(m[0]));
                
                const regexTahun = /\\b(20\\d{2})\\b/g;
                const matchTahun = [...teksLower.matchAll(regexTahun)].map(m => parseInt(m[0]));
                let tahun = matchTahun.length > 0 ? matchTahun[0] : new Date().getFullYear();
                
                let bulan = -1;
                for (let n in bulanMap) { if (teksLower.includes(n)) { bulan = bulanMap[n]; break; } }
                
                const regexDateSlash = /\\b(\\d{1,2})[\\/\\-](\\d{1,2})[\\/\\-](\\d{4})\\b/g;
                let matchSlash;
                while ((matchSlash = regexDateSlash.exec(teksLower)) !== null) {
                    hasil.push(new Date(parseInt(matchSlash[3]), parseInt(matchSlash[2])-1, parseInt(matchSlash[1])));
                }
                
                if (hasil.length === 0 && bulan !== -1 && matchAngka.length > 0) {
                    const hariArr = matchAngka.filter(num => num !== tahun);
                    hariArr.forEach(h => hasil.push(new Date(tahun, bulan, h)));
                }
                
                return hasil.map(d => \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`);
            }

            window.calendarApp = null;
            window.renderKalenderSiaran = () => {
                const calEl = document.getElementById('calendar');
                if (!calEl) return;
                
                let events = [];
                if (window.globalSemuaSurat) {
                    window.globalSemuaSurat.forEach(v => {
                        // Cari data tglSiaran, bisa di root object atau di detailProduksi
                        let tglSiaranRaw = v.tglSiaran || (v.detailProduksi ? v.detailProduksi.tglSiaran : null);
                        let progSiaran = v.progSiaran || (v.detailProduksi ? v.detailProduksi.progSiaran : "Program");
                        let judulAcara = v.judulAcara || (v.detailProduksi ? v.detailProduksi.judulAcara : "Tanpa Judul");
                        
                        if (tglSiaranRaw) {
                            let dates = parseTanggalSiaran(tglSiaranRaw);
                            dates.forEach(d => {
                                events.push({
                                    title: \`\${progSiaran} - \${judulAcara}\`,
                                    start: d,
                                    allDay: true,
                                    description: \`Tanggal asli: \${tglSiaranRaw}\\nStatus: \${v.status || ''}\\nPIC: \${v.pic || ''}\`,
                                    color: (v.status || "").toLowerCase().includes('selesai') ? '#198754' : '#0d6efd',
                                    url: v.linkFile || '#'
                                });
                            });
                        }
                    });
                }
                
                if (window.calendarApp) window.calendarApp.destroy();
                
                window.calendarApp = new FullCalendar.Calendar(calEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,listWeek'
                    },
                    locale: 'id',
                    events: events,
                    eventClick: function(info) {
                        if (info.event.url && info.event.url !== '#') {
                            info.jsEvent.preventDefault(); // don't let the browser navigate
                            window.open(info.event.url, '_blank');
                        } else {
                            alert(info.event.title + "\\n" + info.event.extendedProps.description);
                        }
                    },
                    eventDidMount: function(info) {
                        info.el.title = info.event.extendedProps.description; // Hover tooltip
                    }
                });
                window.calendarApp.render();
            };
            
            // ==========================================
`;

if (!html.includes('function parseTanggalSiaran(teks)')) {
    html = html.replace('// LOAD DATA DARI FIRESTORE AWAL', renderLogic + '\n            // LOAD DATA DARI FIRESTORE AWAL');
}

fs.writeFileSync(path, html, 'utf8');
console.log("Calendar successfully integrated!");
