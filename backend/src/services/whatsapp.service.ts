import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

// Initialize the client.
// LocalAuth saves your session so you don't have to scan the QR code every time you restart the server.
export const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Fixes common crashes on some systems
    }
});

export let isWhatsAppReady = false;

// // When the client wants you to log in, it will print a QR code to your backend terminal
// whatsappClient.on('qr', (qr) => {
//     console.log('\n📱 Scan this QR Code with your WhatsApp app to link your bot:\n');
//     qrcode.generate(qr, { small: true });
// });

// // When the WhatsApp Web session is fully loaded
// whatsappClient.on('ready', () => {
//     console.log('✅ WhatsApp Web Client is ready!');
//     isWhatsAppReady = true;
// });

// // If authentication fails
// whatsappClient.on('auth_failure', msg => {
//     console.error('❌ WhatsApp Authentication failure:', msg);
// });