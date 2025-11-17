

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AuditService from '../services/AuditService';
import oracledb from 'oracledb';

class AuditController {
    
    private getDbConnection(req: ExpressRequest): oracledb.Connection {
        if (!req.dbConnection) {
            throw new Error('Database connection not found in request.');
        }
        return req.dbConnection;
    }

    
    async create(req: ExpressRequest, res: ExpressResponse) {
        try {
            const connection = this.getDbConnection(req);
            const { turmaId, message, snapshot } = req.body;
            await AuditService.createLog(connection, turmaId, message, snapshot);
            return res.status(201).json({ message: 'Log de auditoria salvo com sucesso.' });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    
    async getByTurma(req: ExpressRequest, res: ExpressResponse) {
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