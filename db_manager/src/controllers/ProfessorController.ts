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
      const { nome, cnpj, endereco } = req.body;
      const professorId = (req as any).user.id;
      const institutionId = await ProfessorService.createInstitution(nome, cnpj, endereco, professorId);
      return res.status(201).json({ id: institutionId, message: 'Instituição criada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      const courseId = await ProfessorService.createCourse(nome);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async associateProfessorToInstitutionCourse(req: Request, res: Response) {
    try {
      const professorId = (req as any).user.id;
      const { institutionId, courseId } = req.body;

      await ProfessorService.associateProfessorToInstitutionCourse(professorId, institutionId, courseId);
      await ProfessorService.updateProfessorFirstAccess(professorId, false); // Marca como não sendo o primeiro acesso

      return res.status(201).json({ message: 'Associação realizada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new ProfessorController();
