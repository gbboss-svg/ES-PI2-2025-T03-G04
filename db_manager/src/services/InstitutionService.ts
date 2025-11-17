  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   */

import oracledb from 'oracledb';

export default class InstitutionService {
    /**
     * Cria uma nova instituição e a associa ao professor que a criou.
     */
    static async createInstitution(connection: oracledb.Connection, nome: string, professorId: number): Promise<number> {
        try {
            const result = await connection.execute<{ id: number[] }>(
                `INSERT INTO Instituicao (Nome, Id_Professor) VALUES (:nome, :professorId) RETURNING Id_Instituicao INTO :id`,
                { nome, professorId, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
                { autoCommit: true }
            );
            const institutionId = result.outBinds!.id[0];
            return institutionId;
        } catch (error: any) {
            console.error('[InstitutionService] Erro detalhado ao criar instituição:', error);
            throw new Error('Erro ao criar instituição.');
        }
    }

    /**
     * Atualiza o nome de uma instituição existente.
     */
    static async updateInstitution(connection: oracledb.Connection, institutionId: number, nome: string, professorId: number) {
        try {
            const result = await connection.execute(
                `UPDATE Instituicao SET Nome = :nome WHERE Id_Instituicao = :id AND Id_Professor = :professorId`,
                { nome, id: institutionId, professorId },
                { autoCommit: true }
            );
            if (result.rowsAffected === 0) {
                throw new Error("Instituição não encontrada ou permissão negada.");
            }
        } catch (error: any) {
            console.error('Erro ao atualizar instituição:', error);
            throw new Error('Erro ao atualizar instituição.');
        }
    }

    /**
     * Exclui uma instituição.
     */
    static async deleteInstitution(connection: oracledb.Connection, institutionId: number, professorId: number) {
        try {
            const result = await connection.execute(
                `DELETE FROM Instituicao WHERE Id_Instituicao = :id AND Id_Professor = :professorId`,
                { id: institutionId, professorId },
                { autoCommit: true }
            );
            if (result.rowsAffected === 0) {
                throw new Error("Instituição não encontrada ou permissão negada.");
            }
        } catch (error: any) {
            console.error('Erro ao excluir instituição:', error);
            throw new Error('Erro ao excluir instituição.');
        }
    }
}