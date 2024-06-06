import puppeteer from "puppeteer";
import fs from "node:fs";
import { downloadPdf } from "./pdf.js";

async function getCatalogs() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.tus.si/#s2');
    await page.setViewport({ width: 1080, height: 1024 });

    const cards = await page.$$('#s2 > div > ul > div > div > li > div');
    const catalogs = [];

    for (const card of cards) {
        const data = await card.evaluate(el => {
            const anchorToSiteElement = el.querySelector('h3 > a');
            const anchorToPdfElement = el.querySelector('figcaption > a.link-icon.solid.pdf');
            const timeElements = el.querySelectorAll('p > time');

            const period = Array.from(timeElements).map(timeElement => {
                return timeElement.innerText;
            })

            return {
                name: anchorToSiteElement.innerText,
                link: anchorToPdfElement.href,
                validityPeriod: period
            }
        }, card);

        catalogs.push(data);
    }

    await browser.close();

    return catalogs;
}

try {
    const catalogs = await getCatalogs();

    await fs.promises.writeFile('catalogs.json', JSON.stringify(catalogs));
    
    for (const catalog of catalogs) {
        await downloadPdf(catalog.link);
    }
} catch (err) {
    console.log(err);
}