import { spawnSync } from "child_process";

export const getAuthor = () => {
  const child = spawnSync(
    "git",
    ["log", "--format=%aN <%aE>", "-n", "1", "head"],
    {
      encoding: "utf8",
    }
  );
  if (child.status !== 0) {
    throw new Error(
      "Unable to determine commit author with `git log --format=%aN <%aE> -n 1`. "
    );
  }
  return child.stdout.slice(0, 20);
};

export const getCurrentBranch = () => {
  const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8",
  });

  const branch = typeof result.stdout === "string" && result.stdout.trim();
  if (result.status !== 0 || !branch || branch === "HEAD") {
    throw new Error(
      "Unable to determine current branch with `git rev-parse --abbrev-ref HEAD`. "
    );
  }

  return branch;
};

export const getAllCommits = () => {
  const result = spawnSync("git", ["log", "--format=%s", "-n", "1", "HEAD"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      "Unable to determine commit message with `git log --format=%s -n 1`. "
    );
  }

  return result.stdout.trim().slice(0, 80);
};
