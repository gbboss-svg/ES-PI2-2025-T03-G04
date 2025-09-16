import express from "express";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use("/api", routes);

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
