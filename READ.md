Fase 1: Planejamento, Arquitetura e Configuração (Sprint 0)
Esta fase inicial é crucial para estabelecer as bases do projeto, garantindo que a equipe tenha as ferramentas e a direção necessárias antes de escrever o código das funcionalidades.

1.1. Configurar o Ambiente de Desenvolvimento:


O que fazer: Instalar e configurar todas as tecnologias obrigatórias do projeto.

Explicação: Cada membro da equipe deve preparar seu ambiente com:

Backend: Node.js (última versão LTS) e TypeScript.

Frontend: Preparar a estrutura base com HTML5 e CSS3 (e opcionalmente Bootstrap).

Banco de Dados: Escolher e instalar um dos SGBDs permitidos: MySQL, PostgreSQL ou Oracle.

IDEs: Utilizar VS Code ou WebStorm.

Controle de Versão: Instalar e configurar o Git.

1.2. Criar e Configurar o Repositório no GitHub:


O que fazer: Criar o repositório no GitHub seguindo estritamente as regras de nomeação e acesso.



Explicação:

Nomear o repositório no formato 

ES-PI2-ANO-TURMA-NUMERO-GRUPO (ex: ES-PI2-2025-T2-G03). O não cumprimento desta regra resulta em penalidade.


Convidar todos os integrantes da equipe e o professor orientador como colaboradores desde o início.


1.3. Definir a Arquitetura e o Modelo de Dados:

O que fazer: Projetar a arquitetura da aplicação e o esquema do banco de dados.

Explicação: Desenhar o diagrama entidade-relacionamento (DER) para o banco de dados, identificando as tabelas e relacionamentos necessários: Docentes, Instituições, Disciplinas, Turmas, Alunos, ComponentesDeNota, Notas e LogsDeAuditoria.

1.4. Configurar a Ferramenta de Gerenciamento de Tarefas:


O que fazer: Configurar o GitHub Projects para o gerenciamento do projeto.


Explicação: Criar um quadro Kanban ou similar no GitHub Projects para listar todas as tarefas ( épicos, features, bugs) e registrar as horas de trabalho de cada membro, conforme a obrigatoriedade do apontamento de esforço.

Fase 2: Implementação do Núcleo da Aplicação (Sprint 1)
Nesta fase, o foco é construir as funcionalidades essenciais de acesso e gerenciamento das estruturas acadêmicas básicas.

2.1. Desenvolver o Módulo de Autenticação:


O que fazer: Implementar o cadastro, login e recuperação de senha do docente.


Explicação:

Criar a tela e a lógica de backend para o cadastro do docente com os campos: Nome, e-mail, telefone celular e senha.

Implementar a tela de login. A aplicação deve iniciar nesta tela, sem permitir acesso anônimo.

Desenvolver a funcionalidade de "esqueci a minha senha", que enviará um e-mail para o usuário resetá-la.

2.2. Desenvolver o Gerenciamento de Instituições, Disciplinas e Turmas:


O que fazer: Implementar as operações de CRUD (Criar, Ler, Atualizar, Apagar) para as entidades acadêmicas.


Explicação:

Criar as interfaces e APIs para que o docente possa cadastrar instituições e cursos.

Desenvolver o cadastro de disciplinas, associadas a um curso, com os campos: Nome, sigla, código e período.

Desenvolver o cadastro de turmas, que devem ser associadas a uma disciplina.

2.3. Implementar a Lógica de Exclusão com Dependência:


O que fazer: Criar as regras de negócio que impedem a exclusão de itens que possuem dependências.

Explicação: O sistema não deve permitir que um docente exclua uma instituição se ela tiver disciplinas cadastradas. Da mesma forma, uma disciplina só pode ser excluída se não tiver turmas associadas.

Fase 3: Gerenciamento de Alunos e Notas (Sprint 2)
O foco agora é a gestão dos alunos e a estrutura para o lançamento de notas, incluindo funcionalidades de importação de dados.

3.1. Desenvolver o Gerenciamento Manual de Alunos:


O que fazer: Permitir que o docente cadastre, edite e remova alunos de uma turma manualmente.


Explicação: Criar uma interface dentro de cada turma onde seja possível realizar as operações de CRUD para os alunos, incluindo remoção por múltipla seleção.

3.2. Implementar a Importação de Alunos via Arquivo:


O que fazer: Criar a funcionalidade de upload e processamento de arquivos CSV e JSON para cadastrar alunos em lote.

Explicação:


Para CSV: O parser deve ler apenas as duas primeiras colunas do arquivo, tratando a primeira como identificador e a segunda como nome do aluno.


Para JSON: O parser deve ser flexível para identificar os campos de identificação (matricula, id, código ou RA) e nome (nome, fullName, completeName ou name).

Tratamento de Duplicatas: Durante a importação, verificar se um aluno com o mesmo identificador já existe. Se sim, manter o registro existente no banco de dados e ignorar o do arquivo.


3.3. Implementar o Gerenciamento de Componentes de Nota:


O que fazer: Desenvolver o CRUD para os "componentes de nota" (ex: P1, P2).


Explicação: No nível da disciplina, o docente deve poder cadastrar os componentes que formarão a nota, informando Nome, Sigla (para a fórmula) e Descrição. As notas devem ser numéricas, de 0.00 a 10.00.


3.4. Implementar a Exclusão Crítica de Turma:


O que fazer: Desenvolver o fluxo de segurança para exclusão de turmas com notas lançadas.


Explicação: Se uma turma a ser excluída tiver notas, o sistema deve enviar um e-mail ao docente. A exclusão só será efetivada quando ele clicar em um link de confirmação nesse e-mail. A operação é irrevogável.



Fase 4: Funcionalidades Avançadas e Lógica de Negócio (Sprint 3)
Esta é a fase mais complexa, focada nas funcionalidades de cálculo, auditoria e ajuste de notas, que são o grande diferencial do sistema.

4.1. Construir a Interface de Lançamento de Notas (Quadro de Notas):


O que fazer: Criar a tabela de notas e os modos de edição.

Explicação:

Exibir uma tabela com alunos nas linhas e componentes de nota nas colunas.

A tabela deve abrir em modo de visualização por padrão.

Implementar um controle na interface para alternar entre "edição por componente" e "Modo de Edição Completa".

4.2. Desenvolver o Painel de Auditoria:


O que fazer: Criar o sistema de log para cada alteração de nota.


Explicação:

Toda vez que uma nota for salva ou alterada, um registro deve ser salvo no banco de dados.



Criar um painel na interface que exibe esses logs em ordem decrescente de data/hora, com a mensagem no formato 

dd/mm/yyyy HH:MM:ss (Aluno João Silva) Nota de 5.0 para 5.5 modificada e salva.


O painel deve poder ser ocultado, mas a funcionalidade de auditoria é obrigatória e sempre ativa.

4.3. Implementar o Interpretador de Fórmulas (Desafio Principal):


O que fazer: Desenvolver o backend para interpretar a fórmula de nota final inserida pelo docente.


Explicação:

Criar um campo de texto no nível da disciplina onde o docente digita a fórmula (ex: 

(P1+P2+P3)/3).

Implementar um parser que valide a sintaxe da fórmula e verifique se todos os componentes de nota cadastrados foram utilizados.

Com base na fórmula, calcular a nota final para cada aluno e exibi-la em uma coluna somente leitura na tabela de notas.

4.4. Implementar a Coluna de Notas Finais Ajustadas:


O que fazer: Desenvolver a funcionalidade opcional de ajuste de notas com arredondamento.

Explicação:

Adicionar uma opção 

[Sim/Não] na disciplina para habilitar a coluna "Notas Finais Ajustadas".

Se habilitada, calcular o valor inicial desta coluna aplicando as regras de arredondamento para o 0.5 mais próximo, conforme especificado detalhadamente no documento.

Permitir que o docente edite os valores nesta coluna, mas o sistema deve validar a entrada para aceitar apenas notas com precisão de meio em meio ponto (ex: 8.0, 8.5).


Fase 5: Finalização, Testes e Documentação (Sprint 4)
A última fase de desenvolvimento é dedicada a polir o produto, garantir a qualidade e preparar toda a documentação necessária para a entrega final.

5.1. Realizar a Documentação do Código-Fonte:


O que fazer: Revisar todo o código e garantir que ele está bem documentado.



Explicação: Adicionar comentários explicativos no código e garantir que cada arquivo tenha no topo o nome do seu autor exclusivo, conforme a regra.


5.2. Finalizar o Arquivo README.md:


O que fazer: Completar o README.md com todas as informações necessárias para a banca.


Explicação: O arquivo deve incluir a descrição do projeto, a lista da equipe e, principalmente, um guia passo a passo de como implantar e rodar o projeto em um ambiente de testes.

5.3. Realizar Testes de Ponta a Ponta:

O que fazer: Testar exaustivamente todas as funcionalidades do sistema.

Explicação: Executar testes para verificar todos os requisitos funcionais, desde o cadastro de um docente até o cálculo e ajuste de notas, garantindo que não haja bugs.

5.4. Preparar para a Entrega Final:


O que fazer: Criar a tag de release e preparar a apresentação para a banca.


Explicação:

Criar uma tag no Git com o nome 

1.0.0-final para marcar a versão de entrega.

Preparar a apresentação do sistema, garantindo que o ambiente esteja funcionando perfeitamente para evitar imprevistos.