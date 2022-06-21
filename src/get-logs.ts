import { promises as fs } from "fs";
import path from "path";
import * as playwright from "playwright";
import { Configuration } from "./configuration";
import { extenderLogData, LogData, routerLogData } from "./constants";

interface DeviceLogs {
  address: string;
  logs: { logType: string; content: string }[];
}

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
  return context.newPage();
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
): Promise<DeviceLogs> {
  const page = await initialize(browser, address);
  await login(page, password);
  const logs: DeviceLogs = { address, logs: [] };
  for (const logFile of logFiles) {
    logs.logs.push({
      logType: logFile.logType,
      content: (await downloadLog(page, logFile)).toString("utf-8"),
    });
  }
  await logout(page);
  await page.context().close();
  return logs;
}

async function writeLogs(logs: DeviceLogs): Promise<void[]> {
  const logDir = path.join("logs", logs.address);
  await fs.mkdir(logDir, { recursive: true });
  if (!logDir) {
    throw new Error("Unable to create logs directory");
  }
  return Promise.all(
    logs.logs.map((log) =>
      fs.writeFile(path.join(logDir, `${log.logType}.log`), log.content)
    )
  );
}

async function allDeviceLogs(
  configuration: Configuration
): Promise<DeviceLogs[]> {
  const browser = await playwright.chromium.launch({ headless: false });
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
    configuration.extenders?.map((extender) =>
      fetchLogs(
        browser,
        extender.address,
        extender.adminPassword ?? configuration.adminPassword,
        extenderLogData
      )
    ) ?? [];
  const devices = await Promise.all([router, ...extenders]);
  browser.close();
  return devices;
}

async function main(): Promise<void> {
  const configuration = JSON.parse(
    (await fs.readFile("fios-logs.config.json")).toString("utf-8")
  );

  await Promise.all((await allDeviceLogs(configuration)).map(writeLogs));
}

main();
