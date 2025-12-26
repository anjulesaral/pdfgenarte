import puppeteer from "puppeteer";
import fs from "fs";
import type { Request, Response } from "express";
import { getDirectDownloadLink, resolveBitlyLink } from "../helper/helper.ts";
import { downloadFile } from "../helper/downloadFile.ts";

const data= [
        {
            "topic": "Chapter",
            "url": null
        },
        {
            "topic": "Application of Derivative",
            "url": "https://bit.ly/2U29roC"
        },
        {
            "topic": "Area",
            "url": "https://bit.ly/3jCgo8O"
        },
        {
            "topic": "Binomial Theorem",
            "url": "https://bit.ly/3jCfnNW"
        },
        {
            "topic": "Circle",
            "url": "https://bit.ly/2VDm9eq"
        },
        {
            "topic": "Complex Number",
            "url": "https://bit.ly/3yCEOoM"
        },
        {
            "topic": "Continuity and Differentiability",
            "url": "https://bit.ly/3s5sACY"
        },
        {
            "topic": "Definite Integration",
            "url": "https://bit.ly/3yuaxIR"
        },
        {
            "topic": "Determinants",
            "url": "https://bit.ly/37vDlF6"
        },
        {
            "topic": "Differential Equation",
            "url": "https://bit.ly/2VD3NKw"
        },
        {
            "topic": "Ellipse",
            "url": "https://bit.ly/2U29r86"
        },
        {
            "topic": "Function",
            "url": "https://bit.ly/3iw3mKv"
        },
        {
            "topic": "Heights and Distances",
            "url": "https://bit.ly/2X07bPR"
        },
        {
            "topic": "Hyperbola",
            "url": "https://bit.ly/3CwsdGc"
        },
        {
            "topic": "Inverse Trigonometric Functions",
            "url": "https://bit.ly/3xEQl60"
        },
        {
            "topic": "Limit",
            "url": "https://bit.ly/37vbCUQ"
        },
        {
            "topic": "Mathematical Induction",
            "url": "https://bit.ly/3CttJJ7"
        },
        {
            "topic": "Mathematical Reasoning",
            "url": "https://bit.ly/3AnvqWE"
        },
        {
            "topic": "Matrices",
            "url": "https://bit.ly/3lMEQXO"
        },
        {
            "topic": "Pair of Lines",
            "url": "https://bit.ly/3Anvx4w"
        },
        {
            "topic": "Parabola",
            "url": "https://bit.ly/3jwCTMk"
        },
        {
            "topic": "Permutation Combination",
            "url": "https://bit.ly/37uHGZ4"
        },
        {
            "topic": "Probability",
            "url": "https://bit.ly/3Cwlf48"
        },
        {
            "topic": "Properties of Triangles",
            "url": "https://bit.ly/3jy24hw"
        },
        {
            "topic": "Quadratic Equation",
            "url": "https://bit.ly/37u1ls5"
        },
        {
            "topic": "Sequences and Series",
            "url": "https://bit.ly/3ApAl9x"
        },
        {
            "topic": "Sets and Relations",
            "url": "https://bit.ly/3CyERVe"
        },
        {
            "topic": "Statistics",
            "url": "https://bit.ly/3CwlzzL"
        },
        {
            "topic": "Straight Lines",
            "url": "https://bit.ly/3yBDAdo"
        },
        {
            "topic": "Three Dimensional Geometry",
            "url": "https://bit.ly/3lM3JTp"
        },
        {
            "topic": "Trigonometric Equations",
            "url": "https://bit.ly/2U9qR2U"
        },
        {
            "topic": "Trigonometric Ratios & Identities",
            "url": "https://bit.ly/3Cs7Ee9"
        },
        {
            "topic": "Vector Algebra",
            "url": "https://bit.ly/3fLUq20"
        }
    ]

export const fetchHTML = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const data = await page.evaluate(() => {
      const input = document.querySelector(
        "#form_name"
      ) as HTMLInputElement | null;

      return {
        course_name: input?.value ?? null,
      };
    });

    await browser.close();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Scraping failed",
    });
  }
};

export const fetchPYQ = async (req: Request, res: Response) => {
  try {
    const url =
      "https://www.mathongo.com/iit-jee/jee-main-maths-chapter-wise-questions-with-solutions-july-2021";

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tr"));

      return rows
        .map((row) => {
          const cols = row.querySelectorAll("td");

          if (cols.length < 2) return null;

          const topic = cols[0]?.textContent?.trim() || null;
          const linkEl = cols[1]?.querySelector("a");

          return {
            topic,
            url: linkEl?.getAttribute("href") || null,
          };
        })
        .filter(Boolean); // remove null rows
    });

    await browser.close();

    return res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Scraping failed",
    });
  }
};


export const downloadPYQs = async (req: Request, res: Response) => {
  if (!fs.existsSync("downloads")) {
    fs.mkdirSync("downloads");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (const item of data) {
    if (!item.url) continue;

    console.log(`🔹 Processing: ${item.topic}`);

    // 1️⃣ Resolve bit.ly → Drive
    const driveUrl = await resolveBitlyLink(item.url);
    if (!driveUrl) {
      console.log("❌ Drive link not found");
      continue;
    }

    // 2️⃣ Drive → Direct download
    const downloadUrl = getDirectDownloadLink(driveUrl);
    if (!downloadUrl) {
      console.log("❌ Invalid drive URL");
      continue;
    }

    // 3️⃣ Download file
    const safeName = item.topic.replace(/[^\w\s]/g, "").replace(/\s+/g, "_");
    await downloadFile(downloadUrl, `${safeName}.pdf`);

    console.log(`✅ Downloaded: ${item.topic}`);
  }

  await browser.close();
};

expo