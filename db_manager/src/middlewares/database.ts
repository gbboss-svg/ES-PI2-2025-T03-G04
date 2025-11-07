import { Request, Response, NextFunction } from 'express';
import { getConnection } from '../database/db';
import oracledb from 'oracledb';

// Extend the Express Request interface to include our custom property
declare global {
  namespace Express {
    export interface Request {
      dbConnection?: oracledb.Connection;
    }
  }
}

export const connectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let connection;
  try {
    connection = await getConnection();
    req.dbConnection = connection;

    res.on('finish', async () => {
      if (req.dbConnection) {
        try {
          await req.dbConnection.close();
        } catch (error) {
          console.error('Erro ao fechar a conexão do banco de dados:', error);
        }
      }
    });

    next();
  } catch (error) {
    console.error('Erro ao obter conexão do banco de dados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
