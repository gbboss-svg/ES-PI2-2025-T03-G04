import express from 'express';
import cors from 'cors';
import { router } from './routes/auth.routes';

const app = express();

app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json());
app.use(router);

export { app };
