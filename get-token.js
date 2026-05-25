/**
 * Project: Sistem TU Digital
 * Deskripsi: Script Node.js untuk menghasilkan Access Token FCM HTTP v1
 * Persyaratan: File service-account.json harus berada di folder yang sama.
 */

const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function ambilAccessToken() {
    try {
        // 1. Menentukan lokasi file kunci rahasia Anda
        const pathKunci = path.join(__dirname, 'service-account.json');

        // 2. Memberi tahu Google bahwa kita butuh akses untuk mengirim notifikasi (messaging)
        const auth = new GoogleAuth({
            keyFile: pathKunci,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });

        // 3. Meminta token ke server Google
        const client = await auth.getClient();
        const responseToken = await client.getAccessToken();
        const tokenFinal = responseToken.token;

        // 4. Menampilkan hasil token di layar terminal
        console.log("\n====================================================");
        console.log(" TOKEN BERHASIL DIDAPATKAN (Berlaku 1 Jam) ");
        console.log("====================================================\n");
        console.log(tokenFinal);
        console.log("\n====================================================");
        console.log("Silakan salin kode panjang di atas ke index.html Anda.");
        console.log("====================================================\n");

    } catch (error) {
        console.error("\n[ERROR] Gagal mendapatkan token!");
        console.error("Pastikan file 'service-account.json' ada di folder ini.\n", error.message);
    }
}

// Menjalankan fungsi
ambilAccessToken();