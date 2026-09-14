import { chromium } from "playwright";
import fs from "fs";

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
