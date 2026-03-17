// src/services/whatsapp.service.ts

// Temporary Dummy Setup for Render Deployment to save memory!
export const isWhatsAppReady = false;

export const whatsappClient = {
    initialize: () => {
        console.log('⚠️ WhatsApp Bot Disabled: Skipping initialization for Render Deployment.');
    },
    sendMessage: async (phone: string, message: string) => {
        // Does nothing - mocks the real WhatsApp implementation
        console.log(`⚠️ WhatsApp is disabled. Blocked attempted message to ${phone}`);
        return null;
    }
};