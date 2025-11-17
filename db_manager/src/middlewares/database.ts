import express from 'express';
import { getConnection } from '../database/db';
import oracledb from 'oracledb';

/**
 * Middleware de conexão com o banco de dados.
 */

// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
export const connectionMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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