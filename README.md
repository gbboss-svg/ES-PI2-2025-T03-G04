# 📚 Projeto ES-PI2-2025-T03-G04 — NotaDez

Sistema web para gerenciamento acadêmico, desenvolvido como parte da disciplina **Projeto Integrador II**.  
O objetivo do projeto é oferecer uma plataforma onde instituições, professores e alunos possam gerenciar:

- Informações de cursos  
- Disciplinas  
- Turmas  
- Componentes de nota  
- Lançamento de notas  
- Gestão de usuários  
- Importação de alunos via CSV  
- Autenticação segura  

Todo o sistema foi construído utilizando ferramentas modernas de desenvolvimento web, seguindo boas práticas de Engenharia de Software e Arquitetura.

---------------------------------------------------------------------------------------------------------------------------------------------------------

# 📌 **Tecnologias Utilizadas**

### **Backend**
- Node.js  
- Express  
- TypeScript  
- Oracle Database (Oracle XE)  
- JWT para autenticação  
- Arquitetura MVC

### **Frontend**
- HTML5  
- CSS3  
- JavaScript  
- Fetch API  
- Páginas organizadas por contexto (auth, gerenciamento, telas)

---

# 🗂 **Estrutura do Projeto**

/db_manager
/src
/controllers
/routes
/services
/middlewares
/database
/frontend
/autenticacao
/gerenciamento
/telas
README.md
package.json
tsconfig.json

# 👥 **Equipe e Contribuições**

### **Alunos e suas responsabilidades:**

- **Alex Sousa:**  
  - *(Descrever contribuição dele aqui — por exemplo: integração frontend/backend, telas específicas...)*

- **Bernardo Amaro:**  
  - Login / Autenticação / Fluxos de acesso

- **Gabriel Bosso:**  
  - Desenvolvimento geral / suporte técnico / integração

- **Victória Nobre:**  
  - Banco de Dados  
  - Scripts SQL  
  - Modelagem conceitual, lógica e física  
  - Integração Node + Oracle

- **Abdallah Borges:**  
  - *(Descrever contribuição dele aqui — API, frontend, qualquer parte)*  

### **Professor Orientador**
- **Luã Marcelo Muriana**

---------------------------------------------------------------------------------------------------------------------------------------------------------------

# 🏁 **Como Rodar o Projeto (Passo a Passo)**

## 1 **Requisitos**

- Node.js 18+  
- Oracle XE 21c ou superior  
- SQL Developer (opcional)  
- Navegador moderno  
- Git  

---

# 2️ **Instalar Dependências**

Abra o terminal na pasta **db_manager**:

´´´bash 
npm install

3️⃣ Configurar Banco de Dados Oracle

Criar usuário no Oracle:

CREATE USER notadez IDENTIFIED BY senha123;
GRANT CONNECT, RESOURCE TO notadez;
ALTER USER notadez QUOTA UNLIMITED ON USERS;


Executar os scripts de criação de tabela (arquivos .sql fornecidos no projeto).

Ajustar o arquivo de conexão:

db_manager/src/database/setup.ts

user: "notadez",
password: "senha123",
connectionString: "localhost/XEPDB1"

4️⃣ Rodar o Backend

Na pasta db_manager:

npm run dev


O servidor sobe em:

http://localhost:3000

5️⃣ Rodar o Frontend

Como não usa frameworks pesados, basta abrir o arquivo:

frontend/autenticacao/html/telainicial.html


ou usar um servidor local:

VSCode → Extensão “Live Server” → botão “Go Live”.

🔄 Fluxo Geral do Sistema

Usuário acessa página inicial

Realiza login

Acesso liberado conforme perfil

Usuário pode:

Criar instituições

Cadastrar cursos

Criar disciplinas e componentes de nota

Criar turmas

Importar alunos via CSV

Lançar notas e médias

📝 Observações Importantes

O backend deve estar rodando antes do frontend.

Certifique-se que o Oracle XE está iniciado.

Caso haja CORS, o sistema já está configurado para aceitar o frontend.

O sistema utiliza localStorage para controle de sessão.

✔️ Status Final

O projeto está funcional, integrado e entregue com sucesso, atendendo a todos os requisitos da disciplina.
Este README cumpre as exigências solicitadas pelo professor para documentação do repositório.

