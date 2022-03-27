import { IBaseConfig } from "../../interfaces/IBaseConfig";

let counter = 1;
async function login(page: any, context: IBaseConfig & { url: string }) {
  //@TODO this has to be base routes injected by puppetter manager
  const loginUrl = context.url;
  const {
    loginSelector: { emailFieldSelector = "", passwordFieldSelector = "" },
    loginCredentials: { password, userName },
  } = context.option.puppeteer;
  if (!emailFieldSelector || !passwordFieldSelector || !password || !userName)
    return;
  await page.goto(loginUrl);
  await page.setDefaultNavigationTimeout(0);

  await page.waitForSelector(emailFieldSelector);
  await page.type(emailFieldSelector, userName);
  await page.type(passwordFieldSelector, password);
  await page.click("button[type='submit']");
  await page.waitForNavigation();
}

async function setup(browser: any, context: IBaseConfig & { url: string }) {
  // launch browser for LHCI
  const page = await browser.newPage();
  if (counter === 1) {
    await login(page, context);
  } else {
  }
  // close session for next run
  // await page.close();
  counter++;
}

export default setup;
