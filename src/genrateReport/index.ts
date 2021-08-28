import { IBaseConfig } from "./interfaces/baseConfig";

const GatherLighthouseData = async (config: IBaseConfig) => {
  if (!config) {
    throw new Error("Please provide webvitals config file");
  }
  console.log("config", config);
};

export default GatherLighthouseData;
