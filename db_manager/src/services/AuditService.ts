  /**
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */

import oracledb from 'oracledb';

class AuditService {
    /**
     * Cria e salva um novo registro de auditoria no banco de dados.
     */
    async createLog(connection: oracledb.Connection, turmaId: number, message: string, snapshot: object | null) {
        try {
            const snapshotData = snapshot ? JSON.stringify(snapshot) : null;
            
            await connection.execute(
                `INSERT INTO AUDITORIA (Id_Turma, Timestamp, Mensagem, Snapshot_Dados)
                 VALUES (:turmaId, SYSTIMESTAMP, :message, :snapshotData)`,
                { 
                    turmaId, 
                    message, 
                    snapshotData 
                },
                { autoCommit: true }
            );
        } catch (error: any) {
            console.error('Erro ao salvar log de auditoria:', error);
            throw new Error('Erro ao salvar log de auditoria.');
        }
    }

    /**
     * Busca todos os registros de auditoria de uma turma específica, ordenados pelo mais recente.
     */
    async getLogsByTurma(connection: oracledb.Connection, turmaId: number) {
        try {
            const result = await connection.execute(
                `SELECT Id_Auditoria, Timestamp, Mensagem, Snapshot_Dados
                 FROM AUDITORIA
                 WHERE Id_Turma = :turmaId
                 ORDER BY Timestamp DESC`,
                { turmaId },
                { 
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    fetchInfo: { "SNAPSHOT_DADOS": { type: oracledb.STRING } }
                }
            );

            if (!result.rows) {
                return [];
            }

            return (result.rows as any[]).map(row => ({
                id: row.ID_AUDITORIA,
                timestamp: row.TIMESTAMP,
                message: row.MENSAGEM,
                snapshot: row.SNAPSHOT_DADOS ? JSON.parse(row.SNAPSHOT_DADOS) : null
            }));

        } catch (error: any) {
            console.error('Erro ao buscar logs de auditoria:', error);
            throw new Error('Erro ao buscar logs de auditoria.');
        }
    }
}

export default new AuditService();