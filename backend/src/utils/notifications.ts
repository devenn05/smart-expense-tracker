import dotenv from "dotenv";
dotenv.config();
import { whatsappClient, isWhatsAppReady } from '../services/whatsapp.service';

// =========================================================================
// BREVO REST API HELPER (BYPASSES SMTP PORT BLOCKS ON RENDER FREE TIER)
// =========================================================================
const sendEmailViaBrevo = async (toEmail: string, subject: string, htmlContent: string, senderName: string = "SmartExp Team") => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY as string,
                'accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: process.env.SMTP_EMAIL },
                to: [{ email: toEmail }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unknown Brevo API Error');
        }

        console.log(`✉️ Email successfully sent via Brevo to ${toEmail}`);
        return true;
    } catch (error: any) {
        console.error('❌ Brevo Email API failed:', error.message);
        return false;
    }
};

const formatWhatsAppNumber = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, ''); // Removes '+' and spaces
    return `${cleanNumber}@c.us`;
};

// =========================================================================
// AUTHENTICATION & SECURITY
// =========================================================================

export const sendVerificationEmail = async (email: string, name: string, otp: string) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a;">Welcome to SmartExp!</h2>
            <p style="color: #475569; font-size: 16px;">Hi ${name},</p>
            <p style="color: #475569; font-size: 16px;">Use the verification code below to complete your registration:</p>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't request this, please safely ignore this email.</p>
        </div>
    `;
    await sendEmailViaBrevo(email, 'Verify your Smart Expense Tracker account', html, "SmartExp Team");
};

export const sendVerificationWhatsApp = async (phone: string, otp: string) => {
    if (!isWhatsAppReady) {
        console.log('⚠️ WhatsApp bot not ready yet. Skipping WhatsApp OTP.');
        return false;
    }

    try {
        const formattedNumber = formatWhatsAppNumber(phone);
        const message = `*SmartExp Security*\n\nYour verification code is: *${otp}*\n\nThis code expires in 15 minutes.`;
        
        await whatsappClient.sendMessage(formattedNumber, message);
        console.log(`📱 WhatsApp OTP sent successfully to ${phone}`);
        return true;
    } catch (error: any) {
        console.error('❌ WhatsApp OTP failed:', error.message);
    }
};

export const sendPasswordResetEmail = async (email: string, name: string, otp: string) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a;">Password Reset</h2>
            <p style="color: #475569; font-size: 16px;">Hi ${name},</p>
            <p style="color: #475569; font-size: 16px;">Someone (hopefully you) requested a password reset. Here is your verification code:</p>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code expires in 15 minutes. If you did not request this, securely ignore this email.</p>
        </div>
    `;
    await sendEmailViaBrevo(email, 'SmartExp - Password Reset Request', html, "SmartExp Security");
};

// =========================================================================
// BUDGET & ANOMALY ALERTS
// =========================================================================

export const sendBudgetAlertEmail = async (email: string, name: string, categoryName: string, budgetLimit: number, currentSpent: number) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #fecdd3; border-radius: 10px; background-color: #fff1f2;">
            <h2 style="color: #e11d48; margin-top: 0;">Budget Exceeded!</h2>
            <p style="color: #4c1d95; font-size: 16px;">Hi ${name},</p>
            <p style="color: #881337; font-size: 16px;">You have just exceeded your monthly limit for <strong>${categoryName}</strong>.</p>
            <div style="background-color: #ffe4e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #9f1239;"><strong>Monthly Budget:</strong> ₹${budgetLimit.toFixed(2)}</p>
                <p style="margin: 5px 0 0 0; color: #e11d48;"><strong>Currently Spent:</strong> ₹${currentSpent.toFixed(2)}</p>
            </div>
            <p style="color: #9f1239; font-size: 14px;">You can review your spending in your SmartExp Dashboard.</p>
        </div>
    `;
    await sendEmailViaBrevo(email, `🚨 Budget Alert: You exceeded your ${categoryName} budget`, html, "SmartExp Alerts");
};

export const sendBudgetAlertWhatsApp = async (phone: string, categoryName: string, limit: number, spent: number) => {
    if (!isWhatsAppReady) {
        console.log('⚠️ WhatsApp bot not ready yet. Skipping Alert.');
        return false;
    }

    try {
        const formattedNumber = formatWhatsAppNumber(phone);
        const message = `🚨 *SmartExp Alert*\n\nYou have crossed your monthly budget for *${categoryName}*!\n\nLimit: ₹${limit.toFixed(2)}\nSpent: ₹${spent.toFixed(2)}\n\n_Review your expenses in the SmartExp app._`;

        await whatsappClient.sendMessage(formattedNumber, message);
        console.log(`📱 WhatsApp Alert sent successfully to ${phone}`);
        return true;
    } catch (error: any) {
        console.error('❌ WhatsApp Alert failed:', error.message);
    }
};

export const sendAnomalyAlertEmail = async (email: string, name: string, categoryName: string, historicalAverage: number, currentSpent: number) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #fef3c7; border-radius: 10px; background-color: #fffbeb;">
            <h2 style="color: #d97706; margin-top: 0;">Unusual Spending Detected!</h2>
            <p style="color: #4c1d95; font-size: 16px;">Hi ${name},</p>
            <p style="color: #92400e; font-size: 16px;">We noticed your spending in <strong>${categoryName}</strong> is significantly higher this month than your usual patterns.</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #b45309;"><strong>3-Month Average:</strong> ₹${historicalAverage.toFixed(2)}</p>
                <p style="margin: 5px 0 0 0; color: #d97706;"><strong>Spent This Month:</strong> ₹${currentSpent.toFixed(2)}</p>
            </div>
            <p style="color: #92400e; font-size: 14px;">Review your expenses in the SmartExp Dashboard to ensure you stay on track.</p>
        </div>
    `;
    await sendEmailViaBrevo(email, `⚠️ Spending Anomaly Detected: ${categoryName}`, html, "SmartExp Alerts");
};

export const sendAnomalyAlertWhatsApp = async (phone: string, categoryName: string, historicalAverage: number, currentSpent: number) => {
    if (!isWhatsAppReady) return false;
    
    try {
        const formattedNumber = formatWhatsAppNumber(phone);
        const message = `⚠️ *SmartExp Anomaly Alert*\n\nYour spending in *${categoryName}* is unusually high this month compared to your typical history!\n\nAverage: ₹${historicalAverage.toFixed(2)}\nCurrent: ₹${currentSpent.toFixed(2)}\n\n_Stay mindful of your expenses!_`;
        
        await whatsappClient.sendMessage(formattedNumber, message);
        console.log(`📱 WhatsApp Anomaly Alert sent successfully to ${phone}`);
        return true;
    } catch (error: any) {
        console.error('❌ WhatsApp Anomaly Alert failed:', error.message);
    }
};