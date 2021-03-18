import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import HttpError from './httpError';

const API_PORT = 8000;

const api = express();

api.use(cors());
api.use(express.json({ limit: '50mb' }));
api.use(express.urlencoded({ extended: true, limit: '50mb' }));
api.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});

api.get('/api/helloworld', async (req, res) => {
  const val = await Promise.resolve({});
  res.send(val);
});

// Error handler
api.use(
  (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).send(err.message);
  },
);

api.listen(API_PORT, () =>
  console.log(`Weather Station Service Port: ${API_PORT}`),
);