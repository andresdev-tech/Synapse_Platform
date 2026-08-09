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
            <main style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center;">

                <div style="max-width: 500px; width: 100%; margin: 0 auto; background-color: #0d47a1; color: #ffffff; border-radius: 12px; padding: 40px 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.15); box-sizing: border-box;">
            
                <h1 style="font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600; line-height: 1.4;">
                    ${subject ? ` ${subject}` : 'El siguiente código es para la verificación de tu cuenta'}
                </h1>
            
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px; color: #e3f2fd;">
                    Si usted no pidió el código, por favor ignore este correo o contáctenos en <a href="mailto:soporte@synapseplatform.com" style="color: #ffffff; text-decoration: underline;">soporte@synapseplatform.com</a>.
                </p>
                
                <div style="background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; display: inline-block; font-size: 26px; font-weight: bold; letter-spacing: 2px; padding: 12px 30px; margin: 10px 0 25px 0; color: #ffffff;">
                    ${code}
                </div>
                
                <p style="font-size: 14px; margin-bottom: 25px; color: #e3f2fd; opacity: 0.9;">
                    El código expira en 10 minutos.
                </p>
                
                <div style="font-size: 13px; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 20px; margin-top: 25px; color: #bbdefb; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                    Gracias por usar SYNAPSE PLATFORM
                </div>
    
                </div>
    
            </main>
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
