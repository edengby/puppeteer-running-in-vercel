import { NextRequest, NextResponse } from "next/server";

const CHROMIUM_PATH =
  "https://github.com/Sparticuz/chromium/releases/download/v140.0.0/chromium-v140.0.0-pack.x64.tar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getBrowser() {
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteer = (await import("puppeteer-core")).default;

  const executablePath = await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  });
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const target = u.searchParams.get("url") ?? "https://example.com";

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"
    );
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
    const pdf = await page.pdf({ printBackground: true });
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf" } });
  } finally {
    await browser.close();
  }
}
