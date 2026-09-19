import { chromium } from "playwright";

/**
 * Script de prueba manual para validar la automatización con Playwright:
 * Selecciona el tipo de documento, rellena el campo y captura la imagen del captcha en base64/buffer.
 */
async function testScraping() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const URL_SENA = 'https://certificados.sena.edu.co/CertificadoDigital/com.sena.consultacer';
    console.log("Navigating...");
    await page.goto(URL_SENA, { waitUntil: 'domcontentloaded' });
    
    console.log("Selecting option...");
    await page.selectOption('select#vTIPO_DOCUMENTO', { value: "CC" });
    
    console.log("Filling document...");
    await page.fill('input#vNUMERO_DOCUMENTO', "12345678");

    console.log("Locating captcha...");
    const captchaBuffer = await page.locator('img#vCAPTCHAIMAGE').screenshot();
    console.log("Success! buffer length:", captchaBuffer.length);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await browser.close();
  }
}

testScraping();

