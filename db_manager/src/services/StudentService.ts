import oracledb from 'oracledb';

interface StudentData {
    id: number;
    name: string;
}

export class StudentService {
    /**
     * Adiciona um aluno a uma turma.
     */
    async addStudentToTurma(connection: oracledb.Connection, turmaId: number, studentData: StudentData) {
        const { id: studentId, name } = studentData;

        try {
            await connection.execute(
                `MERGE INTO Aluno a
                 USING (SELECT :studentId AS Matricula, :name AS Nome FROM dual) src
                 ON (a.Matricula = src.Matricula)
                 WHEN NOT MATCHED THEN INSERT (Matricula, Nome) VALUES (src.Matricula, src.Nome)
                 WHEN MATCHED THEN UPDATE SET a.Nome = src.Nome`,
                { studentId, name }
            );

            await connection.execute(
                `INSERT INTO Aluno_Turma (Id_Turma, Matricula)
                 SELECT :turmaId, :studentId FROM dual
                 WHERE NOT EXISTS (SELECT 1 FROM Aluno_Turma WHERE Id_Turma = :turmaId AND Matricula = :studentId)`,
                { turmaId, studentId }
            );

            await connection.commit();
            return { id: studentId, name };
        } catch (error: any) {
            await connection.rollback();
            if (error.errorNum === 1) {
                console.log(`Student ${studentId} already in turma ${turmaId}. Ignoring duplicate entry.`);
            } else {
                console.error("Error adding student to turma:", error);
                throw error;
            }
        }
    }
    
    /**
     * Adiciona múltiplos alunos a uma turma em uma única transação (lote).
     */
    async batchAddStudentsToTurma(connection: oracledb.Connection, turmaId: number, students: StudentData[]) {
        try {
            const studentUpsertSql = `
                MERGE INTO Aluno a
                USING (SELECT :id AS Matricula, :name AS Nome FROM dual) src
                ON (a.Matricula = src.Matricula)
                WHEN NOT MATCHED THEN INSERT (Matricula, Nome) VALUES (src.Matricula, src.Nome)
                WHEN MATCHED THEN UPDATE SET a.Nome = src.Nome`;
            
            const associationInsertSql = `
                INSERT INTO Aluno_Turma (Id_Turma, Matricula)
                SELECT :turmaId, :id FROM dual
                WHERE NOT EXISTS (SELECT 1 FROM Aluno_Turma WHERE Id_Turma = :turmaId AND Matricula = :id)`;
    
            const bindDefs = {
                id: { type: oracledb.NUMBER },
                name: { type: oracledb.STRING, maxSize: 255 },
                turmaId: { type: oracledb.NUMBER }
            };
            
            if (students.length > 0) {
                const studentBinds = students.map(s => ({ id: s.id, name: s.name }));
                const associationBinds = students.map(s => ({ id: s.id, turmaId: turmaId }));
                
                await connection.executeMany(studentUpsertSql, studentBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, name: bindDefs.name } });
                await connection.executeMany(associationInsertSql, associationBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, turmaId: bindDefs.turmaId } });
            }
    
            await connection.commit();
        } catch (error: any) {
            await connection.rollback();
            if (error.errorNum === 1) {
                console.log(`Ignoring duplicate entry error during batch student add to turma ${turmaId}.`);
            } else {
                console.error("Error batch adding students to turma:", error);
                throw new Error('Erro ao importar alunos em lote.');
            }
        }
    }

    /**
     * Remove um aluno de uma turma.
     */
    async removeStudentFromTurma(connection: oracledb.Connection, turmaId: number, studentId: number): Promise<void> {
        try {
            await connection.execute(
                `DELETE FROM Aluno_Turma WHERE Id_Turma = :turmaId AND Matricula = :studentId`,
                { turmaId, studentId },
                { autoCommit: false }
            );

            const checkEnrollmentResult = await connection.execute<[number]>(
                `SELECT COUNT(*) AS count FROM Aluno_Turma WHERE Matricula = :studentId`,
                { studentId }
            );

            const enrollmentCount = checkEnrollmentResult.rows && checkEnrollmentResult.rows.length > 0 ? checkEnrollmentResult.rows[0][0] : 0;

            if (enrollmentCount === 0) {
                await connection.execute(
                    `DELETE FROM Aluno WHERE Matricula = :studentId`,
                    { studentId },
                    { autoCommit: false }
                );
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            console.error("Error removing student from turma:", error);
            throw new Error('Erro ao remover aluno da turma.');
        }
    }
}

export default new StudentService();