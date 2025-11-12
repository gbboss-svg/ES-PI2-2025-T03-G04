

// ES-PI2-2025-T03-G04-main/db_manager/src/services/StudentService.ts
import oracledb from 'oracledb';

interface StudentData {
    id: number;
    name: string;
}

export class StudentService {
    async addStudentToTurma(connection: oracledb.Connection, turmaId: number, studentData: StudentData) {
        const { id: studentId, name } = studentData;

        try {
            const studentExistsResult = await connection.execute(
                `SELECT Matricula FROM Aluno WHERE Matricula = :studentId`,
                [studentId],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (studentExistsResult.rows && studentExistsResult.rows.length === 0) {
                await connection.execute(
                    `INSERT INTO Aluno (Matricula, Nome) VALUES (:studentId, :name)`,
                    [studentId, name]
                );
            }

            await connection.execute(
                `INSERT INTO Aluno_Turma (Id_Turma, Matricula) VALUES (:turmaId, :studentId)`,
                [turmaId, studentId]
            );

            await connection.commit();

            return { id: studentId, name };
        } catch (error) {
            await connection.rollback();
            console.error("Error adding student to turma:", error);
            throw error;
        }
    }
    
    async batchAddStudentsToTurma(connection: oracledb.Connection, turmaId: number, students: StudentData[]) {
        try {
            const studentUpsertSql = `
                MERGE INTO Aluno a
                USING (SELECT :id AS Matricula, :name AS Nome FROM dual) src
                ON (a.Matricula = src.Matricula)
                WHEN NOT MATCHED THEN
                    INSERT (Matricula, Nome) VALUES (src.Matricula, src.Nome)
                WHEN MATCHED THEN
                    UPDATE SET a.Nome = src.Nome
            `;
            
            const associationInsertSql = `
                INSERT INTO Aluno_Turma (Id_Turma, Matricula)
                SELECT :turmaId, :id FROM dual
                WHERE NOT EXISTS (
                    SELECT 1 FROM Aluno_Turma 
                    WHERE Id_Turma = :turmaId AND Matricula = :id
                )
            `;
    
            const bindDefs = {
                id: { type: oracledb.NUMBER },
                name: { type: oracledb.STRING, maxSize: 255 },
                turmaId: { type: oracledb.NUMBER }
            };
            
            if (students.length > 0) {
                // FIX: Explicitly create bind arrays with only the necessary properties to help with TypeScript type inference for executeMany,
                // which was incorrectly inferring the overload and causing a compile error.
                const studentBinds = students.map(s => ({ id: s.id, name: s.name }));
                const associationBinds = students.map(s => ({ id: s.id, turmaId: turmaId }));
                
                await connection.executeMany(studentUpsertSql, studentBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, name: bindDefs.name } });
                await connection.executeMany(associationInsertSql, associationBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, turmaId: bindDefs.turmaId } });
            }
    
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error("Error batch adding students to turma:", error);
            throw new Error('Erro ao importar alunos em lote.');
        }
    }


    async removeStudentFromTurma(connection: oracledb.Connection, turmaId: number, studentId: number): Promise<void> {
        try {
            const result = await connection.execute(
                `DELETE FROM Aluno_Turma WHERE Id_Turma = :turmaId AND Matricula = :studentId`,
                { turmaId, studentId },
                { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                // This isn't a critical error, maybe the user clicked twice. Just log it.
                console.warn(`Attempted to remove student ${studentId} from turma ${turmaId}, but they were not found.`);
            }
        } catch (error) {
            console.error("Error removing student from turma:", error);
            throw new Error('Erro ao remover aluno da turma.');
        }
    }
    
    // The methods below are placeholders to satisfy compilation for an unused controller (StudentController)
    // and are not part of the active application logic.
    async getAllStudents(userId: number): Promise<any[]> { return []; }
    async getStudentById(id: number, userId: number): Promise<any> { return null; }
    async createStudent(data: any, userId: number): Promise<any> { return {}; }
    async updateStudent(id: number, data: any, userId: number): Promise<any> { return {}; }
    async deleteStudent(id: number, userId: number): Promise<any> { return { success: true }; }
    async getStudentsByTurma(turmaId: number, userId: number): Promise<any[]> { return []; }
}

export default new StudentService();