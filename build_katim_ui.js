
const fs = require('fs');
let content = fs.readFileSync('D:/aplikasi/index.html', 'utf8');

// The HTML was injected by the script above.
// Now we inject the JS functions: bukaPreviewKatim, prosesSimpanTLKatim, bagikanWA

const jsCode = `
            window.bukaPreviewKatim = (id) => {
                const surat = window.globalSemuaSurat.find(s => s.id === id);
                if(!surat) return alert("Data tidak ditemukan");
                
                // Set iframe src
                let link = surat.linkFileTTE || surat.linkFile;
                document.getElementById('iframePreview').src = link;
                
                // Sembunyikan form lain, munculkan form TL Katim
                document.getElementById('areaFormDisposisi').classList.add('d-none');
                document.getElementById('areaFormVerifikasi').classList.add('d-none');
                document.getElementById('areaFormTLKatim').classList.remove('d-none');
                
                // Isi hidden field dan bersihkan input
                document.getElementById('tlIdKatim').value = id;
                document.getElementById('ketTLKatim').value = "";
                document.getElementById('fileTLKatim').value = "";
                
                // Simpan url file dan judul surat secara global untuk dibagikan ke WA
                window.waShareUrl = link;
                window.waShareTitle = surat.perihal || "Dokumen Dinas";
                
                // Tampilkan modal
                document.getElementById('modalPreviewPDF').style.display = 'flex';
                
                // Tandai sudah dibaca
                let r = window.userAktif.role;
                const tlData = surat.tindakLanjut_v2 || {};
                const rData = tlData[r] || {};
                if(!rData.waktuBatal && !rData.isSelesai) {
                    if(!surat.dibacaOleh) surat.dibacaOleh = [];
                    if(!surat.dibacaOleh.includes(r)) {
                        try {
                            const { updateDoc, doc, arrayUnion } = window.fbHelpers;
                            updateDoc(doc(window.db, "surat_dinas", id), {
                                dibacaOleh: arrayUnion(r)
                            });
                        } catch(e) {}
                    }
                }
            };
            
            window.prosesSimpanTLKatim = async () => {
                const k = document.getElementById('ketTLKatim').value;
                const file = document.getElementById('fileTLKatim').files[0];
                const tlId = document.getElementById('tlIdKatim').value;
                if (!k) return alert("Isi keterangan tindak lanjut!");

                try {
                    const { ref, uploadBytes, getDownloadURL, updateDoc, doc, db } = window.fbHelpers;
                    let r = window.userAktif.role;
                    let updateData = {};
                    
                    // Struktur baru v2
                    updateData[`tindakLanjut_v2.${r}.keterangan`] = k;
                    updateData[`tindakLanjut_v2.${r}.waktuSelesai`] = new Date().toISOString();
                    updateData[`tindakLanjut_v2.${r}.isSelesai`] = true;

                    if (file) {
                        const fileRef = ref(window.storage, `lampiran_tl/${tlId}_${r}_${file.name}`);
                        await uploadBytes(fileRef, file);
                        const url = await getDownloadURL(fileRef);
                        updateData[`tindakLanjut_v2.${r}.file`] = url;
                    }

                    await updateDoc(doc(db, "surat_dinas", tlId), updateData);
                    alert("Tindak lanjut berhasil disimpan!");
                    tutupModal('modalPreviewPDF');
                } catch (e) {
                    console.error(e);
                    alert("Gagal menyimpan tindak lanjut!");
                }
            };
            
            window.bagikanWA = async () => {
                if(!window.waShareUrl) return alert("Tidak ada file untuk dibagikan!");
                
                try {
                    // Cek jika browser mendukung Web Share API untuk file
                    if (navigator.canShare) {
                        // Ambil blob dari url (karena url firebase storage butuh fetch)
                        // Note: Kadang fetch cors di firebase perlu di set, tapi karena di browser yg sama biasanya ok
                        alert("Sistem sedang menyiapkan file untuk dibagikan, mohon tunggu sebentar...");
                        const response = await fetch(window.waShareUrl);
                        const blob = await response.blob();
                        const file = new File([blob], window.waShareTitle + ".pdf", { type: blob.type || "application/pdf" });
                        
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: window.waShareTitle,
                                text: 'Berikut adalah dokumen surat dinas: ' + window.waShareTitle,
                                files: [file]
                            });
                            return; // Sukses share
                        }
                    }
                } catch(e) {
                    console.error("Gagal share native:", e);
                }
                
                // Fallback jika tidak bisa kirim file langsung atau diakses via PC
                alert("Browser/Perangkat tidak mendukung kirim file langsung. Membuka WhatsApp Web dengan link dokumen...");
                const textWA = encodeURIComponent("Berikut adalah dokumen surat dinas: " + window.waShareTitle + "\n\nSilakan klik link berikut untuk mengunduh: " + window.waShareUrl);
                window.open("https://wa.me/?text=" + textWA, "_blank");
            };
`;

// Inject JS if not already there
if (!content.includes('window.bukaPreviewKatim =')) {
    const injectPoint = content.indexOf('window.bukaTL = (id) => {');
    if(injectPoint !== -1) {
        content = content.substring(0, injectPoint) + jsCode + "\n" + content.substring(injectPoint);
    }
}

// Now replace the table action rendering logic.
// Find the button generation part. We will do this safely using regex or explicit replace.

const btnRenderCodeOld = `// Tombol TL untuk para penerima (Katim/Kasubag/PPK) yang belum menyelesaikan TL nya
                        if (v.tujuanAkhir && v.tujuanAkhir.includes(r) && !isSelesaiTL_Legacy && !isSelesaiTL_User) {
                            btnUtama += \`<button onclick="bukaTL('${id}')" class="btn btn-sm btn-info w-100 mb-1 text-white fw-bold">🚀 Tindak Lanjut</button>\`;
                        }`;

const btnRenderCodeNew = `// Khusus Katim: Ganti tombol Aksi dengan Buka Preview
                        if (isKatim && !isKasubag) {
                            btnUtama = \`<button onclick="bukaPreviewKatim('${id}')" class="btn btn-sm btn-primary w-100 fw-bold shadow-sm" style="border-radius: 8px;"><i class="bi bi-envelope-open me-1"></i> Buka</button>\`;
                            // Hapus semua tombol tambahan & dropdown agar bersih
                            v.linkFile = null; 
                            v.linkFileTTE = null;
                            sRaw = "HIDE_DROPDOWN"; 
                        } else {
                            // Render seperti biasa untuk Kasubag/Staf
                            if (v.tujuanAkhir && v.tujuanAkhir.includes(r) && !isSelesaiTL_Legacy && !isSelesaiTL_User) {
                                btnUtama += \`<button onclick="bukaTL('${id}')" class="btn btn-sm btn-info w-100 mb-1 text-white fw-bold">🚀 Tindak Lanjut</button>\`;
                            }
                        }`;

content = content.replace(btnRenderCodeOld, btnRenderCodeNew);

// We need to handle the dropdown hiding cleanly. 
// We set sRaw = "HIDE_DROPDOWN" above, but let's make sure the dropdown itself is conditionally hidden.
// In the original code, the dropdown is built:
// let btnDropdown = `<div class="dropdown mt-1">...</div>`
// Let's add a check before adding it to cellAction.

content = content.replace(
    `<td style="text-align: center;">
                            ${btnUtama}
                            <div class="dropdown mt-1">`,
    `<td style="text-align: center; vertical-align: middle;">
                            ${btnUtama}
                            ${isKatim && !isKasubag ? '' : \`
                            <div class="dropdown mt-1">\``);

content = content.replace(
    `</ul>
                            </div>
                        </td>`,
    `</ul>
                            </div>\` }
                        </td>`
);

fs.writeFileSync('D:/aplikasi/index.html', content);
console.log("Successfully injected Katim Preview UI & JS logic!");
