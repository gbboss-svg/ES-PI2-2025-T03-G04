import { MOCK_DATA } from '../services/DataService.js';
import { addAuditLog, renderAuditLog } from '../services/AuditService.js';
import { calculateFinalGrade, adjustGrade, testAndValidateFormula } from '../services/FormulaService.js';
import { createSnapshot } from '../utils/helpers.js';

// Variáveis de estado e modais que serão gerenciadas pelo app.js
let currentTurmaContext = {};
let addStudentModal, finalizeSemesterModal, reopenTurmaModal;

/**
 * Inicializa os modais que são usados nesta view.
 * @param {object} modals - Um objeto contendo as instâncias dos modais.
 */
export function initTurmaDetailViewModals(modals) {
    addStudentModal = modals.addStudentModal;
    finalizeSemesterModal = modals.finalizeSemesterModal;
    reopenTurmaModal = modals.reopenTurmaModal;
}

/**
 * Atualiza a lista de componentes de nota (atividades) na UI.
 * @param {object} disciplina - O objeto da disciplina.
 */
function updateGradeComponentsList(disciplina) {
    const list = document.getElementById('grade-components-list');
    if (!list) return;
    list.innerHTML = disciplina.gradeComponents.map(comp => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><strong>${comp.acronym}:</strong> ${comp.name}</span>
        </li>
    `).join('');
}

/**
 * Atualiza a tabela de notas com os dados mais recentes.
 * @param {object} turma - O objeto da turma.
 * @param {object} disciplina - O objeto da disciplina.
 */
function updateGradesTable(turma, disciplina) {
    const tableHead = document.getElementById('grades-table-head');
    const tableBody = document.getElementById('grades-table-body');
    if (!tableHead || !tableBody) return;

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
            gradeCells += `<td><input type="number" class="grade-input" data-acronym="${comp.acronym}" data-student-name="${student.name}" data-component-name="${comp.name}" value="${student.grades[comp.acronym] || ''}" min="0" max="${maxGrade}" step="0.01"></td>`;
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
            renderAuditLog(currentTurmaContext, renderTurmaDetailView);
        });
    });

     if (isFinalized) {
        tableBody.querySelectorAll('.grade-input').forEach(i => i.disabled = true);
    }
}

/**
 * Renderiza a view de detalhes da turma.
 * @param {object} turma - O objeto da turma a ser renderizada.
 * @param {object} disciplina - O objeto da disciplina associada.
 */
export function renderTurmaDetailView(turma, disciplina) {
    currentTurmaContext = { turma, disciplina }; 
    const isFinalized = turma.isFinalized;
    const container = document.getElementById('turma-detail-view');
    if (!container) return;

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
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-secondary" id="calc-media-simples-btn" ${isFinalized ? 'disabled' : ''} title="Calcular Média Simples"><i class="bi bi-calculator-fill me-1"></i> Calcular Média Simples</button>
                        <button class="btn btn-outline-primary" id="toggle-formula-btn" ${isFinalized ? 'disabled' : ''}><i class="bi bi-pencil-square me-1"></i> Editar</button>
                    </div>
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
                    <!-- Logs serão renderizados aqui -->
                </div>
            </div>
        </div>
    `;
    
    updateGradeComponentsList(disciplina);
    updateGradesTable(turma, disciplina);
    renderAuditLog(currentTurmaContext, renderTurmaDetailView);
    
    // Adiciona os event listeners específicos desta view
    if (!isFinalized) {
        document.getElementById('add-component-btn').addEventListener('click', () => {
            const nameInput = document.getElementById('new-comp-name');
            const acronymInput = document.getElementById('new-comp-acronym');
            if (nameInput.value && acronymInput.value) {
                const snapshot = createSnapshot(turma);
                disciplina.gradeComponents.push({ id: Date.now(), name: nameInput.value, acronym: acronymInput.value, description: '' });
                addAuditLog(`Nova atividade "${nameInput.value}" (${acronymInput.value}) adicionada.`, snapshot);
                renderTurmaDetailView(turma, disciplina); // Re-renderiza a view para atualizar a lista e a tabela
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
            renderAuditLog(currentTurmaContext, renderTurmaDetailView);
            alert('Notas salvas com sucesso!');
        });
        
        document.getElementById('add-student-btn').addEventListener('click', () => addStudentModal.show());
        document.getElementById('calculate-avg-btn').addEventListener('click', () => {
            updateGradesTable(turma, disciplina);
            addAuditLog('Médias recalculadas para todos os alunos.');
            renderAuditLog(currentTurmaContext, renderTurmaDetailView);
            alert('Médias recalculadas com sucesso!');
        });
        document.getElementById('finalize-semester-btn').addEventListener('click', () => finalizeSemesterModal.show());
        document.getElementById('toggle-formula-btn').addEventListener('click', () => document.getElementById('formula-editor').classList.toggle('d-none'));

        document.getElementById('calc-media-simples-btn').addEventListener('click', () => {
            const { disciplina } = currentTurmaContext;
            if (disciplina.gradeComponents && disciplina.gradeComponents.length > 0) {
                const acronyms = disciplina.gradeComponents.map(c => c.acronym);
                const formula = `(${acronyms.join(' + ')}) / ${acronyms.length}`;
                const formulaInput = document.getElementById('formula-input');
                formulaInput.value = formula;
                // Dispara o evento de input para acionar a validação da fórmula
                formulaInput.dispatchEvent(new Event('input', { bubbles: true }));
                // Mostra o editor de fórmula se estiver escondido
                document.getElementById('formula-editor').classList.remove('d-none');
            } else {
                alert('Adicione pelo menos uma atividade de avaliação antes de calcular a média.');
            }
        });

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
                renderAuditLog(currentTurmaContext, renderTurmaDetailView);
                alert('Configurações de avaliação salvas com sucesso!');
            } else {
                alert(`Configurações inválidas: ${result.message}\n\nAs alterações não foram salvas.`);
                void formulaFeedback.offsetWidth; // Trigger reflow to restart animation
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
