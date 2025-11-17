import oracledb from 'oracledb';

interface StudentData {
    id: number;
    name: string;
}

export class StudentService {
    /**
     * Adiciona um aluno a uma turma. Se o aluno não existir, ele é criado.
     * Se o aluno já existir, seu nome é atualizado (upsert).
     */
    async addStudentToTurma(connection: oracledb.Connection, turmaId: number, studentData: StudentData) {
        const { id: studentId, name } = studentData;

        try {
            // Usa MERGE para inserir ou atualizar o aluno na tabela ALUNO
            await connection.execute(
                `MERGE INTO Aluno a
                 USING (SELECT :studentId AS Matricula, :name AS Nome FROM dual) src
                 ON (a.Matricula = src.Matricula)
                 WHEN MATCHED THEN UPDATE SET a.Nome = src.Nome
                 WHEN NOT MATCHED THEN INSERT (Matricula, Nome) VALUES (src.Matricula, src.Nome)`,
                { studentId, name },
                { autoCommit: false } // Part of transaction
            );

            // Associa o aluno à turma. A PK/UK na tabela Aluno_Turma previne duplicatas.
            await connection.execute(
                `INSERT INTO Aluno_Turma (Id_Turma, Matricula) VALUES (:turmaId, :studentId)`,
                { turmaId, studentId },
                { autoCommit: false } // Part of transaction
            );

            await connection.commit();
            return { id: studentId, name };
        } catch (error: any) {
            await connection.rollback();
            if (error.errorNum === 1) { // ORA-00001: unique constraint violated on ALUNO_TURMA PK
                console.log(`Student ${studentId} is already in turma ${turmaId}. Name has been updated if different.`);
                return { id: studentId, name }; // Se o objetivo era associar e já está associado, consideramos sucesso.
            }
            console.error("Error adding student to turma:", error);
            throw new Error('Erro ao adicionar aluno à turma.');
        }
    }
    
    /**
     * Adiciona múltiplos alunos a uma turma em uma única transação (lote).
     * Atualiza o nome de alunos existentes.
     */
    async batchAddStudentsToTurma(connection: oracledb.Connection, turmaId: number, students: StudentData[]) {
        try {
            const studentUpsertSql = `
                MERGE INTO Aluno a
                USING (SELECT :id AS Matricula, :name AS Nome FROM dual) src
                ON (a.Matricula = src.Matricula)
                WHEN MATCHED THEN UPDATE SET a.Nome = src.Nome
                WHEN NOT MATCHED THEN INSERT (Matricula, Nome) VALUES (src.Matricula, src.Nome)`;
            
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
                console.log(`Ignoring duplicate entry error during batch student add to turma ${turmaId}. Names have been updated.`);
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
    
    /**
     * Atualiza o nome de um aluno.
     */
    async updateStudent(connection: oracledb.Connection, studentId: number, name: string): Promise<void> {
        try {
            const result = await connection.execute(
                `UPDATE Aluno SET Nome = :name WHERE Matricula = :studentId`,
                { name, studentId },
                { autoCommit: true }
            );
            if (!result.rowsAffected || result.rowsAffected === 0) {
                throw new Error("Aluno não encontrado para atualização.");
            }
        } catch (error) {
            console.error("Error updating student:", error);
            throw new Error('Erro ao atualizar dados do aluno.');
        }
    }
}

export default new StudentService();