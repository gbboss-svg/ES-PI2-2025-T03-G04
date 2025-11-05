import { Router } from 'express';
import ProfessorController from '../controllers/ProfessorController';
import { authMiddleware } from '../middlewares/auth'; // Middleware para proteger rotas

const professorRouter = Router();

professorRouter.get('/instituicoes', authMiddleware, ProfessorController.getInstituicoes);
professorRouter.get('/cursos', authMiddleware, ProfessorController.getCursos);
professorRouter.post('/instituicoes', authMiddleware, ProfessorController.createInstitution);
professorRouter.post('/cursos', authMiddleware, ProfessorController.createCourse);
// Removido: rota POST /associar (método não existe mais no controller)

export { professorRouter };
