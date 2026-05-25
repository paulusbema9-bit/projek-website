const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

// Lokasi Jakarta
setGlobalOptions({ region: "asia-southeast2" });

/**
 * FUNGSI 1: Hanya untuk Admin (Staf TU)
 * Dipicu saat Operator klik "Dapatkan Nomor"
 */
exports.notifSuratBaru = onDocumentCreated("surat_dinas/{docId}", async (event) => {
    const data = event.data.data();
    
    // Notif minta nomor HANYA dikirim ke role "Admin"
    if (data.status === "Menunggu Upload PDF") {
        try {
            const tokenSnap = await admin.firestore().collection("tokens_notifikasi")
                .where("role", "==", "Admin").get();
            
            const tokens = tokenSnap.docs.map(doc => doc.data().token);
            if (tokens.length > 0) {
                await admin.messaging().sendEachForMulticast({
                    tokens: tokens,
                    notification: {
                        title: "📩 Permintaan Nomor",
                        body: `Operator ${data.pic} meminta nomor surat.`,
                    }
                });
            }
        } catch (e) { console.error(e); }
    }
});

/**
 * FUNGSI 2: Notif Berjenjang
 */
exports.notifStatusBerubah = onDocumentUpdated("surat_dinas/{docId}", async (event) => {
    const dataBaru = event.data.after.data();
    const dataLama = event.data.before.data();

    if (dataBaru.status !== dataLama.status) {
        try {
            let targetRoles = [];
            let title = "Update Surat";
            let body = dataBaru.perihal;

            // KONDISI A: Operator Selesai Upload -> Hanya ke Admin
            if (dataLama.status === "Menunggu Upload PDF" && dataBaru.status === "Menunggu Persetujuan Admin") {
                targetRoles.push("Admin");
                title = "📑 Verifikasi Admin";
                body = `Staf Admin, silakan cek file dari ${dataBaru.pic}`;
            }

            // KONDISI B: Admin meneruskan ke Kasubag/PPK
            // Logika: Jika status berubah jadi "Menunggu Kasubag TU", 
            // maka targetRoles HANYA berisi "Kasubag TU"
            else if (dataBaru.status.startsWith("Menunggu") && dataLama.status === "Menunggu Persetujuan Admin") {
                const roleTujuan = dataBaru.status.replace("Menunggu ", "");
                targetRoles.push(roleTujuan);
                title = "🔍 Perlu Verifikasi Anda";
                body = `Yth. ${roleTujuan}, mohon verifikasi surat: ${dataBaru.perihal}`;
            }

            // ... (Kondisi Ditolak dan Disposisi tetap sama)

            if (targetRoles.length > 0) {
                const tokenSnap = await admin.firestore().collection("tokens_notifikasi")
                    .where("role", "in", targetRoles).get();
                
                const tokens = tokenSnap.docs.map(doc => doc.data().token);
                if (tokens.length > 0) {
                    await admin.messaging().sendEachForMulticast({
                        tokens: tokens,
                        notification: { title: title, body: body },
                        webpush: { fcmOptions: { link: "https://sistem-tu-c58ee.web.app/" } }
                    });
                }
            }
        } catch (error) { console.error(error); }
    }
});