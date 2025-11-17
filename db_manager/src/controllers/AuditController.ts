import express from 'express';
import AuditService from '../services/AuditService';
import oracledb from 'oracledb';

class AuditController {
    
    // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
    private getDbConnection(req: express.Request): oracledb.Connection {
        if (!req.dbConnection) {
            throw new Error('Database connection not found in request.');
        }
        return req.dbConnection;
    }

    
    // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
    async create(req: express.Request, res: express.Response) {
        try {
            const connection = this.getDbConnection(req);
            const { turmaId, message, snapshot } = req.body;
            await AuditService.createLog(connection, turmaId, message, snapshot);
            return res.status(201).json({ message: 'Log de auditoria salvo com sucesso.' });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    
    // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
    async getByTurma(req: express.Request, res: express.Response) {
        try {
            const connection = this.getDbConnection(req);
            const { turmaId } = req.params;
            const logs = await AuditService.getLogsByTurma(connection, Number(turmaId));
            return res.status(200).json(logs);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default new AuditController();