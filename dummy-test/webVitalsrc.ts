import { IBaseConfig } from "../src/genrateReport/interfaces/baseConfig";

const option: IBaseConfig["option"] = {
  buildPath: "./build",
  puppetter: {
    // lighthouseCollectPath: [
    //   "/dashboard",
    //   "sales-pipeline/accounts",
    //   "/my-policies",
    //   "/leads/active",
    //   "/contacts",
    //   "/accounts",
    //   "/tasks",
    //   "/partners",
    //   "/my-team",
    // ],
    root: "https://app.coveredbysage.com/tasks",
    urls: [
      "/rooms",
      "/book-shelf",
      "/rooms/single-basic",
      "rooms/family-standard",
    ],
    loginCredentionals: {
      userName: "test@test.com",
      password: "password",
    },
    loginSelector: {
      emailFieldSelector: "#email",
      passwordFieldSelector: "#password",
    },
    // puppetterScriptPath: "./lighthouseCli/puppeterScripts.js",
  },
  env: "this is only for testing",

  run: 3,
  //path to puppeteerScript
  //@TODO: make server store reports for diff envs such as dev, qa, and prod. clear reports.
  clearReports: true,
};

module.exports = { option };
