// import { fetchTurma, fetchDisciplina } from '../services/DataService.js';
import { addAuditLog, renderAuditLog } from '../services/AuditService.js';
import { calculateFinalGrade, adjustGrade, testAndValidateFormula } from '../services/FormulaService.js';
import { createSnapshot } from '../utils/helpers.js';
import { exportTurmaToCsv, downloadFile, importStudentsFromCsv } from '../services/CsvService.js';

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
// ...existing code...

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
    currentTurmaContext = { turma, disciplina };
    const isFinalized = turma.isFinalized;
    const container = document.getElementById('turma-detail-view');
    if (!container) return;
    // Aqui você pode buscar dados reais do backend se necessário
    container.innerHTML = `<div class="alert alert-info">Dados da turma e disciplina devem ser buscados do backend.</div>`;
    
    updateGradeComponentsList(disciplina);
    updateGradesTable(turma, disciplina);
    renderAuditLog(currentTurmaContext, renderTurmaDetailView);
    
    // Adiciona os event listeners específicos desta view
    if (!isFinalized) {
        // Lógica para o seletor de edição de notas
        const gradeEditSelector = document.getElementById('grade-edit-selector');
        let options = '<option value="">Selecione para editar...</option>';
        disciplina.gradeComponents.forEach(comp => {
            options += `<option value="${comp.acronym}">${comp.name}</option>`;
        });
        gradeEditSelector.innerHTML = options;

        gradeEditSelector.addEventListener('change', (e) => {
            const selectedAcronym = e.target.value;
            const allInputs = document.querySelectorAll('#grades-table-body .grade-input[data-acronym]');
            
            allInputs.forEach(input => input.disabled = true);

            if (selectedAcronym) {
                const inputsToEnable = document.querySelectorAll(`#grades-table-body .grade-input[data-acronym="${selectedAcronym}"]`);
                inputsToEnable.forEach(input => input.disabled = false);
            }
        });

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

        document.getElementById('export-csv-btn').addEventListener('click', () => {
            const csvData = exportTurmaToCsv(turma, disciplina);
            downloadFile(csvData, `turma_${turma.name}.csv`, 'text/csv');
        });

        document.getElementById('import-csv-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const { headers, students } = importStudentsFromCsv(event.target.result);
                        const snapshot = createSnapshot(turma);
                        
                        students.forEach(newStudent => {
                            const existingStudent = turma.students.find(s => s.id === newStudent.id);
                            if (existingStudent) {
                                Object.assign(existingStudent, newStudent);
                            } else {
                                turma.students.push(newStudent);
                            }
                        });

                        addAuditLog(`${students.length} alunos importados via CSV.`, snapshot);
                        renderTurmaDetailView(turma, disciplina);
                        alert('Alunos importados com sucesso!');
                    } catch (error) {
                        alert(`Erro ao importar CSV: ${error.message}`);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });

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
            
            // Adiciona/remove classes para o feedback visual da borda
            formulaInput.classList.remove('is-valid-formula', 'is-invalid-formula');
            if (formulaInput.value) { // Só aplica a classe se o campo não estiver vazio
                formulaInput.classList.add(result.valid ? 'is-valid-formula' : 'is-invalid-formula');
            }
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
            
            formulaInput.classList.remove('shake-error');

            if (result.valid) {
                disciplina.finalGradeFormula = formulaInput.value;
                updateGradesTable(turma, disciplina);
                addAuditLog(`Configurações de avaliação salvas. Fórmula: ${disciplina.finalGradeFormula}, Nota Máx.: ${disciplina.maxGrade}`, snapshot);
                renderAuditLog(currentTurmaContext, renderTurmaDetailView);
                alert('Configurações de avaliação salvas com sucesso!');
            } else {
                // Em vez de um alerta, aciona a animação de "tremor"
                void formulaInput.offsetWidth; // Trigger reflow para reiniciar a animação
                formulaInput.classList.add('shake-error');
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
