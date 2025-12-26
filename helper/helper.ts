import puppeteer from "puppeteer";

 const resolveBitlyLink = async (
  shortUrl: string
): Promise<string | null> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
  );

  await page.goto(shortUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // ⏳ Wait up to 10s for either redirect OR button
  const driveUrl = await Promise.race([
    // CASE 1: Button appears
    page
      .waitForSelector("a.preview__continue", { timeout: 10000 })
      .then(() =>
        page.evaluate(() => {
          const el = document.querySelector(
            "a.preview__continue"
          ) as HTMLAnchorElement | null;
          return el?.href || null;
        })
      )
      .catch(() => null),

    // CASE 2: Auto redirect happens
    page.waitForFunction(
      () => location.href.includes("drive.google.com"),
      { timeout: 10000 }
    ).then(() => page.url()),
  ]);

  await browser.close();
  return driveUrl;
};



const getDirectDownloadLink = (driveUrl: string) => {
  const match = driveUrl.match(/\/d\/([^/]+)/);
  if (!match) return null;

  const fileId = match[1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

export { resolveBitlyLink, getDirectDownloadLink };
