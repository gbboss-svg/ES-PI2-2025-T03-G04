Com base no "Documento de Visão" do Projeto Integrador 2, aqui está um guia detalhado, explicando passo a passo cada etapa mínima que sua equipe deve seguir para desenvolver o projeto "NotaDez" com sucesso.

### Fase 0: Preparação e Configuração do Ambiente

Esta é a fase inicial, onde você prepara tudo o que é necessário para começar o desenvolvimento.

**Passo 1: Entender o Objetivo do Projeto**
O objetivo central é criar um sistema chamado **NotaDez**. Este sistema servirá como uma ferramenta para que professores possam gerenciar as notas de suas turmas de forma eficiente. [cite_start]Ele deve permitir o gerenciamento de instituições, disciplinas, turmas, alunos e a composição das notas. [cite: 39]

**Passo 2: Configurar o Repositório no GitHub**
O controle de versão é fundamental. Vocês deverão usar o GitHub para armazenar o código e gerenciar as contribuições de cada membro.

* **Criação do Repositório:** Crie um novo repositório no GitHub.
* [cite_start]**Nomeação Correta:** O nome do repositório deve seguir um padrão obrigatório: `PI2-ANO-SEMESTRE-CURSO-TURMA-GRUPO`[cite: 43].
    * **Exemplo:** `PI2-2025-1-ES-A-G1` (para o Grupo 1, da Turma A do curso de Engenharia de Software, no 1º semestre de 2025).
* [cite_start]**Convidar o Professor:** Adicione o professor orientador como colaborador no seu repositório para que ele possa acompanhar o progresso do projeto. [cite: 46]

**Passo 3: Organização da Equipe e Fluxo de Trabalho**
Para garantir que todos contribuam, é essencial definir um fluxo de trabalho.

* **Proteção da Branch Principal:** Configure a branch `main` (ou `master`) como protegida. Isso impede que alguém envie código diretamente para ela.
* **Uso de Branches e Pull Requests:** Todo o desenvolvimento deve ser feito em branches separadas (ex: `feature/autenticacao`, `bugfix/login-error`). Quando uma tarefa for concluída, o desenvolvedor deve abrir um "Pull Request" (PR) para que outro membro da equipe revise o código antes de integrá-lo à branch `main`. [cite_start]Esta é uma regra obrigatória do projeto. [cite: 44]

**Passo 4: Apontamento de Esforço**
O controle de tarefas e do esforço de cada membro é obrigatório.

* **Configurar o GitHub Projects:** Usem a ferramenta "Projects" do GitHub para criar um quadro (Kanban, por exemplo) com colunas como "A Fazer", "Em Andamento" e "Concluído".
* **Registrar Tarefas:** Cada requisito do projeto deve ser quebrado em tarefas menores e registrado como "issues" no GitHub. Cada issue deve ser atribuída a um membro da equipe e adicionada ao quadro do projeto. [cite_start]Isso permite registrar o esforço de cada um. [cite: 45]

---

### Fase 1: Desenvolvimento dos Requisitos do Sistema

Agora, vocês começarão a construir as funcionalidades do NotaDez.

**Requisito 1: Autenticação**
[cite_start]Esta é a porta de entrada do sistema. [cite: 39]

* **Tela de Login:** Crie uma interface para que o usuário (professor) possa inserir suas credenciais (email e senha).
* **Validação:** O sistema deve verificar se as credenciais estão corretas.
* **Controle de Acesso:** Apenas usuários autenticados podem acessar as outras funcionalidades do sistema.

**Requisito 2: Gerenciamento de Instituições, Disciplinas e Turmas**
[cite_start]O professor precisa organizar sua estrutura de trabalho. [cite: 39]

* **Funcionalidades CRUD:** Para cada um desses itens (Instituição, Disciplina, Turma), você deve implementar as quatro operações básicas:
    1.  **Create (Criar):** Permitir que o professor cadastre novas instituições, disciplinas e turmas.
    2.  **Read (Ler):** Listar todos os itens cadastrados.
    3.  **Update (Atualizar):** Permitir a edição das informações de um item existente.
    4.  **Delete (Excluir):** Permitir a remoção de um item.

**Requisito 3: Cadastro e Importação de Alunos**
[cite_start]Depois de criar uma turma, o próximo passo é adicionar os alunos. [cite: 40]

* **Cadastro Manual:** Crie um formulário para adicionar alunos um a um em uma turma, solicitando informações como nome, RA (Registro Acadêmico), etc.
* **Importação em Massa:** Desenvolva uma funcionalidade que permita ao professor fazer o upload de um arquivo nos formatos `.CSV` ou `.JSON` contendo a lista de todos os alunos da turma. O sistema deve ler o arquivo e cadastrar todos os alunos de uma só vez.

**Requisito 4: Criação de Componentes de Nota**
A nota final é composta por várias avaliações. [cite_start]Esta funcionalidade permite ao professor definir quais são elas. [cite: 40]

* **Definir Componentes:** O professor deve poder criar diferentes "componentes" que formarão a nota, como "Prova 1", "Trabalho em Grupo", "Participação".
* **Atribuir Pesos e Critérios:** Para cada componente, o professor poderá definir o peso que ele terá na nota final e o método de cálculo (por exemplo, média aritmética ou ponderada).

**Requisito 5: Apontar Notas dos Componentes**
[cite_start]Com os alunos e os componentes de nota definidos, o professor precisa lançar as notas. [cite: 41]

* **Interface de Lançamento:** Desenvolva uma tela, provavelmente uma tabela ou planilha, onde o professor possa visualizar a lista de alunos de uma turma e inserir a nota de cada um para cada componente de nota criado.

**Requisito 6: Painel de Auditoria**
[cite_start]É crucial saber quem alterou as notas e quando. [cite: 41]

* **Registro de Alterações:** Toda vez que uma nota for criada, alterada ou excluída, o sistema deve registrar:
    * Qual nota foi alterada.
    * O valor antigo e o valor novo.
    * Qual usuário fez a alteração.
    * A data e a hora da alteração.
* **Visualização:** Crie uma tela onde seja possível visualizar esse histórico de alterações, com filtros por aluno, data ou usuário.

**Requisito 7: Exportação de Notas**
[cite_start]O professor pode precisar dos dados fora do sistema. [cite: 42]

* **Gerar Arquivos:** Crie uma função que permita exportar a planilha de notas final da turma para os formatos `.CSV` e `.JSON`.

---

### Fase 2: Desenvolvimento dos Requisitos de Desafio

Estes são requisitos mais complexos. [cite_start]O documento especifica que **os professores não darão suporte ou tirarão dúvidas** sobre como implementá-los, tratando-os como um desafio para a equipe. [cite: 41]

**Desafio 1: Cálculo de Notas Finais**
[cite_start]Esta funcionalidade automatiza o cálculo da nota final de cada aluno. [cite: 41]

* **Lógica de Cálculo:** O sistema deve, com base nos componentes de nota, seus pesos e métodos de cálculo definidos pelo professor, calcular automaticamente a nota final de cada aluno e exibi-la em uma coluna.

**Desafio 2: Coluna de Notas Finais Ajustadas**
[cite_start]Às vezes, o professor precisa fazer um ajuste manual na nota final. [cite: 42]

* **Coluna Editável:** Adicione uma coluna na planilha de notas que permita ao professor inserir manualmente um valor final para a nota, que pode ser diferente da nota calculada automaticamente. Isso pode ser usado para arredondamentos ou pontos extras, por exemplo.

---

### Fase 3: Regras e Boas Práticas Durante o Projeto

Estas são regras que devem ser seguidas durante todo o ciclo de desenvolvimento.

* **Comentários no Código:** O código-fonte deve ser bem comentado, explicando o que cada parte do sistema faz. [cite_start]Isso é fundamental para a manutenção e para que outros possam entender seu trabalho. [cite: 45]
* [cite_start]**Participação nas Reuniões:** A presença e participação ativa nas reuniões de orientação com o professor são obrigatórias e fazem parte da avaliação. [cite: 45]
* **Ambiente de Execução:** O projeto precisa ser compatível com os sistemas operacionais Windows, macOS e Linux. [cite_start]Além disso, ele deve ser executável em navegadores como Google Chrome e Firefox. [cite: 42]

---

### Fase 4: Finalização e Entrega

Após o desenvolvimento, é hora de preparar o projeto para a entrega final.

**Passo 1: Criar o Arquivo README.md**
Este é o manual do seu projeto. [cite_start]Ele é obrigatório e deve estar na raiz do repositório. [cite: 44]

* **Conteúdo Obrigatório:** O arquivo `README.md` deve conter:
    1.  **Título do Projeto:** Ex: "Projeto NotaDez".
    2.  **Descrição:** Uma breve explicação sobre o que o sistema faz.
    3.  **Membros da Equipe:** Nome de todos os integrantes.
    4.  **Tecnologias Utilizadas:** Liste as linguagens, frameworks e ferramentas usadas (ex: Node.js, React, etc.).
    5.  **Como Executar o Projeto:** Um guia passo a passo para que qualquer pessoa possa baixar e rodar o seu projeto em sua própria máquina.

**Passo 2: Criar a Release de Entrega**
[cite_start]A entrega final não é apenas o código na branch `main`. [cite: 44]

* **Gerar uma Release no GitHub:** Acesse a área de "Releases" do seu repositório no GitHub e crie uma nova versão final do projeto (ex: `v1.0.0`). Esta release marca oficialmente a versão de entrega do software.

**Passo 3: Preparação para a Banca Avaliadora**
[cite_start]A avaliação final será feita por uma banca. [cite: 46]

* **Apresentação:** Prepare uma apresentação do sistema, demonstrando todas as funcionalidades implementadas.
* **Defesa do Projeto:** Esteja preparado para responder a perguntas técnicas sobre o código, as decisões de arquitetura e o processo de desenvolvimento que a equipe seguiu.