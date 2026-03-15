import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';
import { whatsappClient, isWhatsAppReady } from '../services/whatsapp.service';

const transporter = nodemailer.createTransport({
    // Using host and port directly is more reliable than service: 'gmail'
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD 
    }
});

// THIS WILL RUN WHEN SERVER STARTS AND TELL YOU IF GOOGLE BLOCKED YOU
transporter.verify()
    .then(() => console.log('✅ Nodemailer Gmail SMTP connection verified!'))
    .catch((error) => console.error('❌ Nodemailer Setup Error:', error.message));


const formatWhatsAppNumber = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, ''); // Removes '+' and spaces
    return `${cleanNumber}@c.us`;
};


export const sendVerificationEmail = async (email: string, name: string, otp: string) => {
    try {
        const mailOptions = {
            from: `"SmartExp Team" <${process.env.SMTP_EMAIL}>`, // Sender address
            to: email, // Receiver
            subject: 'Verify your Smart Expense Tracker account', // Subject line
            html: `
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
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ OTP Email sent successfully to ${email} (Message ID: ${info.messageId})`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendVerificationWhatsApp = async (phone: string, otp: string) => {
    if (!isWhatsAppReady) {
        console.log('⚠️ WhatsApp bot not ready yet. Skipping WhatsApp OTP.');
        return false;
    }

    try {
        const formattedNumber = formatWhatsAppNumber(phone);
        const message = `*SmartExp Security*\n\nYour verification code is: *${otp}*\n\nThis code expires in 15 minutes.`;
        
        // This makes your actual WhatsApp send the text!
        await whatsappClient.sendMessage(formattedNumber, message);
        console.log(`📱 WhatsApp OTP sent successfully to ${phone}`);
        return true;
    } catch (error: any) {
        console.error('❌ WhatsApp OTP failed:', error.message);
    }
};

//------------------------------------------Budget Alerts---------------------------------------------------------------//

export const sendBudgetAlertEmail = async (email: string, name: string, categoryName: string, budgetLimit: number, currentSpent: number) => {
    try {
        const mailOptions = {
            from: `"SmartExp Alerts" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: `🚨 Budget Alert: You exceeded your ${categoryName} budget`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #fecdd3; border-radius: 10px; background-color: #fff1f2;">
                    <h2 style="color: #e11d48; margin-top: 0;">Budget Exceeded!</h2>
                    <p style="color: #4c1d95; font-size: 16px;">Hi ${name},</p>
                    <p style="color: #881337; font-size: 16px;">You have just exceeded your monthly limit for <strong>${categoryName}</strong>.</p>
                    <div style="background-color: #ffe4e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #9f1239;"><strong>Monthly Budget:</strong> $${budgetLimit.toFixed(2)}</p>
                        <p style="margin: 5px 0 0 0; color: #e11d48;"><strong>Currently Spent:</strong> $${currentSpent.toFixed(2)}</p>
                    </div>
                    <p style="color: #9f1239; font-size: 14px;">You can review your spending in your SmartExp Dashboard.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Budget Alert Email sent successfully to ${email}`);
    } catch (error) {
        console.error('❌ Alert Email failed:', error);
    }
};

export const sendBudgetAlertWhatsApp = async (phone: string, categoryName: string, limit: number, spent: number) => {
    if (!isWhatsAppReady) {
        console.log('⚠️ WhatsApp bot not ready yet. Skipping Alert.');
        return false;
    }

    try {
        const formattedNumber = formatWhatsAppNumber(phone);
        const message = `🚨 *SmartExp Alert*\n\nYou have crossed your monthly budget for *${categoryName}*!\n\nLimit: $${limit.toFixed(2)}\nSpent: $${spent.toFixed(2)}\n\n_Review your expenses in the SmartExp app._`;

        await whatsappClient.sendMessage(formattedNumber, message);
        console.log(`📱 WhatsApp Alert sent successfully to ${phone}`);
        return true;
    } catch (error: any) {
        console.error('❌ WhatsApp Alert failed:', error.message);
    }
};