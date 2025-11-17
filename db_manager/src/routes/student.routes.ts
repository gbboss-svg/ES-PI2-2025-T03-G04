import express from 'express';
import StudentController from '../controllers/StudentController';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.put('/students/:id', authMiddleware, (req: express.Request, res: express.Response) => StudentController.update(req, res));

export default router;