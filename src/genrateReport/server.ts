import path from "path";
import chalk from "chalk";
import express from "express";
import compression from "compression";
import { createServer } from "http";

import { IBaseConfig } from "../interfaces/IBaseConfig";

interface IStaticServer {
  listen: () => void;
  close: () => void;
}
class StaticServer implements IStaticServer {
  pathToBuildDir: string;
  port: number;
  app: ReturnType<typeof express>;
  server: ReturnType<typeof createServer> | null;

  constructor({
    pathToBuildDir,
    options,
  }: {
    pathToBuildDir: string;
    options: IBaseConfig;
  }) {
    this.pathToBuildDir = pathToBuildDir;
    this.app = express();
    this.app.use(compression());
    this.app.use("/", express.static(this.pathToBuildDir));
    this.app.use("/*", (req, res) =>
      res.sendFile(path.join(this.pathToBuildDir + "/index.html"))
    );

    this.server = null;
    this.port = 0;
  }

  get portNumber() {
    return this.port;
  }

  listen() {
    const server = createServer(this.app);
    this.server = server;
    const port = process.env.NODE_ENVIORNMENT === "develop" ? 3000 : 0;
    server.listen(port, () => {
      const serverAddress = this.server?.address();
      if (serverAddress && typeof serverAddress !== "string") {
        this.port = serverAddress.port;
        process.stdout.write(
          chalk.green(`Server start at ${serverAddress.port} \n`)
        );
      }
    });
  }

  close() {
    const server = this.server;
    if (!server) return;

    process.stdout.write(chalk.yellow("closing server \n"));
    server.close();
  }
}

export default StaticServer;
