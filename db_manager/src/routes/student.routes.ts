  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   *Desevolvido por:Victória Beatriz Nobre Andrade - R.A:25016398
   */
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import StudentController from '../controllers/StudentController';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.put('/students/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => StudentController.update(req, res));

export default router;