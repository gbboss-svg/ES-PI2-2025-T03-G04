  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   */
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ProfessorController from '../controllers/ProfessorController';
import { authMiddleware } from '../middlewares/auth'; // Middleware para proteger rotas

const professorRouter = Router();

// Rotas para Instituições
professorRouter.get('/instituicoes', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.getInstituicoes(req, res));
professorRouter.post('/instituicoes', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.createInstitution(req, res));
professorRouter.put('/instituicoes/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.updateInstitution(req, res));
professorRouter.delete('/instituicoes/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.deleteInstitution(req, res));


// Rotas para Cursos
professorRouter.get('/cursos', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.getCursos(req, res));
professorRouter.post('/cursos', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.createCourse(req, res));
professorRouter.put('/cursos/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.updateCourse(req, res));
professorRouter.delete('/cursos/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.deleteCourse(req, res));


// Outras rotas do professor
professorRouter.post('/associar', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.associateProfessorToCourse(req, res));
professorRouter.get('/me', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.getProfessorInfo(req, res));
professorRouter.post('/verify-password', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.verifyPassword(req, res));
professorRouter.post('/cursos/:id/access', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => ProfessorController.updateCourseAccess(req, res));

export default professorRouter;