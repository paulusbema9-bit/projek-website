const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

const injectionCode = `
            // ==========================================
            // LOGIKA KALENDER SIARAN PRODUKSI
            // ==========================================
            window.calendarApp = null;
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

            window.renderKalenderSiaran = () => {
                const calEl = document.getElementById('calendar');
                if (!calEl) return;
                
                let events = [];
                if (window.globalSemuaSurat) {
                    window.globalSemuaSurat.forEach(v => {
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
                            info.jsEvent.preventDefault();
                            window.open(info.event.url, '_blank');
                        } else {
                            alert(info.event.title + "\\n" + info.event.extendedProps.description);
                        }
                    },
                    eventDidMount: function(info) {
                        info.el.title = info.event.extendedProps.description;
                    }
                });
                window.calendarApp.render();
            };
`;

if (!html.includes('window.renderKalenderSiaran = () => {')) {
    const lastScriptIdx = html.lastIndexOf('</script>');
    if (lastScriptIdx !== -1) {
        html = html.substring(0, lastScriptIdx) + injectionCode + html.substring(lastScriptIdx);
        fs.writeFileSync(path, html, 'utf8');
        console.log("Calendar logic successfully injected!");
    } else {
        console.log("Could not find closing script tag.");
    }
} else {
    console.log("Logic already exists.");
}
