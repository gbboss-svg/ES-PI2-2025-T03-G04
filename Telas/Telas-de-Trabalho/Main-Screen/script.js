// --- DADOS MOCK (Simulando o banco de dados) ---
    const MOCK_DATA = {
        user: {
            name: 'Prof. Dr. Lua Muriana',
            email: 'lua.marcelo@puc-campinas.edu.br',
        },
        institutions: [
            {
                id: 1,
                name: 'PUC-Campinas',
                courses: [
                    { id: 1, name: 'Engenharia de Software' },
                    { id: 2, name: 'Engenharia da Computação' }
                ],
                disciplines: [
                    {
                        id: 101,
                        name: 'Projeto Integrador 2',
                        code: 'ES-PI2',
                        curso: 'Engenharia de Software',
                        period: '4º Semestre',
                        maxGrade: 10,
                        gradeComponents: [
                            { id: 201, name: 'Entrega 1', acronym: 'E1', description: 'Documento de Visão e Requisitos' },
                            { id: 202, name: 'Entrega 2', acronym: 'E2', description: 'Protótipo e Modelagem' },
                            { id: 203, name: 'Apresentação Final', acronym: 'AF', description: 'Apresentação para a banca' },
                        ],
                        finalGradeFormula: '(E1*0.3) + (E2*0.3) + (AF*0.4)',
                        hasAdjustedColumn: true,
                        turmas: [
                            {
                                id: 1001,
                                name: 'Turma 1',
                                code: 'T1',
                                isFinalized: false,
                                students: [
                                    { id: 11111, name: 'Abel Antimônio', grades: { 'E1': 8.5, 'E2': 9.0, 'AF': 9.5 } },
                                    { id: 11112, name: 'Bianca Nióbio', grades: { 'E1': 7.0, 'E2': 6.5, 'AF': 8.0 } },
                                    { id: 11113, name: 'Carla Polônio', grades: { 'E1': 9.5, 'E2': 9.8, 'AF': 10.0 } },
                                    { id: 11114, name: 'Carlos Zinco', grades: { 'E1': 4.3, 'E2': 5.0, 'AF': 3.5 } },
                                ]
                            },
                            { id: 1002, name: 'Turma 2', code: 'T2', isFinalized: true, students: [] }
                        ]
                    },
                    { id: 102, name: 'Cálculo I', code: 'MAT001', curso: 'Engenharia da Computação', period: '1º Semestre', maxGrade: 10, gradeComponents: [], finalGradeFormula: '', hasAdjustedColumn: false, turmas: [] }
                ]
            },
            {
                id: 2,
                name: 'UNICAMP',
                courses: [
                    { id: 3, name: 'Ciência da Computação' }
                ],
                disciplines: []
            }
        ],
        auditLog: [
            { id: 1, timestamp: '2025-10-09 14:30:15', message: 'Nota de "Entrega 1" do aluno Abel Antimônio alterada de 8.0 para 8.5.', snapshot: null },
            { id: 2, timestamp: '2025-10-09 14:28:02', message: 'Nota de "Entrega 1" do aluno Bianca Nióbio lançada: 7.0.', snapshot: null },
            { id: 3, timestamp: '2025-10-08 11:05:41', message: 'Aluno Carlos Zinco adicionado à Turma 1.', snapshot: null },
        ]
    };

    // --- LÓGICA DA APLICAÇÃO ---
    document.addEventListener('DOMContentLoaded', function() {
        const views = {
            profile: document.getElementById('profile-view'),
            dashboard: document.getElementById('dashboard-view'),
            institutions: document.getElementById('institutions-view'),
            creation: document.getElementById('creation-view'),
            activeTurmas: document.getElementById('activeTurmas-view'),
            turmaDetail: document.getElementById('turma-detail-view'),
            settings: document.getElementById('settings-view'),
        };
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
        const addInstitutionModal = new bootstrap.Modal(document.getElementById('addInstitutionModal'));
        const addCourseModal = new bootstrap.Modal(document.getElementById('addCourseModal'));
        const editTurmaModal = new bootstrap.Modal(document.getElementById('editTurmaModal'));
        const editDisciplineModal = new bootstrap.Modal(document.getElementById('editDisciplineModal'));
        const addStudentModal = new bootstrap.Modal(document.getElementById('addStudentModal'));
        const finalizeSemesterModal = new bootstrap.Modal(document.getElementById('finalizeSemesterModal'));
        const reopenTurmaModal = new bootstrap.Modal(document.getElementById('reopenTurmaModal'));
        const deleteTurmaModal = new bootstrap.Modal(document.getElementById('deleteTurmaModal'));
        const deleteDisciplineModal = new bootstrap.Modal(document.getElementById('deleteDisciplineModal'));
        const deleteInstitutionModal = new bootstrap.Modal(document.getElementById('deleteInstitutionModal'));
        const deleteCourseModal = new bootstrap.Modal(document.getElementById('deleteCourseModal'));
        
        let currentTurmaContext = {}; 

        function createSnapshot(data) {
            return JSON.parse(JSON.stringify(data));
        }

        function switchView(viewName) {
            Object.values(views).forEach(v => v.classList.add('d-none'));
            if (views[viewName]) {
                if (viewName === 'creation') {
                    // Reset and re-render the creation view each time it's opened
                    renderCreationView();
                }
                views[viewName].classList.remove('d-none');
            }
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.view === viewName) {
                    link.classList.add('active');
                }
            });
        }
        
        function addAuditLog(message, snapshot = null) {
            const timestamp = new Date().toLocaleString('pt-BR');
            MOCK_DATA.auditLog.unshift({
                id: Date.now(),
                timestamp: timestamp,
                message: message,
                snapshot: snapshot
            });
            renderAuditLog();
        }

        function calculateFinalGrade(grades, formula, components) {
            if (!formula || components.length === 0) return 0;
            let formulaToEvaluate = formula;
            for(const comp of components) {
                const grade = grades[comp.acronym] ?? 0;
                const regex = new RegExp(`\\b${comp.acronym}\\b`, 'g');
                formulaToEvaluate = formulaToEvaluate.replace(regex, grade);
            }
            try {
                const result = new Function(`return ${formulaToEvaluate}`)();
                return !isFinite(result) ? NaN : result; // Return NaN for Infinity/-Infinity
            } catch (e) {
                console.error("Erro ao calcular fórmula:", e);
                return NaN;
            }
        }
        
        function adjustGrade(grade) {
            const decimal = grade - Math.floor(grade);
            if (decimal <= 0.25) return Math.floor(grade);
            if (decimal > 0.25 && decimal <= 0.75) return Math.floor(grade) + 0.5;
            return Math.ceil(grade);
        }

        function testAndValidateFormula(formula, disciplina) {
            const validation = validateFormula(formula, disciplina.gradeComponents);
            if (!validation.valid) {
                return { valid: false, message: validation.message };
            }

            const sampleGrades = {};
            disciplina.gradeComponents.forEach(comp => {
                sampleGrades[comp.acronym] = disciplina.maxGrade;
            });

            const result = calculateFinalGrade(sampleGrades, formula, disciplina.gradeComponents);

            if (isNaN(result)) {
                return { valid: false, message: 'A fórmula resultou em um erro de cálculo (ex: divisão por zero).' };
            }
            if (result < 0) { 
                 return { valid: false, message: `O resultado do teste (${result.toFixed(2)}) é negativo. A fórmula deve resultar em um valor positivo.` };
            }
            if (result > disciplina.maxGrade * 1.01) { // 1% tolerance for floating point issues
                return { valid: false, message: `O resultado do teste (${result.toFixed(2)}) excede a nota máxima da disciplina (${disciplina.maxGrade}).` };
            }

            return { valid: true, message: 'Fórmula válida e testada com sucesso!', testResult: result };
        }
        
        function validateFormula(formula, components) {
            const validAcronyms = components.map(c => c.acronym);
            if (!formula.trim()) {
                return { valid: true, message: 'Digite a fórmula.' };
            }
            const variablesInFormula = formula.match(/(?<!['"])\b[a-zA-Z_][a-zA-Z0-9_]*\b(?!['"])/g) || [];
            const uniqueVariables = [...new Set(variablesInFormula)];

            for (const variable of uniqueVariables) {
                if (!validAcronyms.includes(variable)) {
                    return { valid: false, message: `Erro: Atividade "${variable}" não existe.` };
                }
            }

            try {
                let testFormula = formula;
                validAcronyms.forEach(acronym => {
                    const regex = new RegExp(`\\b${acronym}\\b`, 'g');
                    testFormula = testFormula.replace(regex, '1');
                });
                new Function(`return ${testFormula}`)();
            } catch (e) {
                return { valid: false, message: 'Erro de sintaxe na fórmula.' };
            }

            return { valid: true, message: 'Fórmula válida!' };
        }

        function renderCourseManagement(instId) {
            const inst = MOCK_DATA.institutions.find(i => i.id == instId);
            const container = document.getElementById('course-management-section');
            if (!inst || !container) return;

            container.innerHTML = `
                <ul class="list-group mt-3">
                    ${inst.courses.map(course => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${course.name}
                            <button class="btn btn-sm btn-outline-danger delete-course-btn" data-inst-id="${inst.id}" data-course-name="${course.name}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </li>
                    `).join('')}
                    ${inst.courses.length === 0 ? '<li class="list-group-item text-muted">Nenhum curso cadastrado para esta instituição.</li>' : ''}
                </ul>
                <div class="mt-2">
                    <a class="text-decoration-none small add-course-link" href="#" data-inst-id="${inst.id}">
                        <i class="bi bi-plus-circle me-1"></i> Adicionar novo curso a ${inst.name}
                    </a>
                </div>
            `;

            container.querySelectorAll('.delete-course-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const { instId, courseName } = e.currentTarget.dataset;
                    document.getElementById('course-to-delete-name').textContent = `${courseName} (da instituição ${inst.name})`;
                    const confirmBtn = document.getElementById('confirm-delete-course-btn');
                    confirmBtn.dataset.instId = instId;
                    confirmBtn.dataset.courseName = courseName;
                    deleteCourseModal.show();
                });
            });

            container.querySelector('.add-course-link').addEventListener('click', (e) => {
                e.preventDefault();
                const { instId } = e.currentTarget.dataset;
                const instName = MOCK_DATA.institutions.find(i => i.id == instId).name;
                document.getElementById('addCourseModalLabel').textContent = `Adicionar Novo Curso a ${instName}`;
                document.getElementById('confirm-add-course-btn').dataset.instId = instId;
                addCourseModal.show();
            });
        }
        
        function renderProfileView(previouslySelectedInstId = null) {
            const container = views.profile;
            const user = MOCK_DATA.user;
            container.innerHTML = `
                <div class="d-flex align-items-center mb-4">
                    <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=${user.name.charAt(0)}" class="rounded-circle me-4" alt="Avatar">
                    <div>
                        <h1>${user.name}</h1>
                        <p class="lead text-muted">${user.email}</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body p-4">
                        <h5 class="card-title mb-4">Informações Pessoais</h5>
                        <div class="row g-4">
                            <div class="col-md-6"><small class="text-muted d-block mb-1">Nome Completo</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                            <div class="col-md-6"><small class="text-muted d-block mb-1">CPF</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                            <div class="col-md-6"><small class="text-muted d-block mb-1">Email</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                            <div class="col-md-6"><small class="text-muted d-block mb-1">Telefone</small><p class="fw-bold mb-0"><em>*informação*</em></p></div>
                        </div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Gerenciar Instituições</h5>
                        <label for="institution-select-profile" class="form-label">Selecione uma instituição para remover</label>
                        <div class="input-group">
                            <select id="institution-select-profile" class="form-select"></select>
                            <button class="btn btn-outline-danger" type="button" id="delete-institution-btn"><i class="bi bi-trash"></i> Remover Selecionada</button>
                        </div>
                        <div class="mt-2">
                            <a class="text-decoration-none small" href="#" data-bs-toggle="modal" data-bs-target="#addInstitutionModal">
                                <i class="bi bi-plus-circle me-1"></i> Adicionar nova instituição
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Gerenciar Cursos por Instituição</h5>
                        <div class="mb-3">
                            <label for="institution-course-mgmt-select" class="form-label">Selecione uma instituição para ver seus cursos</label>
                            <select id="institution-course-mgmt-select" class="form-select"></select>
                        </div>
                        <div id="course-management-section">
                            <!-- Course list and management tools will be rendered here by JS -->
                        </div>
                    </div>
                </div>
            `;
            
            const instProfileSelect = container.querySelector('#institution-select-profile');
            instProfileSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

            const instCourseSelect = container.querySelector('#institution-course-mgmt-select');
            instCourseSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');
            
            instCourseSelect.addEventListener('change', (e) => {
                renderCourseManagement(e.target.value);
            });
            
            container.querySelector('#delete-institution-btn').addEventListener('click', () => {
                const selectedId = instProfileSelect.value;
                const inst = MOCK_DATA.institutions.find(i => i.id == selectedId);
                if (!inst) {
                    alert('Por favor, selecione uma instituição válida para excluir.');
                    return;
                }
                document.getElementById('institution-to-delete-name').textContent = inst.name;
                document.getElementById('confirm-delete-institution-btn').dataset.id = inst.id;
                deleteInstitutionModal.show();
            });

            if (previouslySelectedInstId) {
                instCourseSelect.value = previouslySelectedInstId;
            }

            if (MOCK_DATA.institutions.length > 0) {
                renderCourseManagement(instCourseSelect.value);
            }
        }
        
        function renderDashboardView() {
            const container = views.dashboard;
            container.innerHTML = '';

            const user = MOCK_DATA.user;
            container.innerHTML += `
                <h1>Bem-vindo(a), ${user.name.split(' ')[0]} ${user.name.split(' ').slice(-1)[0]}!</h1>
                <p class="lead text-muted">Acesso rápido às suas disciplinas e turmas.</p>
            `;

            MOCK_DATA.institutions.forEach((inst, index) => {
                let institutionHTML = `
                    <div class="mt-4">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-building fs-4 me-2"></i>
                            <h3 class="mb-0">${inst.name}</h3>
                        </div>
                        <hr class="my-3">
                        ${inst.disciplines.length > 0 ? `
                            <div class="row g-3">
                                ${inst.disciplines.map(disc => {
                                    const allTurmasFinalized = disc.turmas.length > 0 && disc.turmas.every(t => t.isFinalized);
                                    return `
                                    <div class="col-md-6 col-lg-4">
                                        <div class="card h-100 shadow-sm">
                                            <div class="card-body">
                                                <h5 class="card-title">${disc.name}</h5>
                                                <h6 class="card-subtitle mb-2 text-muted">${disc.curso}</h6>
                                                <h6 class="card-subtitle mb-2 text-muted">${disc.code} - ${disc.period}</h6>
                                                <p class="card-text">${disc.turmas.length} turma(s) cadastrada(s).</p>
                                            </div>
                                            <div class="card-footer bg-transparent border-0 pb-3 d-flex justify-content-between align-items-center">
                                                 <button class="btn btn-sm btn-primary view-discipline-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}">Ver Disciplina</button>
                                                 ${allTurmasFinalized ? '<span class="badge bg-secondary">Turmas Finalizadas</span>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        ` : '<p class="text-muted">Nenhuma disciplina cadastrada nesta instituição.</p>'}
                    </div>
                `;
                if (index < MOCK_DATA.institutions.length - 1) {
                    institutionHTML += '<hr class="my-5" style="border-width: 2px;">';
                }

                container.innerHTML += institutionHTML;
            });

            container.querySelectorAll('.view-discipline-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                   const instId = btn.dataset.instId;
                   switchView('institutions');
                   const collapseElement = document.getElementById(`collapse-inst-${instId}`);
                   if (collapseElement) {
                       const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
                       bsCollapse.show();
                   }
                });
            });
        }
        
        function renderActiveTurmasView() {
            const container = views.activeTurmas;
            container.innerHTML = `
                <h1>Turmas Ativas</h1>
                <p class="lead text-muted">Acesso rápido a todas as suas turmas que ainda não foram finalizadas.</p>
            `;

            let hasActiveTurmas = false;

            MOCK_DATA.institutions.forEach(inst => {
                const activeTurmas = inst.disciplines.flatMap(disc => 
                    disc.turmas.filter(turma => !turma.isFinalized).map(turma => ({...turma, discipline: disc, instId: inst.id }))
                );

                if (activeTurmas.length > 0) {
                    hasActiveTurmas = true;
                    let institutionHTML = `
                        <div class="mt-4">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-building fs-4 me-2"></i>
                                <h3 class="mb-0">${inst.name}</h3>
                            </div>
                            <hr class="my-3">
                            <div class="row g-3">
                                ${activeTurmas.map(turma => `
                                    <div class="col-md-6 col-lg-4">
                                        <div class="card h-100 shadow-sm">
                                            <div class="card-body">
                                                <h5 class="card-title">${turma.discipline.name}</h5>
                                                <h6 class="card-subtitle mb-2 text-muted">${turma.discipline.curso}</h6>
                                                <h6 class="card-subtitle mb-2 text-muted">${turma.name}</h6>
                                                <p class="card-text">${turma.students.length} aluno(s) cadastrado(s).</p>
                                            </div>
                                            <div class="card-footer bg-transparent border-0 pb-3">
                                                 <button class="btn btn-sm btn-primary manage-turma-btn" data-inst-id="${turma.instId}" data-disc-id="${turma.discipline.id}" data-turma-id="${turma.id}">Gerenciar Turma</button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    container.innerHTML += institutionHTML;
                }
            });

            if (!hasActiveTurmas) {
                container.innerHTML += '<div class="alert alert-info mt-4">Você não possui turmas ativas no momento.</div>';
            }

            container.querySelectorAll('.manage-turma-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                   const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
                   const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
                   const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
                   renderTurmaDetailView(turma, disc);
                   switchView('turmaDetail');
                });
            });
        }
        
        function renderTurmaDetailView(turma, disciplina) {
            currentTurmaContext = { turma, disciplina }; 
            const isFinalized = turma.isFinalized;
            const container = views.turmaDetail;
            container.innerHTML = `
                 ${isFinalized ? `
                    <div class="alert alert-warning d-flex align-items-center justify-content-between" role="alert">
                      <div class="d-flex align-items-center">
                          <i class="bi bi-lock-fill me-2"></i>
                          <div>
                            <strong>Semestre Finalizado!</strong> Esta turma está bloqueada e não pode mais ser editada.
                          </div>
                      </div>
                      <button id="reopen-turma-btn" class="btn btn-sm btn-outline-dark">Retornar Turma</button>
                    </div>
                ` : ''}
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2>${disciplina.curso}</h2>
                        <h3 class="text-muted fw-normal">${disciplina.name} - ${turma.name}</h3>
                        <p class="text-muted mb-0">Gerenciamento de notas e alunos.</p>
                    </div>
                    <div class="btn-toolbar" role="toolbar">
                        <div class="btn-group me-2 mb-2" role="group">
                            <button id="save-grades-btn" class="btn btn-success" ${isFinalized ? 'disabled' : ''}><i class="bi bi-check2-circle me-1"></i> Salvar</button>
                        </div>
                        <div class="btn-group me-2 mb-2" role="group">
                            <button id="add-student-btn" class="btn btn-primary" ${isFinalized ? 'disabled' : ''}><i class="bi bi-person-plus-fill me-1"></i> Adicionar Aluno</button>
                            <button class="btn btn-outline-secondary"><i class="bi bi-upload me-1"></i> Importar</button>
                            <button class="btn btn-outline-secondary"><i class="bi bi-download me-1"></i> Exportar</button>
                        </div>
                        <div class="btn-group mb-2" role="group">
                            <button class="btn btn-info text-white" id="toggle-audit-panel-btn"><i class="bi bi-terminal me-1"></i> Auditoria</button>
                            <button id="calculate-avg-btn" class="btn btn-warning" ${isFinalized ? 'disabled' : ''}><i class="bi bi-calculator me-1"></i> Calcular Médias</button>
                            <button id="finalize-semester-btn" class="btn btn-danger" ${isFinalized ? 'disabled' : ''}><i class="bi bi-lock me-1"></i> Finalizar Semestre</button>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Configurações de Avaliação</h5>
                            <button class="btn btn-outline-primary" id="toggle-formula-btn" ${isFinalized ? 'disabled' : ''}><i class="bi bi-pencil-square me-1"></i> Editar</button>
                        </div>
                        <div id="formula-editor" class="d-none mt-3">
                            <div class="row g-3">
                                <div class="col-md-9">
                                    <label for="formula-input" class="form-label">Fórmula de Cálculo</label>
                                    <input type="text" id="formula-input" class="form-control" value="${disciplina.finalGradeFormula}" ${isFinalized ? 'disabled' : ''}>
                                    <div id="formula-feedback" class="form-text mt-2"></div>
                                </div>
                                <div class="col-md-3">
                                    <label for="max-grade-input" class="form-label">Nota Máxima</label>
                                    <input type="number" id="max-grade-input" class="form-control" value="${disciplina.maxGrade || 10}" min="0" ${isFinalized ? 'disabled' : ''}>
                                </div>
                            </div>
                            <div class="btn-group mt-3">
                                <button id="save-formula-btn" class="btn btn-success" ${isFinalized ? 'disabled' : ''}>Salvar Configurações</button>
                                <button id="test-formula-btn" class="btn btn-outline-info" ${isFinalized ? 'disabled' : ''}>Testar Fórmula</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="card shadow-sm">
                            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Quadro de Notas</h5>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="edit-mode-toggle" ${isFinalized ? 'disabled' : ''}>
                                    <label class="form-check-label" for="edit-mode-toggle">Modo Edição Completa</label>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle">
                                        <thead class="table-light" id="grades-table-head"></thead>
                                        <tbody id="grades-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card shadow-sm">
                             <div class="card-header bg-white"><h5 class="mb-0">Atividades e Avaliações</h5></div>
                             <div class="card-body">
                                <ul class="list-group mb-3" id="grade-components-list"></ul>
                                <div ${isFinalized ? 'style="display:none;"' : ''}>
                                    <h6>Adicionar Nova Atividade</h6>
                                    <div class="row g-2">
                                        <div class="col-12"><input type="text" id="new-comp-name" class="form-control" placeholder="Nome (Ex: Prova 1)"></div>
                                        <div class="col-12"><input type="text" id="new-comp-acronym" class="form-control" placeholder="Sigla (Ex: P1)"></div>
                                    </div>
                                    <button id="add-component-btn" class="btn btn-primary mt-2 w-100">Adicionar Atividade</button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow-sm mt-4 d-none" id="audit-panel-container">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="bi bi-terminal me-2"></i>Painel de Auditoria (Console LOG)</h5>
                        <button class="btn-close" id="close-audit-panel-btn"></button>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Qualquer alteração ou modificação que acontecer nesta turma ficará registrada aqui.</p>
                        <div id="audit-log-list" class="list-group">
                            <!-- Logs will be rendered here by JS -->
                        </div>
                    </div>
                </div>
            `;
            
            updateGradeComponentsList(disciplina);
            updateGradesTable(turma, disciplina);
            renderAuditLog();
            
            if (!isFinalized) {
                document.getElementById('edit-mode-toggle').addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    document.querySelectorAll('#grades-table-body .grade-input').forEach(input => input.disabled = !isChecked);
                    addAuditLog(isChecked ? `Modo de edição completa ativado.` : `Modo de edição completa desativado.`);
                });

                document.getElementById('add-component-btn').addEventListener('click', () => {
                    const nameInput = document.getElementById('new-comp-name');
                    const acronymInput = document.getElementById('new-comp-acronym');
                    if (nameInput.value && acronymInput.value) {
                        const snapshot = createSnapshot(turma);
                        disciplina.gradeComponents.push({ id: Date.now(), name: nameInput.value, acronym: acronymInput.value, description: '' });
                        addAuditLog(`Nova atividade "${nameInput.value}" (${acronymInput.value}) adicionada.`, snapshot);
                        renderTurmaDetailView(turma, disciplina);
                    }
                });
                
                document.getElementById('save-grades-btn').addEventListener('click', () => {
                    const snapshot = createSnapshot(turma);
                    document.querySelectorAll('#grades-table-body tr').forEach(row => {
                        const student = turma.students.find(s => s.id == row.dataset.studentId);
                        if (student) {
                            row.querySelectorAll('.grade-input[data-acronym]').forEach(input => {
                                if (input.dataset.acronym) student.grades[input.dataset.acronym] = parseFloat(input.value) || 0;
                            });
                        }
                    });
                    addAuditLog(`Notas salvas para a turma ${turma.name}.`, snapshot);
                    updateGradesTable(turma, disciplina);
                    alert('Notas salvas com sucesso!');
                });
                
                document.getElementById('add-student-btn').addEventListener('click', () => addStudentModal.show());
                document.getElementById('calculate-avg-btn').addEventListener('click', () => {
                    updateGradesTable(turma, disciplina);
                    addAuditLog('Médias recalculadas para todos os alunos.');
                    alert('Médias recalculadas com sucesso!');
                });
                document.getElementById('finalize-semester-btn').addEventListener('click', () => finalizeSemesterModal.show());
                document.getElementById('toggle-formula-btn').addEventListener('click', () => document.getElementById('formula-editor').classList.toggle('d-none'));

                const formulaInput = document.getElementById('formula-input');
                const formulaFeedback = document.getElementById('formula-feedback');
                const maxGradeInput = document.getElementById('max-grade-input');

                formulaInput.addEventListener('input', () => {
                    disciplina.maxGrade = parseFloat(maxGradeInput.value) || 10;
                    const result = testAndValidateFormula(formulaInput.value, disciplina);
                    formulaFeedback.textContent = result.message;
                    formulaFeedback.className = result.valid ? 'form-text text-success' : 'form-text text-danger';
                });
                
                maxGradeInput.addEventListener('input', () => formulaInput.dispatchEvent(new Event('input')));

                document.getElementById('test-formula-btn').addEventListener('click', () => {
                    disciplina.maxGrade = parseFloat(maxGradeInput.value) || 10;
                    const result = testAndValidateFormula(formulaInput.value, disciplina);
                    if (result.valid) {
                        alert(`Teste bem-sucedido!\nCom todas as notas máximas (${disciplina.maxGrade}), o resultado da fórmula é ${result.testResult.toFixed(2)}.`);
                    } else {
                        alert(`Falha no teste: ${result.message}`);
                    }
                });

                document.getElementById('save-formula-btn').addEventListener('click', () => {
                    const snapshot = createSnapshot(turma);
                    disciplina.maxGrade = parseFloat(maxGradeInput.value) || 10;
                    const result = testAndValidateFormula(formulaInput.value, disciplina);
                    formulaFeedback.classList.remove('shake-error');
                    
                    if (result.valid) {
                        disciplina.finalGradeFormula = formulaInput.value;
                        updateGradesTable(turma, disciplina);
                        addAuditLog(`Configurações de avaliação salvas. Fórmula: ${disciplina.finalGradeFormula}, Nota Máx.: ${disciplina.maxGrade}`, snapshot);
                        alert('Configurações de avaliação salvas com sucesso!');
                    } else {
                        alert(`Configurações inválidas: ${result.message}\n\nAs alterações não foram salvas.`);
                        void formulaFeedback.offsetWidth;
                        formulaFeedback.classList.add('shake-error');
                    }
                });
            } else {
                document.getElementById('reopen-turma-btn').addEventListener('click', () => reopenTurmaModal.show());
            }

            const auditPanel = document.getElementById('audit-panel-container');
            document.getElementById('toggle-audit-panel-btn').addEventListener('click', () => {
                auditPanel.classList.remove('d-none');
                auditPanel.scrollIntoView({ behavior: 'smooth' });
            });
            document.getElementById('close-audit-panel-btn').addEventListener('click', () => auditPanel.classList.add('d-none'));
        }
        
        function updateGradeComponentsList(disciplina) {
            const list = document.getElementById('grade-components-list');
            list.innerHTML = disciplina.gradeComponents.map(comp => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><strong>${comp.acronym}:</strong> ${comp.name}</span>
                </li>
            `).join('');
        }

        function updateGradesTable(turma, disciplina) {
            const tableHead = document.getElementById('grades-table-head');
            const tableBody = document.getElementById('grades-table-body');
            const isFinalized = turma.isFinalized;
            const maxGrade = disciplina.maxGrade || 10;
            
            let tableHeaders = `<th scope="col">Matrícula</th><th scope="col">Nome</th>`;
            disciplina.gradeComponents.forEach(comp => {
                tableHeaders += `<th scope="col" title="${comp.description}">${comp.name} (${comp.acronym})</th>`;
            });
            tableHeaders += `<th scope="col">Nota Final</th>`;
            if (disciplina.hasAdjustedColumn) {
                tableHeaders += '<th scope="col">Final Ajustada</th>';
            }
            tableHead.innerHTML = `<tr>${tableHeaders}</tr>`;

            tableBody.innerHTML = '';
            turma.students.forEach(student => {
                const finalGrade = calculateFinalGrade(student.grades, disciplina.finalGradeFormula, disciplina.gradeComponents);
                let gradeCells = '';
                disciplina.gradeComponents.forEach(comp => {
                    gradeCells += `<td><input type="number" class="grade-input" data-acronym="${comp.acronym}" data-student-name="${student.name}" data-component-name="${comp.name}" value="${student.grades[comp.acronym] || ''}" min="0" max="${maxGrade}" step="0.01" disabled></td>`;
                });
                
                const row = document.createElement('tr');
                row.dataset.studentId = student.id;
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    ${gradeCells}
                    <td>${isNaN(finalGrade) ? 'Erro' : finalGrade.toFixed(2)}</td>
                    ${disciplina.hasAdjustedColumn ? `<td><input type="number" class="grade-input" value="${isNaN(finalGrade) ? '' : adjustGrade(finalGrade).toFixed(1)}" min="0" max="${maxGrade}" step="0.5" disabled></td>` : ''}
                `;
                tableBody.appendChild(row);
            });
            
            tableBody.querySelectorAll('.grade-input[data-acronym]').forEach(input => {
                let oldValue = input.value;
                input.addEventListener('focus', (e) => { oldValue = e.target.value; });
                input.addEventListener('change', (e) => {
                    const newValue = e.target.value;
                    const studentName = e.target.dataset.studentName;
                    const componentName = e.target.dataset.componentName;
                    addAuditLog(`Nota de "${componentName}" do aluno ${studentName} alterada de ${oldValue || 'vazio'} para ${newValue}.`);
                });
            });

             if (isFinalized) {
                tableBody.querySelectorAll('.grade-input').forEach(i => i.disabled = true);
            }
        }
        
        function renderAuditLog() {
            const logList = document.getElementById('audit-log-list');
            if (!logList) return;
            logList.innerHTML = MOCK_DATA.auditLog.map(log => `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted d-block">${log.timestamp}</small>
                        <span>${log.message}</span>
                    </div>
                    ${log.snapshot ? `<button class="btn btn-sm btn-outline-success revert-log-btn" data-log-id="${log.id}" title="Reverter para este ponto">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>` : ''}
                </div>
            `).join('');

            logList.querySelectorAll('.revert-log-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const logId = btn.dataset.logId;
                    const logEntry = MOCK_DATA.auditLog.find(l => l.id == logId);
                    if (logEntry && logEntry.snapshot) {
                        const inst = MOCK_DATA.institutions.find(i => i.disciplines.some(d => d.turmas.some(t => t.id === currentTurmaContext.turma.id)));
                        const disc = inst.disciplines.find(d => d.turmas.some(t => t.id === currentTurmaContext.turma.id));
                        const turmaIndex = disc.turmas.findIndex(t => t.id === currentTurmaContext.turma.id);
                        
                        if (turmaIndex !== -1) {
                            disc.turmas[turmaIndex] = createSnapshot(logEntry.snapshot);
                            addAuditLog(`Turma revertida para o estado de ${logEntry.timestamp}.`);
                            renderTurmaDetailView(disc.turmas[turmaIndex], disc);
                        }
                    }
                });
            });
        }

        function renderInstitutions() {
            const institutionsAccordion = views.institutions;
            institutionsAccordion.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2>Gerenciamento</h2>
                        <p class="mb-0 text-muted">Navegue e gerencie suas instituições, disciplinas e turmas.</p>
                    </div>
                    <button class="btn btn-primary" id="add-new-from-management-btn">
                        <i class="bi bi-plus-circle me-1"></i> Cadastrar Novo
                    </button>
                </div>
                <div class="accordion" id="institutions-accordion-container">
                    ${MOCK_DATA.institutions.map((inst, i) => `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading-inst-${inst.id}">
                                <button class="accordion-button ${i !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.id}" aria-expanded="${i === 0}" aria-controls="collapse-inst-${inst.id}">
                                    <i class="bi bi-building me-2"></i> ${inst.name}
                                </button>
                            </h2>
                            <div id="collapse-inst-${inst.id}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" aria-labelledby="heading-inst-${inst.id}" data-bs-parent="#institutions-accordion-container">
                                <div class="accordion-body">
                                   ${inst.disciplines.length > 0 ? inst.disciplines.map(disc => `
                                        <div class="card mb-2 shadow-sm">
                                            <div class="card-header d-flex justify-content-between align-items-center">
                                                <a class="text-decoration-none text-body flex-grow-1" data-bs-toggle="collapse" href="#collapse-disc-${disc.id}" role="button" aria-expanded="false" aria-controls="collapse-disc-${disc.id}">
                                                    <div>
                                                        <span class="fw-bold">${disc.name} (${disc.code})</span>
                                                        <br>
                                                        <small class="text-muted">${disc.curso}</small>
                                                    </div>
                                                </a>
                                                <div class="btn-group">
                                                     <button class="btn btn-sm btn-outline-secondary edit-discipline-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}">
                                                        <i class="bi bi-pencil-square" title="Editar Disciplina"></i>
                                                     </button>
                                                     <button class="btn btn-sm btn-outline-danger delete-discipline-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-disc-name="${disc.name}">
                                                        <i class="bi bi-trash" title="Excluir Disciplina"></i>
                                                     </button>
                                                </div>
                                            </div>
                                            <div class="collapse" id="collapse-disc-${disc.id}">
                                                <ul class="list-group list-group-flush">
                                                    ${disc.turmas.map(turma => `
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            <span>
                                                                ${turma.name}
                                                                ${turma.isFinalized ? '<span class="badge bg-secondary ms-2">Finalizada</span>' : ''}
                                                            </span>
                                                            <div class="btn-group">
                                                                <button class="btn btn-sm btn-outline-danger delete-turma-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}" data-turma-name="${turma.name}">
                                                                    <i class="bi bi-trash" title="Excluir Turma"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-secondary edit-turma-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}">
                                                                    <i class="bi bi-pencil" title="Editar Turma e Disciplina"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-primary view-turma-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}">
                                                                    Abrir Turma <i class="bi bi-arrow-right-short"></i>
                                                                </button>
                                                            </div>
                                                        </li>`).join('')}
                                                    ${disc.turmas.length === 0 ? '<li class="list-group-item text-muted">Nenhuma turma cadastrada.</li>' : ''}
                                                </ul>
                                            </div>
                                        </div>
                                   `).join('') : '<p>Nenhuma disciplina cadastrada.</p>'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            document.getElementById('add-new-from-management-btn').addEventListener('click', () => {
                switchView('creation');
            });
            
            document.querySelectorAll('.view-turma-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                   const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
                   const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
                   const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
                   renderTurmaDetailView(turma, disc);
                   switchView('turmaDetail');
                });
            });

            document.querySelectorAll('.edit-turma-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                   const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
                   const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
                   const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
                   
                   document.getElementById('edit-turma-name').value = turma.name;
                   document.getElementById('edit-discipline-period').value = disc.period;
                   document.getElementById('edit-discipline-max-grade').value = disc.maxGrade || 10;
                   
                   const instSelect = document.getElementById('edit-turma-inst-select');
                   const cursoSelect = document.getElementById('edit-discipline-curso-select');
                   instSelect.innerHTML = MOCK_DATA.institutions.map(i => `<option value="${i.id}" ${i.id == inst.id ? 'selected' : ''}>${i.name}</option>`).join('');

                   const updateCourseDropdownForTurmaEdit = (selectedInstId) => {
                       const selectedInst = MOCK_DATA.institutions.find(i => i.id == selectedInstId);
                       if (selectedInst) {
                           cursoSelect.innerHTML = selectedInst.courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
                           if (selectedInstId == inst.id) {
                               cursoSelect.value = disc.curso;
                           }
                       }
                   };
                   instSelect.addEventListener('change', () => updateCourseDropdownForTurmaEdit(instSelect.value));
                   updateCourseDropdownForTurmaEdit(inst.id);

                   const confirmBtn = document.getElementById('confirm-edit-turma-btn');
                   confirmBtn.dataset.instId = inst.id;
                   confirmBtn.dataset.discId = disc.id;
                   confirmBtn.dataset.turmaId = turma.id;
                   
                   editTurmaModal.show();
                });
            });

            document.querySelectorAll('.edit-discipline-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const { instId, discId } = btn.dataset;
                    const inst = MOCK_DATA.institutions.find(i => i.id == instId);
                    const disc = inst.disciplines.find(d => d.id == discId);

                    document.getElementById('edit-discipline-name').value = disc.name;
                    document.getElementById('edit-discipline-code').value = disc.code;
                    
                    const instSelect = document.getElementById('edit-discipline-inst-select');
                    const courseSelect = document.getElementById('edit-discipline-course-select-move');
                    
                    instSelect.innerHTML = MOCK_DATA.institutions.map(i => `<option value="${i.id}" ${i.id == instId ? 'selected' : ''}>${i.name}</option>`).join('');
                    
                    const updateCourseDropdownForDisciplineEdit = (selectedInstId) => {
                        const selectedInst = MOCK_DATA.institutions.find(i => i.id == selectedInstId);
                        courseSelect.innerHTML = selectedInst.courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
                        if (selectedInstId == instId) {
                            courseSelect.value = disc.curso;
                        }
                    };
                    
                    instSelect.addEventListener('change', () => updateCourseDropdownForDisciplineEdit(instSelect.value));
                    updateCourseDropdownForDisciplineEdit(instId);

                    const confirmBtn = document.getElementById('confirm-edit-discipline-btn');
                    confirmBtn.dataset.originalInstId = instId;
                    confirmBtn.dataset.discId = discId;
                    
                    editDisciplineModal.show();
                });
            });

            document.querySelectorAll('.delete-turma-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const { instId, discId, turmaId, turmaName } = btn.dataset;
                    document.getElementById('turma-to-delete-name').textContent = turmaName;
                    const confirmBtn = document.getElementById('confirm-delete-turma-btn');
                    confirmBtn.dataset.instId = instId;
                    confirmBtn.dataset.discId = discId;
                    confirmBtn.dataset.turmaId = turmaId;
                    deleteTurmaModal.show();
                });
            });

             document.querySelectorAll('.delete-discipline-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const { instId, discId, discName } = btn.dataset;
                    document.getElementById('discipline-to-delete-name').textContent = discName;
                    const confirmBtn = document.getElementById('confirm-delete-discipline-btn');
                    confirmBtn.dataset.instId = instId;
                    confirmBtn.dataset.discId = discId;
                    deleteDisciplineModal.show();
                });
            });
        }

        function renderInstitutionsFlyout() {
            const flyoutList = document.getElementById('institutions-flyout-list');
            if (!flyoutList) return;

            let html = `
                <li>
                    <a href="#" class="submenu-item d-flex align-items-center fw-bold cadastrar-novo-flyout">
                        <i class="bi bi-plus-circle me-2"></i>
                        Cadastrar Novo
                    </a>
                </li>
                <li><hr class="dropdown-divider my-2"></li>
            `;

            MOCK_DATA.institutions.forEach(inst => {
                html += `<li class="px-3 py-1 text-muted text-uppercase small fw-bold">${inst.name}</li>`;
                if (inst.disciplines.length > 0) {
                    inst.disciplines.forEach(disc => {
                        disc.turmas.forEach(turma => {
                            html += `
                                <li>
                                    <a href="#" title="${disc.name} - ${turma.name}" class="submenu-item view-turma-flyout" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}">
                                        ${disc.name} - ${turma.name} ${turma.isFinalized ? '(Finalizada)' : ''}
                                    </a>
                                </li>
                            `;
                        });
                    });
                } else {
                    html += `<li><span class="submenu-item text-muted fst-italic px-3">Nenhuma disciplina</span></li>`;
                }
                 html += `<li><hr class="dropdown-divider my-2"></li>`;
            });

            flyoutList.innerHTML = html;

            flyoutList.querySelectorAll('.view-turma-flyout').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
                    const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
                    const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
                    renderTurmaDetailView(turma, disc);
                    switchView('turmaDetail');
                });
            });

            flyoutList.querySelector('.cadastrar-novo-flyout').addEventListener('click', (e) => {
                e.preventDefault();
                switchView('creation');
            });
        }
        
        function renderCreationView() {
            const container = views.creation;
            container.innerHTML = `
                <h1>Cadastrar Nova Turma</h1>
                <p class="lead text-muted">Preencha os detalhes abaixo para criar uma nova turma.</p>
                <div class="card mt-4">
                    <div class="card-body">
                        <form id="creation-form">
                            <div class="mb-3">
                                <label for="institution-select" class="form-label fw-bold">1. Instituição</label>
                                <select id="institution-select" class="form-select"></select>
                            </div>

                            <div class="mb-3">
                                <label for="course-select" class="form-label fw-bold">2. Curso</label>
                                <select id="course-select" class="form-select" disabled></select>
                            </div>

                            <div class="mb-3">
                                <label for="discipline-select" class="form-label fw-bold">3. Disciplina</label>
                                <select id="discipline-select" class="form-select" disabled></select>
                            </div>
                            
                            <div id="new-discipline-fields" class="border p-3 rounded mb-3 bg-light">
                                <h6 class="text-dark">Criar Nova Disciplina</h6>
                                <div class="mb-2">
                                    <label for="new-discipline-name" class="form-label text-dark">Nome da Disciplina</label>
                                    <input type="text" id="new-discipline-name" class="form-control">
                                </div>
                                <div class="mb-2">
                                    <label for="new-discipline-code" class="form-label text-dark">Código da Disciplina (Ex: ES-PI2)</label>
                                    <input type="text" id="new-discipline-code" class="form-control">
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">4. Detalhes da Turma</label>
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label for="new-turma-name" class="form-label">Nome da Turma</label>
                                        <input type="text" id="new-turma-name" class="form-control" required placeholder="Ex: Turma 1">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="new-turma-semestre" class="form-label">Semestre</label>
                                        <input type="text" id="new-turma-semestre" class="form-control" placeholder="Ex: 4º Semestre">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="new-turma-periodo" class="form-label">Período</label>
                                        <select id="new-turma-periodo" class="form-select">
                                            <option selected>Noturno</option>
                                            <option>Matutino</option>
                                            <option>Vespertino</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg mt-3"><i class="bi bi-check-circle me-2"></i>Criar Turma</button>
                        </form>
                    </div>
                </div>
            `;

            const creationForm = container.querySelector('#creation-form');
            const instSelect = container.querySelector('#institution-select');
            const courseSelect = container.querySelector('#course-select');
            const discSelect = container.querySelector('#discipline-select');
            const newDiscFields = container.querySelector('#new-discipline-fields');

            instSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

            function updateCourseSelect(instId) {
                const institution = MOCK_DATA.institutions.find(i => i.id == instId);
                courseSelect.innerHTML = '';
                discSelect.innerHTML = '';
                discSelect.disabled = true;
                
                if (institution && institution.courses.length > 0) {
                    courseSelect.innerHTML = institution.courses.map(course => `<option value="${course.name}">${course.name}</option>`).join('');
                    courseSelect.disabled = false;
                    updateDisciplineSelect(instId, courseSelect.value);
                } else {
                    courseSelect.innerHTML = '<option disabled selected>Nenhum curso cadastrado</option>';
                    courseSelect.disabled = true;
                }
            }

            function updateDisciplineSelect(instId, courseName) {
                const institution = MOCK_DATA.institutions.find(i => i.id == instId);
                discSelect.innerHTML = '';
                newDiscFields.classList.remove('expanded');
                if (institution) {
                    const filteredDisciplines = institution.disciplines.filter(d => d.curso === courseName);
                    discSelect.innerHTML = filteredDisciplines.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
                    discSelect.innerHTML += '<option value="new">--- Criar nova disciplina ---</option>';
                    discSelect.disabled = false;
                }
            }
            
            instSelect.addEventListener('change', () => updateCourseSelect(instSelect.value));
            courseSelect.addEventListener('change', () => updateDisciplineSelect(instSelect.value, courseSelect.value));
            discSelect.addEventListener('change', () => {
                if (discSelect.value === 'new') {
                    newDiscFields.classList.add('expanded');
                } else {
                    newDiscFields.classList.remove('expanded');
                }
            });

            creationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const selectedInstId = instSelect.value;
                const selectedCourseName = courseSelect.value;
                const institution = MOCK_DATA.institutions.find(i => i.id == selectedInstId);
                let discipline;

                if (discSelect.value === 'new') {
                    if (!selectedCourseName) {
                        alert('Por favor, selecione um curso antes de criar uma nova disciplina.'); return;
                    }
                    const newDisciplineName = document.getElementById('new-discipline-name').value;
                    const newDisciplineCode = document.getElementById('new-discipline-code').value;
                    if (!newDisciplineName || !newDisciplineCode) { 
                        alert('Preencha o nome e o código da nova disciplina.'); return; 
                    }
                    discipline = {
                        id: Date.now(), name: newDisciplineName, code: newDisciplineCode, curso: selectedCourseName,
                        period: document.getElementById('new-turma-semestre').value,
                        maxGrade: 10, gradeComponents: [], finalGradeFormula: '', hasAdjustedColumn: false, turmas: []
                    };
                    institution.disciplines.push(discipline);
                } else {
                    discipline = institution.disciplines.find(d => d.id == discSelect.value);
                }
                
                const newTurmaName = document.getElementById('new-turma-name').value;
                if(!newTurmaName) { alert('O nome da turma é obrigatório.'); return; }
                
                const newTurma = {
                     id: Date.now(), name: newTurmaName, code: newTurmaName.replace(/\s/g, '').toUpperCase(), students: [], isFinalized: false
                };
                discipline.turmas.push(newTurma);
                alert(`Turma "${newTurma.name}" criada com sucesso na disciplina "${discipline.name}"!`);
                
                renderAllViews();
                switchView('institutions');
                
                const collapseElement = document.getElementById(`collapse-inst-${selectedInstId}`);
                if (collapseElement) { new bootstrap.Collapse(collapseElement, { toggle: false }).show(); }
            });
            
            if (MOCK_DATA.institutions.length > 0) {
                updateCourseSelect(instSelect.value);
            }
        }

        function renderSettingsView() {
            const container = views.settings;
            container.innerHTML = `
                <h1>Configurações</h1>
                <p class="lead text-muted">Gerencie as configurações da sua conta e da aplicação.</p>
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Tema da Interface</h5>
                        <p>Escolha entre o tema claro ou escuro para a sua visualização.</p>
                        <div>
                            <button id="light-mode-btn" class="btn btn-outline-secondary">
                                <i class="bi bi-sun me-1"></i> Modo Light
                            </button>
                            <button id="dark-mode-btn" class="btn btn-dark">
                                <i class="bi bi-moon-stars me-1"></i> Modo Dark
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Alterar Senha</h5>
                        <form>
                            <div class="mb-3">
                                <label for="current-password" class="form-label">Senha Atual</label>
                                <input type="password" class="form-control" id="current-password">
                            </div>
                            <div class="mb-3">
                                <label for="new-password" class="form-label">Nova Senha</label>
                                <input type="password" class="form-control" id="new-password">
                            </div>
                             <div class="mb-3">
                                <label for="confirm-password" class="form-label">Confirmar Nova Senha</label>
                                <input type="password" class="form-control" id="confirm-password">
                            </div>
                            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                        </form>
                    </div>
                </div>

                <div class="card mt-4 border-danger">
                     <div class="card-body">
                        <h5 class="card-title text-danger">Sair do Sistema</h5>
                        <p>Esta ação irá encerrar sua sessão atual.</p>
                        <button class="btn btn-danger" id="logout-btn">
                            <i class="bi bi-box-arrow-right me-1"></i> Sair
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('dark-mode-btn').addEventListener('click', () => document.body.classList.add('dark-mode'));
            document.getElementById('light-mode-btn').addEventListener('click', () => document.body.classList.remove('dark-mode'));
            document.getElementById('logout-btn').addEventListener('click', () => logoutModal.show());
        }

        function renderAllViews() {
            renderProfileView(); 
            renderDashboardView(); 
            renderInstitutions(); 
            renderInstitutionsFlyout(); 
            renderSettingsView(); 
            renderActiveTurmasView();
        }
        
        function init() {
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchView(e.currentTarget.dataset.view);
                });
            });

            const sidebarToggler = document.getElementById('sidebarToggler');
            const togglerIcon = sidebarToggler.querySelector('i');
            sidebarToggler.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-collapsed');
                togglerIcon.className = document.body.classList.contains('sidebar-collapsed') ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
            });
            
            document.getElementById('confirm-logout-btn').addEventListener('click', () => {
                logoutModal.hide();
                document.body.innerHTML = `<div class="vh-100 d-flex justify-content-center align-items-center"><h1>Você saiu do sistema.</h1></div>`;
            });
            
            document.getElementById('confirm-add-institution-btn').addEventListener('click', () => {
                const newInstNameInput = document.getElementById('new-institution-name');
                if(newInstNameInput.value && document.getElementById('current-password-inst').value) {
                    MOCK_DATA.institutions.push({ id: Date.now(), name: newInstNameInput.value, courses: [], disciplines: [] });
                    document.getElementById('add-institution-form').reset();
                    addInstitutionModal.hide();
                    renderAllViews();
                    alert(`Instituição "${newInstNameInput.value}" adicionada com sucesso!`);
                } else {
                    alert('Por favor, preencha todos os campos.');
                }
            });

            document.getElementById('confirm-add-course-btn').addEventListener('click', (e) => {
                const newCourseNameInput = document.getElementById('new-course-name');
                const instId = e.currentTarget.dataset.instId;
                if(newCourseNameInput.value && document.getElementById('current-password-course').value) {
                    const inst = MOCK_DATA.institutions.find(i => i.id == instId);
                    if (inst) {
                        const instCourseSelect = document.getElementById('institution-course-mgmt-select');
                        const previouslySelectedInstId = instCourseSelect ? instCourseSelect.value : null;

                        inst.courses.push({ id: Date.now(), name: newCourseNameInput.value });
                        document.getElementById('add-course-form').reset();
                        addCourseModal.hide();
                        
                        renderProfileView(previouslySelectedInstId);
                        alert(`Curso "${newCourseNameInput.value}" adicionado a ${inst.name} com sucesso!`);
                    }
                } else {
                    alert('Por favor, preencha todos os campos.');
                }
            });
            
            document.getElementById('confirm-edit-turma-btn').addEventListener('click', (e) => {
                if (!document.getElementById('current-password-edit').value) { alert('Confirme sua senha para salvar.'); return; }
                
                const { instId: originalInstId, discId: originalDiscId, turmaId } = e.currentTarget.dataset;
                
                const newTurmaName = document.getElementById('edit-turma-name').value;
                const newPeriod = document.getElementById('edit-discipline-period').value;
                const newMaxGrade = parseFloat(document.getElementById('edit-discipline-max-grade').value) || 10;
                const newCourseName = document.getElementById('edit-discipline-curso-select').value;
                const newInstId = document.getElementById('edit-turma-inst-select').value;

                const originalInst = MOCK_DATA.institutions.find(i => i.id == originalInstId);
                const originalDisc = originalInst.disciplines.find(d => d.id == originalDiscId);
                
                const turmaIndex = originalDisc.turmas.findIndex(t => t.id == turmaId);
                const [turmaToMove] = originalDisc.turmas.splice(turmaIndex, 1);
                
                turmaToMove.name = newTurmaName;
                
                const targetInst = MOCK_DATA.institutions.find(i => i.id == newInstId);
                
                let targetDisc = targetInst.disciplines.find(d => d.name === originalDisc.name && d.curso === newCourseName);

                if (!targetDisc) {
                    targetDisc = {
                        ...createSnapshot(originalDisc),
                        id: Date.now(),
                        curso: newCourseName,
                        turmas: []
                    };
                    targetInst.disciplines.push(targetDisc);
                    addAuditLog(`Disciplina "${targetDisc.name}" criada automaticamente no curso "${newCourseName}" da instituição "${targetInst.name}".`);
                }

                targetDisc.period = newPeriod;
                targetDisc.maxGrade = newMaxGrade;
                targetDisc.turmas.push(turmaToMove);

                addAuditLog(`Turma "${turmaToMove.name}" movida/atualizada para a disciplina "${targetDisc.name}" no curso "${newCourseName}".`);
                
                document.getElementById('edit-turma-form').reset();
                editTurmaModal.hide();
                renderAllViews();
                alert('Turma atualizada com sucesso!');
            });

            document.getElementById('confirm-edit-discipline-btn').addEventListener('click', (e) => {
                if (!document.getElementById('current-password-edit-disc').value) { alert('Confirme sua senha para salvar.'); return; }
                
                const { originalInstId, discId } = e.currentTarget.dataset;
                const newName = document.getElementById('edit-discipline-name').value;
                const newCode = document.getElementById('edit-discipline-code').value;
                const newInstId = document.getElementById('edit-discipline-inst-select').value;
                const newCourseName = document.getElementById('edit-discipline-course-select-move').value;

                if (!newName || !newCode || !newInstId || !newCourseName) {
                    alert('Todos os campos são obrigatórios.');
                    return;
                }

                const originalInst = MOCK_DATA.institutions.find(i => i.id == originalInstId);
                const discIndex = originalInst.disciplines.findIndex(d => d.id == discId);
                const [disciplineToMove] = originalInst.disciplines.splice(discIndex, 1);

                const originalName = disciplineToMove.name;
                disciplineToMove.name = newName;
                disciplineToMove.code = newCode;
                disciplineToMove.curso = newCourseName;
                
                const targetInst = MOCK_DATA.institutions.find(i => i.id == newInstId);
                targetInst.disciplines.push(disciplineToMove);

                addAuditLog(`Disciplina "${originalName}" foi atualizada para "${newName}" e movida para o curso "${newCourseName}" na instituição "${targetInst.name}".`);
                editDisciplineModal.hide();
                document.getElementById('edit-discipline-form').reset();
                renderAllViews();
                alert('Disciplina atualizada com sucesso!');
            });

            document.getElementById('confirm-delete-turma-btn').addEventListener('click', (e) => {
                const { instId, discId, turmaId } = e.currentTarget.dataset;
                const inst = MOCK_DATA.institutions.find(i => i.id == instId);
                if (!inst) return;

                const disc = inst.disciplines.find(d => d.id == discId);
                if (!disc) return;

                const turmaIndex = disc.turmas.findIndex(t => t.id == turmaId);
                if (turmaIndex > -1) {
                    const deletedTurmaName = disc.turmas[turmaIndex].name;
                    disc.turmas.splice(turmaIndex, 1);
                    addAuditLog(`Turma "${deletedTurmaName}" da disciplina "${disc.name}" foi excluída.`);
                    deleteTurmaModal.hide();
                    renderAllViews();
                    alert(`Turma "${deletedTurmaName}" excluída com sucesso!`);
                }
            });

            document.getElementById('confirm-delete-discipline-btn').addEventListener('click', (e) => {
                const { instId, discId } = e.currentTarget.dataset;
                const inst = MOCK_DATA.institutions.find(i => i.id == instId);
                if (!inst) return;

                const discIndex = inst.disciplines.findIndex(d => d.id == discId);
                if (discIndex > -1) {
                     const deletedDiscName = inst.disciplines[discIndex].name;
                     inst.disciplines.splice(discIndex, 1);
                     addAuditLog(`Disciplina "${deletedDiscName}" da instituição "${inst.name}" foi excluída.`);
                     deleteDisciplineModal.hide();
                     renderAllViews();
                     alert(`Disciplina "${deletedDiscName}" excluída com sucesso!`);
                }
            });

            document.getElementById('confirm-delete-institution-btn').addEventListener('click', (e) => {
                const instId = e.currentTarget.dataset.id;
                const instIndex = MOCK_DATA.institutions.findIndex(i => i.id == instId);
                if (instIndex > -1) {
                    const instName = MOCK_DATA.institutions[instIndex].name;
                    MOCK_DATA.institutions.splice(instIndex, 1);
                    addAuditLog(`Instituição "${instName}" e todos os seus dados foram excluídos.`);
                    deleteInstitutionModal.hide();
                    renderAllViews();
                    alert(`Instituição "${instName}" excluída com sucesso!`);
                }
            });

             document.getElementById('confirm-delete-course-btn').addEventListener('click', (e) => {
                const { instId, courseName } = e.currentTarget.dataset;
                const inst = MOCK_DATA.institutions.find(i => i.id == instId);
                if (!inst) return;

                const courseIndex = inst.courses.findIndex(c => c.name === courseName);
                if (courseIndex > -1) {
                    inst.courses.splice(courseIndex, 1);
                    inst.disciplines = inst.disciplines.filter(d => d.curso !== courseName);
                    
                    addAuditLog(`Curso "${courseName}" e todas as disciplinas associadas na instituição ${inst.name} foram excluídos.`);
                    deleteCourseModal.hide();
                    renderAllViews();
                    alert(`Curso "${courseName}" excluído com sucesso!`);
                }
            });

            document.getElementById('confirm-add-student-btn').addEventListener('click', () => {
                const studentIdInput = document.getElementById('new-student-id');
                const studentNameInput = document.getElementById('new-student-name');
                if(studentIdInput.value && studentNameInput.value) {
                    const snapshot = createSnapshot(currentTurmaContext.turma);
                    currentTurmaContext.turma.students.push({
                        id: parseInt(studentIdInput.value), name: studentNameInput.value, grades: {}
                    });
                    addAuditLog(`Aluno "${studentNameInput.value}" (matrícula: ${studentIdInput.value}) adicionado.`, snapshot);
                    document.getElementById('add-student-form').reset();
                    addStudentModal.hide();
                    renderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
                } else {
                    alert('Por favor, preencha todos os campos.');
                }
            });

            document.getElementById('confirm-finalize-btn').addEventListener('click', () => {
                const snapshot = createSnapshot(currentTurmaContext.turma);
                currentTurmaContext.turma.isFinalized = true;
                addAuditLog(`Semestre da turma "${currentTurmaContext.turma.name}" foi finalizado e bloqueado.`, snapshot);
                finalizeSemesterModal.hide();
                renderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
                renderAllViews();
            });
            
            document.getElementById('confirm-reopen-btn').addEventListener('click', () => {
                const passwordInput = document.getElementById('current-password-reopen');
                if (passwordInput.value) { // In a real app, you'd validate this password
                    const snapshot = createSnapshot(currentTurmaContext.turma);
                    currentTurmaContext.turma.isFinalized = false;
                    addAuditLog(`A turma "${currentTurmaContext.turma.name}" foi reaberta para edição.`, snapshot);
                    passwordInput.value = '';
                    reopenTurmaModal.hide();
                    renderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
                    renderAllViews();
                } else {
                    alert('Por favor, insira sua senha para continuar.');
                }
            });
            
            renderAllViews();
            switchView('profile');
        }

        init();
    });
