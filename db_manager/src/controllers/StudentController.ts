import express from 'express';
import StudentService from '../services/StudentService';
import AuthService from '../services/AuthService';
import oracledb from 'oracledb';

class StudentController {
    // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
    private getDbConnection(req: express.Request): oracledb.Connection {
        if (!req.dbConnection) {
            throw new Error('Database connection not found in request.');
        }
        return req.dbConnection;
    }

    // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
    async update(req: express.Request, res: express.Response) {
        try {
            const connection = this.getDbConnection(req);
            const professorId = req.user!.id;
            const studentId = parseInt(req.params.id, 10);
            const { name, turmaId } = req.body;

            if (!name || !turmaId) {
                return res.status(400).json({ message: 'Nome e ID da turma são obrigatórios.' });
            }
            
            // Verifica se o professor tem permissão para editar o aluno nesta turma.
            const permissionResult = await connection.execute(
                `SELECT COUNT(*) AS count
                 FROM Turma t
                 JOIN Professor_Disciplina pd ON t.Id_Disciplina = pd.Id_Disciplina
                 JOIN Aluno_Turma at ON t.Id_Turma = at.Id_Turma
                 WHERE at.Matricula = :studentId AND t.Id_Turma = :turmaId AND pd.Id_Professor = :professorId`,
                { studentId, turmaId, professorId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const permissionRow = permissionResult.rows?.[0] as any;
            if (!permissionRow || permissionRow.COUNT === 0) {
                return res.status(403).json({ message: 'Permissão negada para editar este aluno nesta turma.' });
            }
            
            // Atualiza o nome do aluno.
            await StudentService.updateStudent(connection, studentId, name);

            return res.status(200).json({ message: 'Aluno atualizado com sucesso!' });

        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default new StudentController();