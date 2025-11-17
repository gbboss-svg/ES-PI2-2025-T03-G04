import oracledb from 'oracledb';

interface StudentData {
    id: number;
    name: string;
    grades?: { [key: string]: number | null };
}

interface NewComponentData {
    name: string;
    acronym: string;
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
     * Adiciona múltiplos alunos a uma turma em uma única transação (lote), incluindo suas notas.
     */
    async batchAddStudentsToTurma(connection: oracledb.Connection, turmaId: number, students: StudentData[], newComponents?: NewComponentData[]) {
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
                // Upsert dos componentes de nota, se houver novos.
                if (newComponents && newComponents.length > 0) {
                    const disciplineIdResult = await connection.execute<{ ID_DISCIPLINA: number }>(
                        `SELECT Id_Disciplina FROM Turma WHERE Id_Turma = :turmaId`,
                        { turmaId },
                        { outFormat: oracledb.OUT_FORMAT_OBJECT }
                    );

                    if (!disciplineIdResult.rows || disciplineIdResult.rows.length === 0) {
                        throw new Error('Disciplina associada à turma não encontrada.');
                    }
                    const disciplineId = disciplineIdResult.rows[0].ID_DISCIPLINA;

                    const upsertComponentSql = `
                        MERGE INTO Componente_Nota cn
                        USING (SELECT :acronym AS Sigla, :name AS Nome, :disciplineId AS Id_Disciplina FROM dual) src
                        ON (cn.Id_Disciplina = src.Id_Disciplina AND cn.Sigla = src.Sigla)
                        WHEN MATCHED THEN UPDATE SET cn.Nome = src.Nome
                        WHEN NOT MATCHED THEN INSERT (Id_Disciplina, Nome, Sigla) VALUES (src.Id_Disciplina, src.Nome, src.Sigla)
                    `;

                    const componentBinds = newComponents.map(comp => ({
                        acronym: comp.acronym,
                        name: comp.name,
                        disciplineId: disciplineId
                    }));

                    await connection.executeMany(upsertComponentSql, componentBinds, { autoCommit: false });
                }

                const studentBinds = students.map(s => ({ id: s.id, name: s.name }));
                const associationBinds = students.map(s => ({ id: s.id, turmaId: turmaId }));
                
                await connection.executeMany(studentUpsertSql, studentBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, name: bindDefs.name } });
                await connection.executeMany(associationInsertSql, associationBinds, { autoCommit: false, bindDefs: { id: bindDefs.id, turmaId: bindDefs.turmaId } });

                // Processamento de Notas
                const componentsResult = await connection.execute(
                    `SELECT Id_Comp, Sigla FROM Componente_Nota 
                     WHERE Id_Disciplina = (SELECT Id_Disciplina FROM Turma WHERE Id_Turma = :turmaId)`,
                    { turmaId },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                const componentMap = new Map<string, number>();
                if (componentsResult.rows) {
                    (componentsResult.rows as any[]).forEach(row => {
                        componentMap.set(row.SIGLA.toLowerCase(), row.ID_COMP);
                    });
                }

                const gradeUpsertSql = `
                    MERGE INTO NOTAS n
                    USING (SELECT :turmaId AS Id_Turma, :studentId AS Matricula, :componentId AS Id_Comp, :gradeValue AS Pontuacao FROM dual) src
                    ON (n.Id_Turma = src.Id_Turma AND n.Matricula = src.Matricula AND n.Id_Comp = src.Id_Comp)
                    WHEN MATCHED THEN UPDATE SET n.Pontuacao = src.Pontuacao
                    WHEN NOT MATCHED THEN INSERT (Id_Turma, Matricula, Id_Comp, Pontuacao) VALUES (src.Id_Turma, src.Matricula, src.Id_Comp, src.Pontuacao)`;

                const gradeBinds: any[] = [];
                for (const student of students) {
                    if (student.grades && Object.keys(student.grades).length > 0) {
                        for (const acronym in student.grades) {
                            const componentId = componentMap.get(acronym.toLowerCase());
                            const gradeValue = student.grades[acronym];

                            if (componentId !== undefined && gradeValue !== null) {
                                gradeBinds.push({ turmaId, studentId: student.id, componentId, gradeValue: gradeValue });
                            }
                        }
                    }
                }

                if (gradeBinds.length > 0) {
                    await connection.executeMany(gradeUpsertSql, gradeBinds, { autoCommit: false });
                }
            }
    
            await connection.commit();
        } catch (error: any) {
            await connection.rollback();
            console.error("Error batch adding students to turma:", error);
            throw new Error('Erro ao importar alunos em lote.');
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
     * Atualiza o nome e/ou a matrícula de um aluno.
     */
    async updateStudent(connection: oracledb.Connection, oldStudentId: number, newStudentId: number, name: string): Promise<void> {
        try {
            if (oldStudentId === newStudentId) {
                // Apenas o nome está sendo atualizado
                const result = await connection.execute(
                    `UPDATE Aluno SET Nome = :name WHERE Matricula = :oldStudentId`,
                    { name, oldStudentId },
                    { autoCommit: false }
                );
                if (!result.rowsAffected || result.rowsAffected === 0) {
                    throw new Error("Aluno não encontrado para atualização.");
                }
            } else {
                // A Matrícula está mudando, o que exige uma transação cuidadosa.
                // 1. Verifica se a nova matrícula já existe para evitar conflito de chave primária.
                const existingStudentResult = await connection.execute(
                    `SELECT COUNT(*) AS count FROM Aluno WHERE Matricula = :newStudentId`,
                    { newStudentId },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                const existingStudent = existingStudentResult.rows?.[0] as any;
                if (existingStudent && existingStudent.COUNT > 0) {
                    throw new Error('A nova matrícula informada já está em uso.');
                }
    
                // 2. Cria um novo registro de aluno com a nova matrícula.
                await connection.execute(
                    `INSERT INTO Aluno (Matricula, Nome) VALUES (:newStudentId, :name)`,
                    { newStudentId, name }
                );
    
                // 3. Atualiza as tabelas filhas para apontar para o novo registro.
                await connection.execute(
                    `UPDATE Aluno_Turma SET Matricula = :newStudentId WHERE Matricula = :oldStudentId`,
                    { newStudentId, oldStudentId }
                );
    
                await connection.execute(
                    `UPDATE NOTAS SET Matricula = :newStudentId WHERE Matricula = :oldStudentId`,
                    { newStudentId, oldStudentId }
                );
    
                // 4. Exclui o registro de aluno antigo.
                await connection.execute(
                    `DELETE FROM Aluno WHERE Matricula = :oldStudentId`,
                    { oldStudentId }
                );
            }
            await connection.commit();
        } catch (error: any) {
            await connection.rollback();
            console.error("Error updating student:", error);
            if ((error as any).errorNum === 1) { 
                 throw new Error('A nova matrícula informada já está em uso.');
            }
            throw new Error('Erro ao atualizar dados do aluno.');
        }
    }
}

export default new StudentService();