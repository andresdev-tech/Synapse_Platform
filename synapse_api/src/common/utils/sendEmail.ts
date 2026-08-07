import nodemailer from "nodemailer";
import { env } from "../../config/env";


export const sendEmail = async (to: string, subject: string, code: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })
    

    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log(
    "MAIL_PASS:",
    process.env.MAIL_PASS ? "CONFIGURADA" : "VACÍA"
    );
    console.log("MAIL_FROM:", process.env.MAIL_FROM);

    const htmlTemplate = `
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <h1>${subject}</h1>
                <hr>
                <p>Este es tu código de verificación: ${code}</p>
                <hr>
                <p>Saludos,</p> 
                <p>El equipo de Synapse</p>
                <hr>
                <p>© 2025 Synapse. Todos los derechos reservados.</p>
            </body>
        </html>
    `
    
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        html: htmlTemplate
    })
    
    return true;

};
