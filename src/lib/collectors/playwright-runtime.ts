/** Vercel / serverless 无法运行 Playwright + Chromium */
export const PLAYWRIGHT_UNSUPPORTED_MESSAGE =
  "浏览器采集仅支持本地运行。请在电脑上执行 npm run dev，打开 /admin/sync 进行同步；或使用 npm run sync:db / npm run sync:evo。";

export function isPlaywrightUnsupported(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.PLAYWRIGHT_DISABLE === "1"
  );
}

export function assertPlaywrightSupported(): void {
  if (isPlaywrightUnsupported()) {
    throw new Error(PLAYWRIGHT_UNSUPPORTED_MESSAGE);
  }
}

export async function importPlaywright() {
  assertPlaywrightSupported();
  try {
    return await import("playwright");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Cannot find module") ||
      message.includes("browsers.json") ||
      message.includes("Executable doesn't exist")
    ) {
      throw new Error(PLAYWRIGHT_UNSUPPORTED_MESSAGE);
    }
    throw error;
  }
}

export function formatPlaywrightError(error: unknown): string {
  if (!(error instanceof Error)) return PLAYWRIGHT_UNSUPPORTED_MESSAGE;
  const message = error.message;
  if (
    message === PLAYWRIGHT_UNSUPPORTED_MESSAGE ||
    message.includes("browsers.json") ||
    message.includes("Cannot find module 'playwright") ||
    message.includes("Executable doesn't exist")
  ) {
    return PLAYWRIGHT_UNSUPPORTED_MESSAGE;
  }
  return message;
}
