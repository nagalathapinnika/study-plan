import { Router, Response, Request } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  res.json(db.subjects);
});

export default router;
