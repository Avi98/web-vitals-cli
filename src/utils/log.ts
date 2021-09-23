import chalk from "chalk";

export enum messageTypeEnum {
  ERROR = "red",
  SUCCESS = "green",
  MESSAGE = "yellow",
  info = "white",
}

type log = (message: string, type?: messageTypeEnum) => void;
export const log: log = (message, type = messageTypeEnum.info) =>
  process.stdout.write(chalk[type](`${message} \n`));
