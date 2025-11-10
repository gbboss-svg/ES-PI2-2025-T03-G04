import oracledb from 'oracledb';

interface StudentData {
    id: number;
    name: string;
}

class StudentService {
    async addStudentToTurma(connection: oracledb.Connection, turmaId: number, studentData: StudentData) {
        const { id: studentId, name } = studentData;

        try {
            // Verifica se o aluno já existe
            const studentExistsResult = await connection.execute(
                `SELECT Matricula FROM Aluno WHERE Matricula = :studentId`,
                [studentId],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // Se o aluno não existir, cria um novo
            if (studentExistsResult.rows && studentExistsResult.rows.length === 0) {
                await connection.execute(
                    `INSERT INTO Aluno (Matricula, Nome) VALUES (:studentId, :name)`,
                    [studentId, name]
                );
            }

            // Associa o aluno à turma
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
}

export default new StudentService();
