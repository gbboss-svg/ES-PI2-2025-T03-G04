Com certeza. Aqui está uma análise detalhada, ponto a ponto, de cada aspecto do arquivo "Documento de Visão" do Projeto NotaDez, explicando sua estrutura, propósito, requisitos, regras e metadados.

### I. Análise Geral e Identificação do Documento

[cite_start]Este é o "Documento de Visão" do projeto **NotaDez** [cite: 54][cite_start], uma iniciativa acadêmica do componente curricular **Projeto Integrador 2** [cite: 55] [cite_start]para o curso de **Engenharia de Software** [cite: 56] [cite_start]da **Pontifícia Universidade Católica de Campinas (PUC-Campinas)** [cite: 53][cite_start], referente ao ano de **2025**[cite: 57, 59]. [cite_start]O documento define o escopo e os limites da proposta de projeto a ser implementada pelos estudantes[cite: 63].

* **Autoria:** O documento foi elaborado por Prof. Me. Mateus Dias, Profa. Dra. [cite_start]Renata Arantes e Prof. Dr. Lua Muriana[cite: 58, 65].
* [cite_start]**Público-Alvo:** É destinado especificamente aos estudantes que estão cursando a disciplina de Projeto Integrador 2 no curso de Engenharia de Software em 2025[cite: 67].
* [cite_start]**Contato e Suporte:** Em caso de erros ou dúvidas sobre o documento, os estudantes devem contatar seus professores orientadores[cite: 69].

### II. Propósito e Visão do Projeto "NotaDez"

[cite_start]O projeto surge da necessidade dos docentes do ensino superior de terem uma ferramenta própria para gerenciar as notas de seus estudantes, para além dos sistemas institucionais[cite: 90]. [cite_start]Atualmente, muitos utilizam planilhas, que são eficazes, mas não atendem especificamente a esse nicho e carecem de integração[cite: 92, 93].

[cite_start]A visão do NotaDez é ser uma aplicação 100% Web [cite: 97] onde o docente pode:
1.  [cite_start]Cadastrar as instituições onde trabalha, as disciplinas que leciona e suas respectivas turmas[cite: 94].
2.  [cite_start]Importar ou cadastrar estudantes, vinculando-os a uma turma[cite: 95].
3.  [cite_start]Lançar notas em diversas atividades e provas[cite: 96].
4.  [cite_start]Realizar o cálculo automático da nota final[cite: 96].
5.  [cite_start]Importar e exportar dados para facilitar seu trabalho[cite: 97].
6.  [cite_start]Hospedar a aplicação na nuvem ou em um servidor dedicado para acesso de qualquer lugar[cite: 98].

### III. Requisitos Funcionais do Software "NotaDez"

Esta seção detalha as funcionalidades que o sistema deve implementar.

#### **3.1. Autenticação**
* [cite_start]O docente deve criar uma conta usando um e-mail pessoal[cite: 101]. [cite_start]Não haverá acesso anônimo ou modo visitante[cite: 108].
* [cite_start]Os dados necessários para o cadastro são: Nome, e-mail, telefone celular e senha[cite: 107].
* [cite_start]O sistema deve oferecer um recurso de "esqueci a minha senha" para recuperação de acesso via e-mail[cite: 107].
* [cite_start]A primeira página do sistema é a de autenticação[cite: 109].
* [cite_start]O projeto é um software web focado em funcionalidades, não necessitando de hotsites ou páginas informativas de marketing[cite: 110].

#### **3.2. Gerenciar Instituições, Disciplinas e Turmas**
* [cite_start]Ao acessar pela primeira vez, o docente deve cadastrar no mínimo uma instituição e um curso onde leciona[cite: 112].
* [cite_start]Após isso, pode criar disciplinas (informando Nome, sigla, código e período) e associar turmas a elas[cite: 115].
* [cite_start]Uma turma é definida como um conjunto de estudantes que frequentam uma disciplina em um determinado dia, horário e local[cite: 114].
* **Regras de Exclusão:**
    * [cite_start]Para excluir uma turma que já possui notas, o sistema enviará um link de confirmação por e-mail para evitar exclusões acidentais[cite: 116, 125]. [cite_start]A exclusão é uma operação irrevogável[cite: 118].
    * [cite_start]Não é possível excluir uma instituição que ainda tenha disciplinas e turmas cadastradas[cite: 119]. [cite_start]A ordem de exclusão deve seguir as dependências: primeiro as turmas, depois as disciplinas e, por fim, a instituição[cite: 120].

#### **3.3. Cadastro e Importação de Alunos**
* [cite_start]O docente pode incluir, editar ou remover estudantes (um a um ou em múltipla seleção) em uma turma[cite: 126].
* **Importação via CSV:**
    * [cite_start]Pode-se importar alunos de um arquivo .CSV[cite: 127].
    * [cite_start]O sistema utilizará apenas as duas primeiras colunas do arquivo: a primeira como identificador do aluno (matrícula) e a segunda como nome completo[cite: 130]. [cite_start]Outras colunas serão desconsideradas[cite: 131].
* **Importação via JSON:**
    * [cite_start]O arquivo JSON deve ser um array de subdocumentos, onde cada um representa um estudante[cite: 132].
    * [cite_start]Os campos de identificador podem ser `matricula`, `id`, `código` ou `RA`[cite: 133].
    * [cite_start]Os campos de nome podem ser `nome`, `fullName`, `completeName` ou `name`[cite: 133].
* [cite_start]**Conflito de Duplicatas:** Se uma nova importação contiver estudantes com identificadores já existentes na turma, o sistema manterá os dados existentes no NotaDez como fonte da verdade, não sobrescrevendo-os[cite: 134, 143].

#### **3.4. Criar Componente de Nota**
* [cite_start]Um "componente de nota" é qualquer atividade, tarefa ou prova que compõe a nota final[cite: 145, 146].
* [cite_start]Para cadastrar um componente, é preciso informar: Nome, Sigla (usada na fórmula) e Descrição[cite: 160].
* [cite_start]As notas dos componentes são sempre numéricas, variando de 0.00 a 10.00, com duas casas de precisão[cite: 150, 151].
* [cite_start]Após criar os componentes, a tela da turma exibirá uma tabela com os alunos e colunas para cada componente, inicialmente em modo de visualização[cite: 153, 155].

#### **3.5. Apontar Notas dos Componentes**
* [cite_start]O professor poderá lançar as notas de um único componente por vez[cite: 163].
* [cite_start]Haverá um "Modo de Edição Completa" que permite editar livremente as notas de qualquer componente para qualquer aluno[cite: 164].
* [cite_start]Nesta versão, não haverá recursos de "desfazer" ou "refazer" alterações de notas[cite: 167].

#### **3.6. Painel de Auditoria**
* [cite_start]Cada lançamento ou alteração de nota deve ser salvo e exibido em uma caixa de auditoria[cite: 169].
* [cite_start]Este painel funciona como um registro de LOG, exibindo mensagens de feedback como: "dd/mm/yyyy HH:MM:ss (Aluno João Silva) Nota de 5.0 para 5.5 modificada e salva"[cite: 170, 172].
* [cite_start]As mensagens só aparecem após a confirmação da operação pelo backend[cite: 174].
* [cite_start]Esses registros de auditoria devem ser salvos no banco de dados e exibidos em ordem de data/hora decrescente[cite: 179].
* [cite_start]O painel pode ser ocultado, mas a funcionalidade de auditoria é obrigatória e não pode ser desabilitada[cite: 180, 181].

#### **3.7. Cálculo de Notas Finais (Desafio)**
* [cite_start]O professor poderá informar uma expressão matemática (fórmula) para o cálculo da nota final usando as siglas dos componentes cadastrados (ex: `(P1+P2+P3)/3`)[cite: 185, 186].
* [cite_start]O sistema deve ser capaz de interpretar essa fórmula e, antes de salvá-la, verificar se todos os componentes cadastrados foram utilizados[cite: 187].
* [cite_start]Esta funcionalidade é explicitamente marcada como um **desafio**, e os professores não auxiliarão as equipes em sua implementação[cite: 188, 194, 195].
* [cite_start]A coluna com a nota final calculada será mostrada na tela de notas, mas não poderá ser editada pelo professor[cite: 190].

#### **3.8. Coluna Notas Finais Ajustadas**
* [cite_start]O professor terá a opção de adicionar uma coluna de "Notas Finais Ajustadas" ao lado da coluna de cálculo automático[cite: 192, 200].
* [cite_start]Essa coluna é necessária para tratar arredondamentos e casos excepcionais[cite: 212].
* [cite_start]**Regras de Arredondamento:** As notas são fracionadas de 0.5 em 0.5 (ex: 5.0, 5.5, 6.0)[cite: 202].
    * [cite_start]Um cálculo de 5.8 arredonda para 6.0[cite: 203].
    * [cite_start]Um cálculo de 5.4 arredonda para 5.5[cite: 204].
    * [cite_start]Casos intermediários como 5.25 (exatamente no meio) arredondam para baixo, para 5.0[cite: 205].
    * [cite_start]Um cálculo de 5.30, por estar acima de 5.25, arredonda para 5.5[cite: 206, 207].
* [cite_start]O professor pode alterar manualmente os valores nesta coluna, mas sempre respeitando os intervalos de meio ponto[cite: 215].

#### **3.9. Exportação de Notas (CSV ou JSON)**
* [cite_start]O docente poderá exportar as notas da turma em formato CSV ou JSON[cite: 220].
* [cite_start]A exportação só será permitida quando todas as notas de todos os componentes tiverem sido lançadas para todos os alunos[cite: 221, 222].
* [cite_start]O nome do arquivo gerado seguirá o padrão: `YYYY-MM-DD_HHmmssms-TurmaX_Sigla.formato`[cite: 223].
* [cite_start]O download do arquivo será imediato, e o sistema não armazenará os arquivos exportados[cite: 224, 226].

### IV. Requisitos Obrigatórios de Ambiente

* [cite_start]**Backend:** Node.js (última versão LTS) com TypeScript[cite: 229].
* [cite_start]**Frontend:** HTML5, CSS3 (Bootstrap é opcional, mas recomendado)[cite: 230].
* [cite_start]**Banco de Dados:** MySQL, PostgreSQL ou Oracle[cite: 231].
* [cite_start]**IDEs:** Microsoft Visual Studio Code ou JetBrains WebStorm[cite: 232].
* [cite_start]**Controle de Versão:** Git e GitHub, obrigatoriamente[cite: 233].

### V. Regras Elementares do Projeto Integrador

Esta seção define regras estritas para a gestão e avaliação do projeto, com penalidades claras para o não cumprimento.

* **5.1. [cite_start]Nome do Repositório:** Deve seguir o padrão `ES-PI2-ANO-TURMA-NUMERO-GRUPO`, em maiúsculas[cite: 239]. [cite_start]O não cumprimento resulta em penalidade de 1.0 ponto na nota final de todos os integrantes[cite: 241].
* **5.2. [cite_start]Código e Contribuições:** O código deve ser armazenado no GitHub[cite: 243]. [cite_start]As equipes devem usar *branches* para desenvolver funcionalidades[cite: 244]. [cite_start]Todos os membros devem constar no repositório desde o início, sob pena de reprovação automática[cite: 248].
* **5.3. [cite_start]Release Final:** A entrega final deve ser marcada com uma TAG Git chamada `1.0.0-final`[cite: 250]. [cite_start]A ausência da TAG resulta em penalidade de 1.0 ponto na nota final[cite: 251].
* **5.4. [cite_start]Arquivo README.md:** É obrigatório um arquivo `README.md` na raiz do repositório, descrevendo o projeto, a equipe e como executá-lo[cite: 258, 259]. [cite_start]A falta dele até a entrega final acarreta penalidade de 1.0 ponto[cite: 260].
* **5.5. [cite_start]Comentários e Autoria:** Todo código deve ser comentado[cite: 262]. [cite_start]Cada arquivo deve ter o nome do seu autor exclusivo no topo[cite: 263]. [cite_start]A individualidade da produção será respeitada[cite: 265]. [cite_start]Cada arquivo sem comentário ou autoria resulta em penalidade de 1.0 ponto[cite: 266].
* **5.6. [cite_start]Apontamento de Esforço:** As tarefas e horas gastas devem ser registradas na ferramenta GitHub Projects[cite: 268, 269]. [cite_start]Displicência ou falsificação de informações pode levar à desclassificação da equipe[cite: 271, 272].
* **5.7. [cite_start]Participação em Reuniões:** A presença e a apresentação de progresso nas reuniões de orientação são obrigatórias[cite: 278, 280]. [cite_start]A falta ou não participação ativa resultará em descontos na nota individual[cite: 279, 281].
* **5.8. [cite_start]Convites para o Repositório:** Inicialmente, apenas os membros da equipe e o professor orientador devem ser convidados[cite: 284]. [cite_start]Os membros da banca avaliadora só devem ser convidados perto da data de apresentação, quando autorizado pelo orientador[cite: 289, 291].
* **5.9. Banca Avaliadora:**
    * [cite_start]A apresentação final será para uma banca, com duração máxima de 20 minutos, incluindo o tempo de preparação[cite: 296, 300].
    * [cite_start]A banca conduz a dinâmica da apresentação, podendo iniciar diretamente com perguntas[cite: 297, 298, 299].
    * [cite_start]As equipes devem estar preparadas com o projeto funcionando perfeitamente[cite: 301].
    * [cite_start]Em caso de problemas técnicos, a equipe terá no máximo 3 minutos para resolver[cite: 302]. [cite_start]Se não conseguir, a equipe será desclassificada por falta de preparo[cite: 303].

### VI. Direitos Autorais e Uso Comercial

* [cite_start]O documento é protegido pela lei de direitos autorais 9.610/98 e não deve ser distribuído a pessoas externas à disciplina[cite: 71].
* [cite_start]Nenhuma parte do conteúdo pode ser reaproveitada fora do contexto acadêmico da disciplina em 2025[cite: 72].
* [cite_start]Para qualquer uso comercial das ideias ou requisitos, é necessário enviar uma proposta formal aos autores por e-mail[cite: 74, 79]. [cite_start]Tais pedidos só serão analisados se forem feitos por um profissional jurídico com procuração[cite: 80, 81].
* [cite_start]Os e-mails dos autores são fornecidos no documento[cite: 83, 84, 85].