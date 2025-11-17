

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { getConnection } from '../database/db';
import oracledb from 'oracledb';

/**
 * Middleware de conexão com o banco de dados.
 */

export const connectionMiddleware = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
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