import puppeteer, { Page } from "puppeteer";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import fetch from "cross-fetch";
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const blockCookieBanners = async (page: Page) => {
    const blocker = await PuppeteerBlocker.fromLists(fetch, ["https://secure.fanboy.co.nz/fanboy-cookiemonster.txt"]);
    await blocker.enableBlockingInPage(page);
};

const scroll = (page: Page) => page.evaluate(() =>
    new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            window.scrollBy(0, window.innerHeight);
            if (document.scrollingElement && document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
                window.scrollTo(0, 0);
                clearInterval(interval);
                resolve();
            }
        }, 100);
    })
);

interface ScreenshotOptions {
    filename?: string;
    width?: number;
    height?: number;
    fullPage?: boolean;
}

export const takeScreenshot = async (url: string, { filename = 'screenshot.jpg', width = 1920, height = 1080, fullPage = false }: ScreenshotOptions) => {
    const browser = await puppeteer.launch({ args: ["--no-first-run", "--disable-gpu"], headless: true });
    try {
        const page = await browser.newPage();
        await blockCookieBanners(page);
        await page.setViewport({ width, height, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: 'networkidle2' });
        if (fullPage) await scroll(page);
        const screenshot = await page.screenshot({ type: "jpeg", encoding: "binary", fullPage });
        fs.writeFileSync(filename, screenshot);
        console.log('Screenshot saved to file:', filename);
    } catch (error) {
        console.error('Failed to take screenshot:', error);
        throw error;
    } finally {
        await browser.close();
    }
};

const main = async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 <url> [filename] [--width <width>] [--height <height>] [--fullPage]')
        .demandCommand(1, 'You need to provide the URL to take a screenshot of.')
        .option('width', { alias: 'w', type: 'number', default: 1920 })
        .option('height', { alias: 'h', type: 'number', default: 1080 })
        .option('fullPage', { alias: 'f', type: 'boolean', default: false })
        .parseSync();

    try {
        await takeScreenshot(argv._[0] as string, {
            filename: argv._[1] as string | undefined,
            width: argv.width as number,
            height: argv.height as number,
            fullPage: argv.fullPage as boolean
        });
        console.log('Screenshot taken successfully!');
    } catch (error) {
        console.error('Failed to take screenshot:', error);
        process.exit(1);
    }
};

main();
