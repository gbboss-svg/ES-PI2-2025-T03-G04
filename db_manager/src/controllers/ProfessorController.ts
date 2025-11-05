import { Request, Response } from 'express';
import ProfessorService from '../services/ProfessorService';

class ProfessorController {
  async getInstituicoes(req: Request, res: Response) {
    try {
      const professorId = (req as any).user.id; // Assumindo que o ID do usuário está no request
      const instituicoes = await ProfessorService.getInstituicoes(professorId);
      return res.status(200).json(instituicoes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getCursos(req: Request, res: Response) {
    try {
      const professorId = (req as any).user.id; // Assumindo que o ID do usuário está no request
      const cursos = await ProfessorService.getCursos(professorId);
      return res.status(200).json(cursos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createInstitution(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      const institutionId = await ProfessorService.createInstitution(nome);
      return res.status(201).json({ id: institutionId, message: 'Instituição criada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const { nome, idInstituicao } = req.body;
      const courseId = await ProfessorService.createCourse(nome, idInstituicao);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Removido: método de associação professor-instituição-curso, pois não existe mais no SQL
}

export default new ProfessorController();
