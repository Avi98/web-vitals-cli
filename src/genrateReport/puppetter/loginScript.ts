import { IBaseConfig } from "../interfaces/baseConfig";

let counter = 1;
async function login(page: any, context: IBaseConfig) {
  //@TODO this has to be base routes injected by puppetter manager
  const loginUrl = context.option.puppetter.root;
  const {
    loginSelector: { emailFieldSelector = "", passwordFieldSelector = "" },
    loginCredentionals: { password = "", userName = "" },
  } = context.option.puppetter;
  if (!emailFieldSelector || !passwordFieldSelector || !password || !userName)
    return;
  await page.goto(loginUrl);

  await page.waitForSelector(emailFieldSelector);
  await page.type(emailFieldSelector, userName);
  await page.type(passwordFieldSelector, password);
  await page.click("button[type='submit']");
  await page.waitForNavigation();
}

async function setup(browser: any, context: IBaseConfig) {
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
