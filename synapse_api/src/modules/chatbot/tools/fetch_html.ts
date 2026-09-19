import { chromium } from "playwright";
import fs from "fs";

/**
 * Script de utilidad para descargar y almacenar localmente el HTML de la página de certificados del SENA.
 * Se utiliza para análisis de la estructura DOM y desarrollo del scraper.
 */
async function fetchHTML() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://certificados.sena.edu.co/CertificadoDigital/com.sena.consultacer', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    fs.writeFileSync("sena.html", html);
    console.log("Written to sena.html");
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

fetchHTML();

