const fs = require('fs');
const path = 'D:\\aplikasi\\index.html';
const html = fs.readFileSync(path, 'utf8');

const regex = /nAgendaBaru = String\(cariNomor\(pAgenda, 550\)\);\s*\}\s*\}, '', '', ''\], \[\{/g;

if (regex.test(html)) {
    console.log("MATCH FOUND!");
    
    const missingBlock = `nAgendaBaru = String(cariNomor(pAgenda, 550));
                    }

                    // 3. Olah Data untuk Ditampilkan di PDF
                    const dO = dataSurat.tgl ? dataSurat.tgl.toDate() : new Date();
                    const bl = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][dO.getMonth()];
                    let nmND = (dataSurat.category === 'ND_KEPSTA' || dataSurat.category === 'SK_KEPSTA') ? (dataSurat.noUrutNDKepsta || dataSurat.noUrutND) : dataSurat.noUrutND;
                    let lND = nmND && nmND !== "" && nmND !== "N/A" ? (nmND === "LUAR" ? "LUAR" : \`\${nmND}/\${dataSurat.klas}/\${dataSurat.kepND}/\${bl}/2026\`) : "-";

                    const tglSuratFormat = dO.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                    let tglDispo = new Date();
                    if (dataSurat.riwayat && Array.isArray(dataSurat.riwayat)) {
                        const dr = dataSurat.riwayat.find(r => r.status === "Selesai Disposisi");
                        if (dr && dr.tgl) tglDispo = new Date(dr.tgl);
                    }
                    const tglFormatCetak = tglDispo.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });

                    // --- LOGIKA DINAMIS KOLOM DARI ---
                    let dariTeks = dataSurat.dari || 'Internal';
                    if (dataSurat.category === 'ND_KASUBAG' || dataSurat.category === 'MANUAL_KASUBAG') {
                        dariTeks = 'Kepala Sub Bagian Tata Usaha';
                    }

                    const getPenerima = (val) => tujuan.includes(val);
                    const getInstruksi = (val) => instruksi.includes(val);

                    // 4. Register Font Gotham
                    pdfMake.vfs['Gotham-Light.ttf'] = window.gothamLightBase64;
                    const myFonts = {
                        Gotham: {
                            normal: 'Gotham-Light.ttf',
                            bold: 'Gotham-Light.ttf'
                        }
                    };

                    // 5. Struktur PDF
                    const docDefinition = {
                        pageSize: 'A4',
                        pageMargins: [40, 70.87, 40, 30],
                        defaultStyle: {
                            font: 'Gotham',
                            fontSize: 10
                        },
                        content: [{
                            columns: [{
                                image: logoTVRI,
                                width: 80,
                                margin: [-10, -45, 0, 0]
                            }, {
                                stack: [{
                                    text: 'DISPOSISI',
                                    alignment: 'center',
                                    bold: true,
                                    fontSize: 10
                                }, {
                                    text: 'KEPALA TVRI STASIUN JAWA TENGAH',
                                    alignment: 'center',
                                    bold: true
                                }, {
                                    text: 'LPP TELEVISI REPUBLIK INDONESIA',
                                    alignment: 'center',
                                    bold: true
                                },],
                                width: '*'
                            }, {
                                text: '',
                                width: 50
                            }],
                            margin: [0, 0, 0, 15]
                        }, {
                            table: {
                                widths: [90, 5, 140, 80, 5, '*'],
                                body: [// MENCETAK NOMOR AGENDA BARU KE DALAM PDF
                                    ['Nomor Agenda', ':', nAgendaBaru, '', '', ''], ['Tanggal', ':', tglSuratFormat, '', '', ''], ['Dari', ':', dariTeks, 'Nomor Surat', ':', dataSurat.nomorAsal || lND], ['Hal', ':', {
                                        text: dataSurat.perihal || '-',
                                        bold: true,
                                        colSpan: 4
                                    }, '', '', ''], [{`;

    const fixedHtml = html.replace(regex, missingBlock);
    fs.writeFileSync(path, fixedHtml, 'utf8');
    console.log("Fixed successfully!");
} else {
    console.log("MATCH NOT FOUND!");
}
