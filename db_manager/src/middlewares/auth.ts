import express from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticação para proteger rotas.
 */

// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
export function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET não está definido nas variáveis de ambiente.' });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = decoded as any;
    return next();
  });
}