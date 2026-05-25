importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDTx_0nd6vz4ptWSI02mMCsKK0ZTeLSF_Q",
    authDomain: "sistem-tu-c58ee.firebaseapp.com",
    projectId: "sistem-tu-c58ee",
    storageBucket: "sistem-tu-c58ee.firebasestorage.app",
    messagingSenderId: "844322733823",
    appId: "1:844322733823:web:73d71d3d083633f5a716ca"
});

const messaging = firebase.messaging();

// CUKUP LOG SAJA, JANGAN PANGGIL showNotification di sini!
// Firebase SDK sudah otomatis menampilkannya jika payload memiliki objek 'notification'
messaging.onBackgroundMessage((payload) => {
    console.log('Pesan Background Diterima (Handled by Firebase SDK):', payload);
});

// TETAP PERTAHANKAN INI agar klik notif berfungsi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Ambil URL dari payload server (Cloud Functions)
    // Di Cloud Function kita pakai webpush.fcmOptions.link
    let urlToOpen = self.location.origin;
    
    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});