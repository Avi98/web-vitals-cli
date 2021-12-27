import fs from "fs";
import path from "path";
import { IBaseConfig } from "../interfaces/IBaseConfig";
import { BASE_REPORT_DIR } from "../utils/consts";
import { ILighthouse } from "../interfaces/IReport";

type AuditMetricsType = Partial<keyof ILighthouse["audits"]>[];

interface IGenerateReport {
  createMarkdownTable: (url: string) => void;
}

type IGetWebVitalsAndAudits = { path: string } & ILighthouse["audits"];

const reportPath = path.join(process.cwd(), BASE_REPORT_DIR);
export class GenerateReport implements IGenerateReport {
  options: IBaseConfig;
  auditReport: [] | IGetWebVitalsAndAudits[];
  markdownComment: string;

  constructor(options: IBaseConfig) {
    this.options = options;
    this.auditReport = [];
    this.markdownComment = "";
  }

  private files(): string[] {
    const reportFileList = fs.readdirSync(reportPath);

    return reportFileList;
  }

  private ciOptions(): AuditMetricsType | null {
    if (this.options.option.ci) {
      const webVitalsAudits = [
        "largest-contentful-paint",
        "max-potential-fid",
        "cumulative-layout-shift",
      ];

      const configMetric = this.options.option.ci?.audits || [];

      return [...configMetric, ...webVitalsAudits].filter(
        (auditMetric) => auditMetric
      ) as unknown as AuditMetricsType;
    }
    return null;
  }
  fetchJsonReport() {}
  get mdComment(): string {
    return this.markdownComment;
  }

  get tableHeader(): string {
    let table = `
    ## Web Vitals report
    <details opened>
    
    <summary>Click here to open results 📉</summary>
    
    | Path      | CLS   | LCP | FID |
    | --------- | ----- | --- | --- |
    
  `;
    return table;
  }

  private setReportData(
    url: string,
    filesList: string[]
  ): IGetWebVitalsAndAudits[] {
    filesList.forEach((filePath) => {
      const auditMetrics = this.ciOptions?.();
      if (!auditMetrics) return null;
      const reportFile = path.join(reportPath, filePath);
      const LHReportBuffer = fs.readFileSync(reportFile);
      const LHReport: ILighthouse = JSON.parse(LHReportBuffer.toString());

      this.auditReport.push(
        //@ts-expect-error
        this.getWebVitalsAndAudits(url, LHReport.audits, auditMetrics)
      );
    });
    return this.auditReport;
  }

  private getWebVitalsAndAudits(
    url: string,
    LHAudit: ILighthouse["audits"],
    auditMetrics: AuditMetricsType
  ): IGetWebVitalsAndAudits[] {
    const obj = auditMetrics.reduce((acc, pre) => {
      return {
        ...acc,
        [pre]: LHAudit[pre],
      };
    }, {});
    return {
      //@ts-expect-error
      path: url,
      ...obj,
    };
  }

  createMarkdownTable(url: string): void {
    let table = this.tableHeader;
    const fileList = this.files();
    const report = this.setReportData(url, fileList);

    if (!this.ciOptions() || !report) return;
    report.forEach((report) => {
      table += `
    | ${report.path} | ${report["cumulative-layout-shift"].score} | ${report["largest-contentful-paint"].score} | ${report["max-potential-fid"].score}
    `;
    });

    table += `</details>`;
    this.markdownComment = table;
  }
}
