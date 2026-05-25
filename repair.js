const fs = require('fs');

const path = 'D:\\aplikasi\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Re-inject the accidentally deleted block in prosesDisposisi
const anchor = `nAgendaBaru = String(cariNomor(pAgenda, 550));\n                    }`;
const missingBlock = `
                    // -----------------------------------------------------

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
                                        colSpan: 4`;

// Check if already injected
if (!html.includes('const tglSuratFormat = dO.toLocaleDateString')) {
    html = html.replace(anchor, anchor + missingBlock);
}

// 2. Fix the dates in the other 3 locations (modalEditTujuan, edit agenda, and regeneratePDFDisposisi)
// Replace tglDispo = new Date() with tglSuratFormat definition
html = html.replace(/let tglDispo = new Date\(\);/g, "const tglSuratFormat = dO.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });\n                    let tglDispo = new Date();");

// Replace ['Tanggal', ':', tglFormatCetak, '', '', ''] with ['Tanggal', ':', tglSuratFormat, '', '', '']
// We have to be careful not to break other tables, but this specific array is very unique to the PDF disposition table.
html = html.replace(/\['Tanggal', ':', tglFormatCetak, '', '', ''\]/g, "['Tanggal', ':', tglSuratFormat, '', '', '']");

// Also there might be a case where it's formatted slightly differently:
html = html.replace(/\['Tanggal',\s*':',\s*tglFormatCetak,\s*'',\s*'',\s*''\]/g, "['Tanggal', ':', tglSuratFormat, '', '', '']");

fs.writeFileSync(path, html, 'utf8');
console.log("Repair and Date separation completed successfully!");
