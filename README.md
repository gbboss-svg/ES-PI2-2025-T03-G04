🏛️ Fase 1: A Fundação — Planejamento, Arquitetura e Configuração (Sprint 0)
💡 Princípio Chave: Medir duas vezes, cortar uma vez. Esta é a fase mais crucial. Um erro aqui pode custar semanas de retrabalho. O objetivo é criar um alicerce inabalável para todo o desenvolvimento futuro.

1.1. 🛠️ Montando o Arsenal de Desenvolvimento
🎯 Missão Central: Padronizar o ambiente de desenvolvimento de TODA a equipe para eliminar o clássico problema: "Na minha máquina funciona!".

🔍 Mergulho Profundo: A sincronia aqui é vital. Não se trata apenas de instalar softwares, mas de garantir que todos usem as mesmas versões e configurações para evitar conflitos e inconsistências.

📦 Backend: Node.js (versão LTS) + TypeScript → A combinação para um código JavaScript mais seguro, escalável e manutenível.

🎨 Frontend: HTML5 + CSS3 (Bootstrap opcional) → O esqueleto e a pele da nossa aplicação. Manter a base simples e limpa é o foco inicial.

🗄️ Banco de Dados: MySQL, PostgreSQL ou Oracle → A escolha define como nossos dados serão armazenados e acessados. A decisão deve ser unânime no grupo.

✍️ IDEs: VS Code ou WebStorm → As nossas "oficinas" de código. A familiaridade do dev com a ferramenta acelera o processo.

🔄 Controle de Versão: Git → O cérebro que memoriza cada alteração. Indispensável para o trabalho em equipe.

1.2. 🐙 O Santuário do Código: Repositório no GitHub
🎯 Missão Central: Criar um repositório centralizado que siga regras estritas de organização e acesso, servindo como a única fonte da verdade para o código.

🔍 Mergulho Profundo: O nome do repositório não é um detalhe, é um identificador único para a sua avaliação. Seguir o padrão ES-PI2-ANO-TURMA-NUMERO-GRUPO é o primeiro teste de atenção aos detalhes do projeto.

**📛 Ponto de Atenção Crítico: O não cumprimento da regra de nomeação resulta em penalidade direta. É uma regra simples com uma consequência séria.

🤝 Acesso Imediato: Convidar todos os membros e o orientador desde o Dia Zero garante transparência total e permite feedbacks antecipados.

1.3. 🗺️ O Mapa do Tesouro: Arquitetura e Modelo de Dados
🎯 Missão Central: Desenhar o "blueprint" da aplicação. Definir como as informações se conectarão antes de escrever uma única linha de código de funcionalidade.

🔍 Mergulho Profundo: O Diagrama Entidade-Relacionamento (DER) é o mapa que guiará toda a construção do backend. Ele força a equipe a pensar nas regras de negócio e nos relacionamentos complexos, como:

Docentes ↔️ Instituições ↔️ Disciplinas ↔️ Turmas ↔️ Alunos

Notas ↘️ ComponentesDeNota

LogsDeAuditoria 🕵️ (Observando tudo!)

🚨 Alerta Estratégico: Investir tempo de qualidade aqui evita ter que demolir e reconstruir partes do banco de dados no meio do projeto.

1.4. 📊 Torre de Controle: Gerenciamento de Tarefas
🎯 Missão Central: Tornar o trabalho visível. Configurar uma ferramenta que mostre o que está sendo feito, quem está fazendo e quanto esforço está sendo gasto.

🔍 Mergulho Profundo: O GitHub Projects será o nosso "painel de controle". Ele não é um luxo, é uma exigência.

Kanban  Kanban: Criar colunas como Backlog, A Fazer, Em Andamento e Concluído.

⏳ Registro de Esforço: A obrigatoriedade de apontar as horas não é para microgerenciar, mas para medir a complexidade real das tarefas e ajudar a equipe a planejar melhor os próximos Sprints. Um projeto sem métricas é um projeto perdido.

🏗️ Fase 2: O Esqueleto da Aplicação — Núcleo e Acesso (Sprint 1)
💡 Princípio Chave: Construir os pilares antes de decorar a sala. Foco total nas funcionalidades que dão sustentação a todo o resto.

2.1. 🔑 Os Portões do Reino: Módulo de Autenticação
🎯 Missão Central: Proteger o sistema. Garantir que apenas usuários autorizados (docentes) possam entrar e interagir com os dados.

🔍 Mergulho Profundo:

🚪 Tela de Login: É a primeira impressão e a barreira inicial. Acesso anônimo é proibido. O sistema deve "nascer" trancado.

📝 Cadastro de Docente: Coletar as informações essenciais (Nome, e-mail, celular, senha). A segurança da senha (uso de hash) é implícita e obrigatória.

❓ "Esqueci a Senha": Uma funcionalidade de segurança e conveniência. O fluxo de envio de e-mail com link de reset é um mecanismo padrão da indústria e deve ser implementado de forma segura.

2.2. 🧱 Blocos Fundamentais: CRUDs Acadêmicos
🎯 Missão Central: Dar ao docente o poder de criar e organizar a estrutura acadêmica básica: Instituições, Disciplinas e Turmas.

🔍 Mergulho Profundo: CRUD (Create, Read, Update, Delete) é o pão com manteiga do desenvolvimento de software. A implementação deve ser intuitiva para o usuário e robusta no backend, com APIs bem definidas para cada entidade. A associação entre elas (Disciplina pertence a um Curso, Turma pertence a uma Disciplina) é o ponto-chave aqui.

2.3. 🔗 A Lógica das Correntes: Exclusão com Dependência
🎯 Missão Central: Implementar uma regra de negócio crítica para garantir a integridade dos dados.

🔍 Mergulho Profundo: O sistema precisa ser inteligente. Ele não pode permitir que um docente "puxe o tapete" de dados interligados.

Exemplo: Se uma Instituição possui Disciplinas, a tentativa de exclusão deve ser bloqueada com uma mensagem clara: "Erro: Impossível excluir. Existem disciplinas associadas a esta instituição."

🧠 Pensamento Crítico: Esta regra previne a criação de "dados órfãos" no banco, um pesadelo para a manutenção.

🧑‍🎓 Fase 3: O Coração Pulsante — Gestão de Alunos e Notas (Sprint 2)
💡 Princípio Chave: Flexibilidade e robustez no gerenciamento de dados. Aqui lidamos com a parte mais dinâmica do sistema: pessoas e suas avaliações.

3.1. 👆 Gerenciamento Tático de Alunos (Manual)
🎯 Missão Central: Oferecer ao docente controle total e manual sobre a lista de alunos de uma turma.

🔍 Mergulho Profundo: A interface deve ser limpa e funcional, permitindo adicionar, editar e remover alunos um a um ou em massa (múltipla seleção para remoção), agilizando a gestão de turmas menores ou ajustes pontuais.

3.2. 📄 A Mágica da Importação em Lote
🎯 Missão Central: Economizar o tempo precioso do docente, permitindo o cadastro de centenas de alunos de uma só vez através de arquivos.

🔍 Mergulho Profundo:

🤖 Parser Inteligente (CSV & JSON): O desafio aqui é criar um processador de arquivos que seja ao mesmo tempo estrito e flexível.

CSV: Simples e direto. Coluna 1 = ID, Coluna 2 = Nome. O resto é ignorado.

JSON: Mais complexo. O parser precisa "caçar" por chaves de identificação (matricula, id, código, RA) e de nome (nome, fullName, etc.). Isso mostra um nível de desenvolvimento mais avançado.

🛡️ Tratamento de Duplicatas: Regra de ouro da importação: nunca confie cegamente no arquivo. O sistema deve verificar se um ID já existe. Se sim, o registro do banco de dados tem prioridade, e o do arquivo é descartado. Isso evita a duplicação de alunos.

3.3. 🧩 Peças do Quebra-Cabeça: Componentes de Nota
🎯 Missão Central: Permitir que o docente defina a estrutura de avaliação da disciplina.

🔍 Mergulho Profundo: Os "componentes" (P1, Trabalho, Prova Final) são as variáveis que comporão a nota final. A interface de CRUD deve ser clara, associada à disciplina, e impor a regra de que as notas são numéricas, com duas casas decimais, no intervalo [0.00, 10.00].

3.4. 💣 Ação Irreversível: Exclusão Crítica de Turma
🎯 Missão Central: Criar um mecanismo de segurança de "dupla checagem" para uma ação destrutiva e perigosa.

🔍 Mergulho Profundo: Excluir uma turma com notas lançadas é como apertar o botão vermelho. O sistema deve tratar isso com a máxima seriedade:

Tentativa de Exclusão: O docente clica em "excluir".

Alerta & Pausa: O sistema detecta a presença de notas.

✉️ Confirmação Externa: Um e-mail é enviado. A ação é pausada.

Clique Final: A exclusão só acontece quando o link no e-mail é clicado.

Consequência: A operação é irrevogável. Isso protege o docente contra cliques acidentais que poderiam apagar horas de trabalho.

✨ Fase 4: O Cérebro da Operação — Lógica Avançada (Sprint 3)
💡 Princípio Chave: Transformar dados em inteligência. Esta fase contém as funcionalidades que elevam o sistema de um simples CRUD para uma ferramenta poderosa.

4.1. 🔢 A Planilha Inteligente: Quadro de Notas
🎯 Missão Central: Criar uma interface de lançamento de notas que seja familiar (como uma planilha), mas com modos de edição controlados para evitar erros.

🔍 Mergulho Profundo:

Visualização Padrão: A tabela sempre abre em modo somente leitura. Isso previne alterações acidentais.

Modos de Edição: O controle para alternar entre "edição por componente" (foco em uma prova) e "edição completa" (visão geral) é uma feature de usabilidade que dá flexibilidade e controle ao docente.

4.2. 🕵️ O Olho Que Tudo Vê: Painel de Auditoria
🎯 Missão Central: Garantir 100% de rastreabilidade sobre a informação mais sensível do sistema: as notas.

🔍 Mergulho Profundo: Isso não é opcional, é essencial.

Registro Automático: Qualquer INSERT ou UPDATE na tabela de notas deve gerar um log.

Formato do Log: dd/mm/yyyy HH:MM:ss (Aluno João Silva) Nota de 5.0 para 5.5 modificada e salva. → Clareza e precisão são fundamentais.

Interface: O painel exibe esses logs em ordem cronológica inversa (o mais recente primeiro), servindo como uma "caixa-preta" para resolver qualquer disputa ou dúvida sobre as notas.

4.3. 🧠 O Desafio Supremo: Interpretador de Fórmulas
🎯 Missão Central: Construir o motor de cálculo que interpreta a lógica matemática do docente e calcula automaticamente as notas finais.

🔍 Mergulho Profundo: Este é o coração técnico do projeto.

Entrada: Um simples campo de texto onde o docente escreve a fórmula, como (P1*0.4) + (P2*0.6).

⚙️ O Parser (Analisador): O backend precisa:

Validar a Sintaxe: A expressão matemática é válida? (P1+P2/ não é.

Validar os Componentes: A fórmula usa a sigla P3, mas ela não foi cadastrada? A fórmula é inválida.

Saída: Uma coluna de "Nota Final" na tabela, calculada em tempo real e somente leitura, mostrando o resultado da mágica.

4.4. ⚖️ O Toque Final: Notas Finais Ajustadas
🎯 Missão Central: Dar ao docente uma ferramenta opcional para aplicar arredondamentos padronizados, com a flexibilidade de ajuste manual.

🔍 Mergulho Profundo:

Habilitação Opcional: Um simples [Sim/Não] controla a visibilidade desta coluna.

Cálculo Inicial Automático: O sistema aplica as regras de arredondamento para o 0.5 mais próximo (ex: 7.2 vira 7.0, 7.3 vira 7.5, 7.7 vira 7.5, 7.8 vira 8.0).

Edição com Validação: O docente pode sobrescrever o valor, mas o sistema deve ser um guarda rigoroso, aceitando apenas valores que terminem em .0 ou .5.

🏁 Fase 5: A Bandeirada Final — Polimento e Entrega (Sprint 4)
💡 Princípio Chave: Um trabalho só termina quando está bem documentado, testado e pronto para ser apresentado. A qualidade da entrega é tão importante quanto a qualidade do código.

5.1. 📜 A História do Código: Documentação
🎯 Missão Central: Deixar o código legível e compreensível para outros desenvolvedores (incluindo a banca avaliadora).

🔍 Mergulho Profundo:

Comentários Inteligentes: Comentar o porquê de uma lógica complexa, não o o quê o código faz.

Autoria: A regra de ter o nome do autor no topo de cada arquivo é sobre responsabilidade e orgulho pelo trabalho feito.

5.2. 📖 O Manual de Instruções: Finalizar o README.md
🎯 Missão Central: Criar um guia definitivo que permita que qualquer pessoa clone, configure e execute o projeto sem dor de cabeça.

🔍 Mergulho Profundo: Este arquivo é a sua "venda" final. Ele deve conter um guia de implantação passo a passo, claro e à prova de erros. Se a banca não conseguir rodar o projeto, a avaliação será severamente prejudicada.

5.3. 🧪 Prova de Fogo: Testes de Ponta a Ponta
🎯 Missão Central: Caçar e destruir bugs. Simular o uso real da aplicação por um docente, do início ao fim do fluxo.

🔍 Mergulho Profundo: Testar cada requisito funcional:

O cadastro funciona?

A importação de JSON com campos diferentes funciona?

A fórmula (P1+P2)/2 calcula corretamente?

A exclusão crítica envia o e-mail?

Não deixar nada para a sorte.

5.4. 📦 Empacotando para o Sucesso: Entrega Final
🎯 Missão Central: Formalizar a versão final do software e preparar uma apresentação impecável.

🔍 Mergulho Profundo:

🏷️ Git Tag 1.0.0-final: Este comando é a "assinatura no contrato". Ele marca um ponto específico na história do código como a versão oficial de entrega.

🎤 Preparação da Apresentação: O ambiente deve estar 100% funcional antes do dia da apresentação. Ter um "plano B" (ex: vídeo da aplicação rodando) é uma marca de profissionalismo para evitar desastres com imprevistos de última hora.
