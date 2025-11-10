import { Router } from 'express';
import ProfessorController from '../controllers/ProfessorController';
import { authMiddleware } from '../middlewares/auth'; // Middleware para proteger rotas

const professorRouter = Router();

professorRouter.get('/instituicoes', authMiddleware, (req, res) => ProfessorController.getInstituicoes(req, res));
professorRouter.get('/cursos', authMiddleware, (req, res) => ProfessorController.getCursos(req, res));
professorRouter.post('/instituicoes', authMiddleware, (req, res) => ProfessorController.createInstitution(req, res));
professorRouter.post('/cursos', authMiddleware, (req, res) => ProfessorController.createCourse(req, res));
professorRouter.post('/associar', authMiddleware, (req, res) => ProfessorController.associateProfessorToCourse(req, res));
professorRouter.get('/me', authMiddleware, (req, res) => ProfessorController.getProfessorInfo(req, res));
professorRouter.post('/verify-password', authMiddleware, (req, res) => ProfessorController.verifyPassword(req, res));

export default professorRouter;
