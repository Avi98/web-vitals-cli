export interface ILighthouse {
  userAgent: string;
  lighthouseVersion: string;
  fetchTime: Date;
  requestedUrl: string;
  finalUrl: string;
  runWarnings: any[];
  audits: IAudits;
}

interface IAudits {
  ["largest-contentful-paint"]: any;
  ["max-potential-fid"]: any;
  ["cumulative-layout-shift"]: any;
}
