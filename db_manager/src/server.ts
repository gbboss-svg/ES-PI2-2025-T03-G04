import { app } from './app';
import { setupDatabase } from './database/setup';

const port = process.env.PORT || 3333;

async function startServer() {
  await setupDatabase();
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
