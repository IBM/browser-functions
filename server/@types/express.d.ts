export {};
declare global {
  namespace Express {
    export interface Request {
      applicationId?: string;
    }
  }
}
