const { fork } = require("child_process");
const path = require("path");

console.log("hi", process.cwd());

const webVitalsPath = path.join(process.cwd() + "/lib/index.js");
console.log("wb--->", webVitalsPath);
const child = fork(`${webVitalsPath}`);

child.on("message", (message) => {
  console.log("message", message);
});
