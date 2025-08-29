### I. Análise Geral e Identificação do Documento

Este é o "Documento de Visão" do projeto **NotaDez**, uma iniciativa acadêmica do componente curricular **Projeto Integrador 2** para o curso de **Engenharia de Software** da **Pontifícia Universidade Católica de Campinas (PUC-Campinas)**, referente ao ano de **2025**. O documento define o escopo e os limites da proposta de projeto a ser implementada pelos estudantes.

* **Autoria:** O documento foi elaborado por Prof. Me. Mateus Dias, Profa. Dra. Renata Arantes e Prof. Dr. Lua Muriana.
* **Público-Alvo:** É destinado especificamente aos estudantes que estão cursando a disciplina de Projeto Integrador 2 no curso de Engenharia de Software em 2025.
* **Contato e Suporte:** Em caso de erros ou dúvidas sobre o documento, os estudantes devem contatar seus professores orientadores.

### II. Propósito e Visão do Projeto "NotaDez"

O projeto surge da necessidade dos docentes do ensino superior de terem uma ferramenta própria para gerenciar as notas de seus estudantes, para além dos sistemas institucionais. Atualmente, muitos utilizam planilhas, que são eficazes, mas não atendem especificamente a esse nicho e carecem de integração.

A visão do NotaDez é ser uma aplicação 100% Web onde o docente pode:
1.  Cadastrar as instituições onde trabalha, as disciplinas que leciona e suas respectivas turmas.
2.  Importar ou cadastrar estudantes, vinculando-os a uma turma.
3.  Lançar notas em diversas atividades e provas.
4.  Realizar o cálculo automático da nota final.
5.  Importar e exportar dados para facilitar seu trabalho.
6.  Hospedar a aplicação na nuvem ou em um servidor dedicado para acesso de qualquer lugar.

### III. Requisitos Funcionais do Software "NotaDez"

Esta seção detalha as funcionalidades que o sistema deve implementar.

#### **3.1. Autenticação**
* O docente deve criar uma conta usando um e-mail pessoal. Não haverá acesso anônimo ou modo visitante.
* Os dados necessários para o cadastro são: Nome, e-mail, telefone celular e senha.
* O sistema deve oferecer um recurso de "esqueci a minha senha" para recuperação de acesso via e-mail.
* A primeira página do sistema é a de autenticação.
* O projeto é um software web focado em funcionalidades, não necessitando de hotsites ou páginas informativas de marketing.

#### **3.2. Gerenciar Instituições, Disciplinas e Turmas**
* Ao acessar pela primeira vez, o docente deve cadastrar no mínimo uma instituição e um curso onde leciona.
* Após isso, pode criar disciplinas (informando Nome, sigla, código e período) e associar turmas a elas.
* Uma turma é definida como um conjunto de estudantes que frequentam uma disciplina em um determinado dia, horário e local.
* **Regras de Exclusão:**
    * Para excluir uma turma que já possui notas, o sistema enviará um link de confirmação por e-mail para evitar exclusões acidentais. A exclusão é uma operação irrevogável.
    * Não é possível excluir uma instituição que ainda tenha disciplinas e turmas cadastradas. A ordem de exclusão deve seguir as dependências: primeiro as turmas, depois as disciplinas e, por fim, a instituição.

#### **3.3. Cadastro e Importação de Alunos**
* O docente pode incluir, editar ou remover estudantes (um a um ou em múltipla seleção) em uma turma.
* **Importação via CSV:**
    * Pode-se importar alunos de um arquivo .CSV.
    * O sistema utilizará apenas as duas primeiras colunas do arquivo: a primeira como identificador do aluno (matrícula) e a segunda como nome completo. Outras colunas serão desconsideradas.
* **Importação via JSON:**
    * O arquivo JSON deve ser um array de subdocumentos, onde cada um representa um estudante.
    * Os campos de identificador podem ser `matricula`, `id`, `código` ou `RA`.
    * Os campos de nome podem ser `nome`, `fullName`, `completeName` ou `name`.
* **Conflito de Duplicatas:** Se uma nova importação contiver estudantes com identificadores já existentes na turma, o sistema manterá os dados existentes no NotaDez como fonte da verdade, não sobrescrevendo-os.

#### **3.4. Criar Componente de Nota**
* Um "componente de nota" é qualquer atividade, tarefa ou prova que compõe a nota final.
* Para cadastrar um componente, é preciso informar: Nome, Sigla (usada na fórmula) e Descrição.
* As notas dos componentes são sempre numéricas, variando de 0.00 a 10.00, com duas casas de precisão.
* Após criar os componentes, a tela da turma exibirá uma tabela com os alunos e colunas para cada componente, inicialmente em modo de visualização.

#### **3.5. Apontar Notas dos Componentes**
* O professor poderá lançar as notas de um único componente por vez.
* Haverá um "Modo de Edição Completa" que permite editar livremente as notas de qualquer componente para qualquer aluno.
* Nesta versão, não haverá recursos de "desfazer" ou "refazer" alterações de notas.

#### **3.6. Painel de Auditoria**
* Cada lançamento ou alteração de nota deve ser salvo e exibido em uma caixa de auditoria.
* Este painel funciona como um registro de LOG, exibindo mensagens de feedback como: "dd/mm/yyyy HH:MM:ss (Aluno João Silva) Nota de 5.0 para 5.5 modificada e salva".
* As mensagens só aparecem após a confirmação da operação pelo backend.
* Esses registros de auditoria devem ser salvos no banco de dados e exibidos em ordem de data/hora decrescente.
* O painel pode ser ocultado, mas a funcionalidade de auditoria é obrigatória e não pode ser desabilitada.

#### **3.7. Cálculo de Notas Finais (Desafio)**
* O professor poderá informar uma expressão matemática (fórmula) para o cálculo da nota final usando as siglas dos componentes cadastrados (ex: `(P1+P2+P3)/3`).
* O sistema deve ser capaz de interpretar essa fórmula e, antes de salvá-la, verificar se todos os componentes cadastrados foram utilizados.
* Esta funcionalidade é explicitamente marcada como um **desafio**, e os professores não auxiliarão as equipes em sua implementação.
* A coluna com a nota final calculada será mostrada na tela de notas, mas não poderá ser editada pelo professor.

#### **3.8. Coluna Notas Finais Ajustadas**
* O professor terá a opção de adicionar uma coluna de "Notas Finais Ajustadas" ao lado da coluna de cálculo automático.
* Essa coluna é necessária para tratar arredondamentos e casos excepcionais.
* **Regras de Arredondamento:** As notas são fracionadas de 0.5 em 0.5 (ex: 5.0, 5.5, 6.0).
    * Um cálculo de 5.8 arredonda para 6.0.
    * Um cálculo de 5.4 arredonda para 5.5.
    * Casos intermediários como 5.25 (exatamente no meio) arredondam para baixo, para 5.0.
    * Um cálculo de 5.30, por estar acima de 5.25, arredonda para 5.5.
* O professor pode alterar manualmente os valores nesta coluna, mas sempre respeitando os intervalos de meio ponto.

#### **3.9. Exportação de Notas (CSV ou JSON)**
* O docente poderá exportar as notas da turma em formato CSV ou JSON.
* A exportação só será permitida quando todas as notas de todos os componentes tiverem sido lançadas para todos os alunos.
* O nome do arquivo gerado seguirá o padrão: `YYYY-MM-DD_HHmmssms-TurmaX_Sigla.formato`.
* O download do arquivo será imediato, e o sistema não armazenará os arquivos exportados.

### IV. Requisitos Obrigatórios de Ambiente

* **Backend:** Node.js (última versão LTS) com TypeScript.
* **Frontend:** HTML5, CSS3 (Bootstrap é opcional, mas recomendado).
* **Banco de Dados:** MySQL, PostgreSQL ou Oracle.
* **IDEs:** Microsoft Visual Studio Code ou JetBrains WebStorm.
* **Controle de Versão:** Git e GitHub, obrigatoriamente.

### V. Regras Elementares do Projeto Integrador

Esta seção define regras estritas para a gestão e avaliação do projeto, com penalidades claras para o não cumprimento.

* **5.1. Nome do Repositório:** Deve seguir o padrão `ES-PI2-ANO-TURMA-NUMERO-GRUPO`, em maiúsculas. O não cumprimento resulta em penalidade de 1.0 ponto na nota final de todos os integrantes.
* **5.2. Código e Contribuições:** O código deve ser armazenado no GitHub. As equipes devem usar *branches* para desenvolver funcionalidades. Todos os membros devem constar no repositório desde o início, sob pena de reprovação automática.
* **5.3. Release Final:** A entrega final deve ser marcada com uma TAG Git chamada `1.0.0-final`. A ausência da TAG resulta em penalidade de 1.0 ponto na nota final.
* **5.4. Arquivo README.md:** É obrigatório um arquivo `README.md` na raiz do repositório, descrevendo o projeto, a equipe e como executá-lo. A falta dele até a entrega final acarreta penalidade de 1.0 ponto.
* **5.5. Comentários e Autoria:** Todo código deve ser comentado. Cada arquivo deve ter o nome do seu autor exclusivo no topo. A individualidade da produção será respeitada. Cada arquivo sem comentário ou autoria resulta em penalidade de 1.0 ponto.
* **5.6. Apontamento de Esforço:** As tarefas e horas gastas devem ser registradas na ferramenta GitHub Projects. Displicência ou falsificação de informações pode levar à desclassificação da equipe.
* **5.7. Participação em Reuniões:** A presença e a apresentação de progresso nas reuniões de orientação são obrigatórias. A falta ou não participação ativa resultará em descontos na nota individual.
* **5.8. Convites para o Repositório:** Inicialmente, apenas os membros da equipe e o professor orientador devem ser convidados. Os membros da banca avaliadora só devem ser convidados perto da data de apresentação, quando autorizado pelo orientador.
* **5.9. Banca Avaliadora:**
    * A apresentação final será para uma banca, com duração máxima de 20 minutos, incluindo o tempo de preparação.
    * A banca conduz a dinâmica da apresentação, podendo iniciar diretamente com perguntas.
    * As equipes devem estar preparadas com o projeto funcionando perfeitamente.
    * Em caso de problemas técnicos, a equipe terá no máximo 3 minutos para resolver. Se não conseguir, a equipe será desclassificada por falta de preparo.

### VI. Direitos Autorais e Uso Comercial

* O documento é protegido pela lei de direitos autorais 9.610/98 e não deve ser distribuído a pessoas externas à disciplina.
* Nenhuma parte do conteúdo pode ser reaproveitada fora do contexto acadêmico da disciplina em 2025.
* Para qualquer uso comercial das ideias ou requisitos, é necessário enviar uma proposta formal aos autores por e-mail. Tais pedidos só serão analisados se forem feitos por um profissional jurídico com procuração.
* Os e-mails dos autores são fornecidos no documento.