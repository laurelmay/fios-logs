import fs from "fs";
import path from "path";
import * as playwright from "playwright";
import { Configuration } from "./configuration";
import { extenderLogData, LogData, routerLogData } from "./constants";

async function initialize(
  browser: playwright.Browser,
  host: string
): Promise<playwright.Page> {
  const context = await browser.newContext({
    baseURL: `https://${host}`,
    // It's non-trivial to specify a specific server certificate. So it's easier
    // to just ignore HTTP errors generally. That's not great to do but we're just
    // connecting to a single host.
    ignoreHTTPSErrors: true,
  });
  return await context.newPage();
}

async function login(page: playwright.Page, password: string) {
  await page.goto("/#/login");
  const passwordField = page.locator('input[type="password"]');
  await passwordField.fill(password);
  await passwordField.press("Enter");
  await page.waitForNavigation();
}

async function logout(page: playwright.Page) {
  await page.goto("/#/");
  await page.locator("#userIcon").click();
  await page.locator("text=Sign Out").click();
  await page.waitForNavigation();
}

async function downloadLog(
  page: playwright.Page,
  log: LogData
): Promise<Buffer> {
  await page.goto(log.webUiPath);
  const sysLogResponse = await page.waitForResponse((response) =>
    response.url().endsWith(log.requestPath)
  );
  return await sysLogResponse.body();
}

async function fetchLogs(
  browser: playwright.Browser,
  address: string,
  password: string,
  logFiles: LogData[]
): Promise<void> {
  const gatewayLogDir = path.join("logs", address);
  fs.mkdirSync(gatewayLogDir, { recursive: true });
  const page = await initialize(browser, address);
  await login(page, password);
  for (const logFile of logFiles) {
    const log = await downloadLog(page, logFile);
    fs.writeFileSync(path.join(gatewayLogDir, `${logFile.logType}.log`), log);
  }
  await logout(page);
  await page.context().close();
}

(async () => {
  const browser = await playwright.chromium.launch();
  const configuration = JSON.parse(
    fs.readFileSync("fios-logs.config.json").toString("utf-8")
  ) as Configuration;

  // Allow each device to run in parallel. It seems like there are issues when various logs are requested in
  // parallel on the same device; each log gets truncate oddly if it is successfully fetched at all. Without
  // refactoring the process for how logs are requested in the first place, parallelizing at the device level
  // if the easiest thing to do. This is probably a bit safer anyway so that no more than one session happens
  // at a time to prevent lockouts as well.
  const router = fetchLogs(
    browser,
    configuration.gatewayAddress ?? "myfiosgateway.com",
    configuration.adminPassword,
    routerLogData
  );
  const extenders =
    configuration.extenderAddresses?.map((address) =>
      fetchLogs(browser, address, configuration.adminPassword, extenderLogData)
    ) ?? [];
  await Promise.all([router, ...extenders]);

  browser.close();
})();
