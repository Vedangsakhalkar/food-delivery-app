import { chromium, type Browser } from "@playwright/test";

/** Renders illustrated food images (large emoji on a gradient) to PNG with headless Chromium. */
export async function openRenderer(): Promise<{
  item(emoji: string, colours: [string, string]): Promise<Buffer>;
  cover(name: string, emojis: string[], colours: [string, string]): Promise<Buffer>;
  close(): Promise<void>;
}> {
  const browser: Browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  const font = `'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif`;

  async function shot(html: string, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<body style="margin:0;width:${width}px;height:${height}px;overflow:hidden">${html}</body>`,
    );
    return (await page.screenshot({ type: "png" })) as Buffer;
  }

  return {
    item: (emoji, [a, b]) =>
      shot(
        `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          background:radial-gradient(circle at 30% 25%,${a},${b});position:relative;font-family:${font}">
          <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.28)"></div>
          <div style="position:absolute;width:420px;height:420px;border-radius:50%;border:2px solid rgba(255,255,255,.25)"></div>
          <div style="font-size:190px;line-height:1;filter:drop-shadow(0 10px 14px rgba(0,0,0,.28));position:relative">${emoji}</div></div>`,
        400,
        400,
      ),
    cover: (name, emojis, [a, b]) =>
      shot(
        `<div style="width:100%;height:100%;background:linear-gradient(135deg,${a},${b});position:relative;font-family:${font};color:#fff">
          <div style="position:absolute;right:-60px;top:-80px;width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.18)"></div>
          <div style="position:absolute;left:-80px;bottom:-120px;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,.14)"></div>
          <div style="position:absolute;right:40px;top:50px;font-size:120px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.25))">${emojis[0] ?? ""}</div>
          <div style="position:absolute;right:210px;top:200px;font-size:96px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.25))">${emojis[1] ?? ""}</div>
          <div style="position:absolute;right:50px;top:230px;font-size:84px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.25))">${emojis[2] ?? ""}</div>
          <div style="position:absolute;left:36px;bottom:36px;font:800 52px/1.05 system-ui,sans-serif;text-shadow:0 3px 12px rgba(0,0,0,.35);max-width:330px">${name.replace(/&/g, "&amp;")}</div></div>`,
        600,
        400,
      ),
    close: () => browser.close(),
  };
}
