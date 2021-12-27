#!/usr/bin/env node

import GatherLighthouseData from "./genrateReport";
const path = require("path");
const chalk = require("chalk");
const figlet = require("figlet");
const Commander = require("commander");
require("dotenv").config();

let filePath;
let options: any = {};

const program = new Commander();
program
  .option(
    "-d, --debug",
    "run the cli in debug mode print all the console log errors along with the markdown"
  )
  .option("-h --headfull", "run the lighthouse in browser")
  .option("-r --medianRun <run>", "number of median runs needs to perform");

program.parse(process.argv);
const { headfull = false, medianRun = 3 } = program.opts();

if (process.env.NODE_ENV === "develop") {
  filePath = path.join(process.cwd(), "dummy-test/webVitalsrc.js");
} else {
  filePath = path.join(process.cwd(), "webVitalsrc.js");
}
options = require(filePath);

if (headfull || medianRun) {
  options.headless = headfull;
  options.run = medianRun;
}

interface Error {
  name: string;
  message: string;
  stack?: string;
  stdout?: string;
  stderr?: string;
}

console.log(
  chalk.green(
    figlet.textSync("web vitals ci", {
      height: 10,
      whitespaceBreak: false,
    })
  )
);

GatherLighthouseData(options).catch((error: Error) => {
  process.stderr.write(chalk.red("error while running the cli", error));
  if (error.stdout) process.stderr.write("\n" + error.stdout.slice(0, 4000));
  if (error.stderr) process.stderr.write("\n" + error.stderr);
  process.exit(1);
});
