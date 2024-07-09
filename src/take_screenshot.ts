import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
const { PuppeteerBlocker } = require("@cliqz/adblocker-puppeteer");
const fetch = require("cross-fetch");
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface ScreenshotOptions {
  filename?: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
}

export const takeScreenshot = async (
  url: string,
  {
    filename = "screenshot.png",
    width = 1920,
    height = 1080,
    fullPage = false,
  }: ScreenshotOptions
) => {
  puppeteer.use(StealthPlugin());

  const blocker = await PuppeteerBlocker.fromLists(fetch, [
    "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
  ]);

  puppeteer
    .launch({ headless: true, defaultViewport: null })
    .then(async (browser) => {
      const page = await browser.newPage();
      await blocker.enableBlockingInPage(page);
      await page.setViewport({ width: width, height: height });
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.screenshot({
        type: "png",
        path: filename,
        fullPage: fullPage,
      });
      await browser.close();
    });
};

const main = async () => {
  const argv = yargs(hideBin(process.argv))
    .usage(
      "Usage: $0 <url> [filename] [--width <width>] [--height <height>] [--fullPage]"
    )
    .demandCommand(1, "You need to provide the URL to take a screenshot of.")
    .option("width", { alias: "w", type: "number", default: 1920 })
    .option("height", { alias: "h", type: "number", default: 1080 })
    .option("fullPage", { alias: "f", type: "boolean", default: false })
    .parseSync();

  try {
    await takeScreenshot(argv._[0] as string, {
      filename: argv._[1] as string | undefined,
      width: argv.width as number,
      height: argv.height as number,
      fullPage: argv.fullPage as boolean,
    });
    console.log("Screenshot taken successfully!");
  } catch (error) {
    console.error("Failed to take screenshot:", error);
    process.exit(1);
  }
};

main();
