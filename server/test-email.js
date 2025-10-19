const { sendMail } = require('./Utils/mailer');
require('dotenv').config();

async function testEmail() {
    try {
        const result = await sendMail({
            to: process.env.TEST_EMAIL || process.env.SMTP_USER,
            subject: 'Test Email from Osethra App',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from your Osethra application.</p>
                <p>If you receive this, your email configuration is working correctly!</p>
                <p>Time sent: ${new Date().toLocaleString()}</p>
            `,
            text: 'This is a test email from your Osethra application. If you receive this, your email configuration is working correctly!'
        });

        console.log('Test email sent successfully!');
        console.log('Message ID:', result.info.messageId);
        
        if (result.previewUrl) {
            console.log('Preview URL (for Ethereal):', result.previewUrl);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error sending test email:', error);
        process.exit(1);
    }
}

testEmail();