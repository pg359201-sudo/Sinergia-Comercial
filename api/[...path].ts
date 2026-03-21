import { startServer } from '../server.js';

// Vercel Serverless Function entry point
export default async function (req: any, res: any) {
  const app = await startServer();
  return app(req, res);
}
