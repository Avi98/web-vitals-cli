#!/usr/bin/env node
import GatherLighthouseData from "./genrateReport";
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const program = require("commander");

const filePath = path.join(process.cwd(), "webVitalsrc.js");
const options = require(filePath);

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
  process.stderr.write(chalk.red("error while running the cli"));
  if (error.stdout) process.stderr.write("\n" + error.stdout.slice(0, 4000));
  if (error.stderr) process.stderr.write("\n" + error.stderr);
  process.exit(1);
});
