import fs from "fs";
import path from "path";
import { spawn, spawnSync } from "child_process";
import { IBaseConfig } from "../interfaces/baseConfig";
import { BASE_REPORT_DIR } from "../utils/consts";
import {
  getAuthor,
  getCurrentBranch,
  getAllCommits,
  getCurrentHash,
} from "./gitData";

/**
 * git user, user commit hash, traget branch, current branch,
 */
const getGitData = () => {
  const author = getAuthor();
  const currentBranch = getCurrentBranch();
  const commits = getAllCommits();
  const hash = getCurrentHash();

  return {
    author,
    currentBranch,
    commits,
    hash,
  };
};

/**
 * save to server
 */
const saveBuilds = () => {};

/**
 * create a build payload and save it
 */
const createBuildPayload = () => {};

const baseDir = path.join(process.cwd(), BASE_REPORT_DIR);
/**
 * @params {IBaseOptions} base options
 *
 * read report files,
 * get git user, branch, branch author, target branch
 * use isomorphic-fetch to post request to server
 */
export const uploadReports = (options?: IBaseConfig) => {
  const lighthouseReport = fs.readdirSync(baseDir);

  for (const report of lighthouseReport) {
    console.log("report", report);
  }
  console.log("git data", getGitData());
};
