
import { Router } from 'express';
import ProfessorController from '../controllers/ProfessorController';
import { authMiddleware } from '../middlewares/auth'; // Middleware para proteger rotas

const professorRouter = Router();

// Rotas para Instituições
professorRouter.get('/instituicoes', authMiddleware, (req, res) => ProfessorController.getInstituicoes(req, res));
professorRouter.post('/instituicoes', authMiddleware, (req, res) => ProfessorController.createInstitution(req, res));
professorRouter.put('/instituicoes/:id', authMiddleware, (req, res) => ProfessorController.updateInstitution(req, res));
professorRouter.delete('/instituicoes/:id', authMiddleware, (req, res) => ProfessorController.deleteInstitution(req, res));


// Rotas para Cursos
professorRouter.get('/cursos', authMiddleware, (req, res) => ProfessorController.getCursos(req, res));
professorRouter.post('/cursos', authMiddleware, (req, res) => ProfessorController.createCourse(req, res));
professorRouter.put('/cursos/:id', authMiddleware, (req, res) => ProfessorController.updateCourse(req, res));
professorRouter.delete('/cursos/:id', authMiddleware, (req, res) => ProfessorController.deleteCourse(req, res));


// Outras rotas do professor
professorRouter.post('/associar', authMiddleware, (req, res) => ProfessorController.associateProfessorToCourse(req, res));
professorRouter.get('/me', authMiddleware, (req, res) => ProfessorController.getProfessorInfo(req, res));
professorRouter.post('/verify-password', authMiddleware, (req, res) => ProfessorController.verifyPassword(req, res));
professorRouter.post('/cursos/:id/access', authMiddleware, (req, res) => ProfessorController.updateCourseAccess(req, res));

export default professorRouter;