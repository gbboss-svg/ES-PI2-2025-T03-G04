

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import StudentService from '../services/StudentService';
import AuthService from '../services/AuthService';
import oracledb from 'oracledb';

class StudentController {
    private getDbConnection(req: ExpressRequest): oracledb.Connection {
        if (!req.dbConnection) {
            throw new Error('Database connection not found in request.');
        }
        return req.dbConnection;
    }

    async update(req: ExpressRequest, res: ExpressResponse) {
        try {
            const connection = this.getDbConnection(req);
            const professorId = req.user!.id;
            const oldStudentId = parseInt(req.params.id, 10);
            const { name, matricula, turmaId, password } = req.body;

            if (!name || !turmaId || !matricula || !password) {
                return res.status(400).json({ message: 'Nome, matrícula, ID da turma e senha são obrigatórios.' });
            }
            const newStudentId = parseInt(matricula, 10);
            if(isNaN(newStudentId)) {
                return res.status(400).json({ message: 'A matrícula deve ser um número.' });
            }

            // 1. Validar a senha do professor
            const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Senha incorreta.' });
            }
            
            // 2. Verifica se o professor tem permissão para editar o aluno nesta turma.
            const permissionResult = await connection.execute(
                `SELECT COUNT(*) AS count
                 FROM Turma t
                 JOIN Professor_Disciplina pd ON t.Id_Disciplina = pd.Id_Disciplina
                 JOIN Aluno_Turma at ON t.Id_Turma = at.Id_Turma
                 WHERE at.Matricula = :oldStudentId AND t.Id_Turma = :turmaId AND pd.Id_Professor = :professorId`,
                { oldStudentId, turmaId, professorId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const permissionRow = permissionResult.rows?.[0] as any;
            if (!permissionRow || permissionRow.COUNT === 0) {
                return res.status(403).json({ message: 'Permissão negada para editar este aluno nesta turma.' });
            }
            
            // 3. Atualiza os dados do aluno.
            await StudentService.updateStudent(connection, oldStudentId, newStudentId, name);

            return res.status(200).json({ message: 'Aluno atualizado com sucesso!' });

        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default new StudentController();