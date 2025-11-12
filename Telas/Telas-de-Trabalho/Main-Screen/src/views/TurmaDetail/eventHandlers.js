// ES-PI2-2025-T03-G04-main/Telas/Telas-de-Trabalho/Main-Screen/src/views/TurmaDetail/eventHandlers.js
import { addAuditLog, renderAuditLog } from "../../services/AuditService.js";
import { testAndValidateFormula } from "../../services/FormulaService.js";
import { createSnapshot } from "../../utils/helpers.js";
import { exportTurmaToCsv, downloadFile, importStudentsFromCsv } from "../../services/CsvService.js";
import { showToast } from "../../services/NotificationService.js";
import * as ApiService from '../../services/ApiService.js';


function attachGradeEditingListeners(turma, disciplina, renderTurmaDetailView, currentTurmaContext) {
    const gradeEditSelector = document.getElementById('grade-edit-selector');
    if (gradeEditSelector) {
        gradeEditSelector.addEventListener('change', (e) => {
            const selectedAcronym = e.target.value;
            const allInputs = document.querySelectorAll('#grades-table-body .grade-input[data-acronym]');
            allInputs.forEach(input => input.disabled = true);
            if (selectedAcronym) {
                const inputsToEnable = document.querySelectorAll(`#grades-table-body .grade-input[data-acronym="${selectedAcronym}"]`);
                inputsToEnable.forEach(input => input.disabled = false);
            }
        });
    }

    document.querySelectorAll('#grades-table-body .grade-input[data-acronym]').forEach(input => {
        let oldValue = input.value;
        input.addEventListener('focus', e => { oldValue = e.target.value; });
        input.addEventListener('change', e => {
            const newValue = e.target.value;
            const studentName = e.target.dataset.studentName;
            const componentName = e.target.dataset.componentName;
            addAuditLog(turma.id, `Nota de "${componentName}" do aluno ${studentName} alterada de ${oldValue || 'vazio'} para ${newValue}.`, createSnapshot(turma));
            renderAuditLog(currentTurmaContext, renderTurmaDetailView);
        });
    });
}

function attachFormulaEditorListeners(turma, disciplina, renderTurmaDetailView, currentTurmaContext) {
    document.getElementById('toggle-formula-btn')?.addEventListener('click', () => 
        document.getElementById('formula-editor').classList.toggle('d-none')
    );

    document.getElementById('calc-media-simples-btn')?.addEventListener('click', () => {
        if (disciplina.gradeComponents && disciplina.gradeComponents.length > 0) {
            const acronyms = disciplina.gradeComponents.map(c => c.acronym);
            const formula = `(${acronyms.join(' + ')}) / ${acronyms.length}`;
            const formulaInput = document.getElementById('formula-input');
            formulaInput.value = formula;
            formulaInput.dispatchEvent(new Event('input', { bubbles: true }));
            document.getElementById('formula-editor').classList.remove('d-none');
        } else {
            showToast('Adicione pelo menos uma atividade de avaliação antes de calcular a média.', 'info');
        }
    });

    const formulaInput = document.getElementById('formula-input');
    const formulaFeedback = document.getElementById('formula-feedback');
    const maxGradeInput = document.getElementById('max-grade-input');
    
    const validateFormulaHandler = () => {
        disciplina.maxGrade = parseFloat(maxGradeInput.value) || 10;
        const result = testAndValidateFormula(formulaInput.value, disciplina);
        formulaFeedback.textContent = result.message;
        formulaFeedback.className = result.valid ? 'form-text text-success' : 'form-text text-danger';
        formulaInput.classList.toggle('is-valid-formula', result.valid && formulaInput.value);
        formulaInput.classList.toggle('is-invalid-formula', !result.valid && formulaInput.value);
    };

    formulaInput?.addEventListener('input', validateFormulaHandler);
    maxGradeInput?.addEventListener('input', validateFormulaHandler);

    document.getElementById('test-formula-btn')?.addEventListener('click', () => {
        disciplina.maxGrade = parseFloat(maxGradeInput.value) || 10;
        const result = testAndValidateFormula(formulaInput.value, disciplina);
        showToast(result.valid ? `Teste bem-sucedido! Resultado: ${result.testResult.toFixed(2)}` : `Falha no teste: ${result.message}`, result.valid ? 'success' : 'error');
    });

    document.getElementById('save-formula-btn')?.addEventListener('click', async () => {
        const snapshot = createSnapshot(turma);
        const tempMaxGrade = parseFloat(maxGradeInput.value) || 10;
        const tempFormula = formulaInput.value;
        
        const tempDisciplina = { ...disciplina, maxGrade: tempMaxGrade, finalGradeFormula: tempFormula };

        const result = testAndValidateFormula(tempFormula, tempDisciplina);
        formulaInput.classList.remove('shake-error');

        if (result.valid) {
            try {
                await ApiService.updateDiscipline(disciplina.id, {
                    finalGradeFormula: tempFormula,
                    maxGrade: tempMaxGrade,
                    gradeComponents: disciplina.gradeComponents,
                });
                
                disciplina.finalGradeFormula = tempFormula;
                disciplina.maxGrade = tempMaxGrade;

                addAuditLog(turma.id, `Configurações de avaliação salvas. Fórmula: ${disciplina.finalGradeFormula}, Nota Máx.: ${disciplina.maxGrade}`, snapshot);
                renderTurmaDetailView(turma, disciplina);
                showToast('Configurações salvas com sucesso!', 'success');
            } catch (error) {
                showToast(`Erro ao salvar configurações: ${error.message}`, 'error');
            }
        } else {
            void formulaInput.offsetWidth;
            formulaInput.classList.add('shake-error');
            showToast('Fórmula inválida. Verifique os erros.', 'error');
        }
    });
}

function attachActionButtonsListeners(turma, disciplina, modals, renderTurmaDetailView, currentTurmaContext) {
    document.getElementById('add-component-btn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-comp-name');
        const acronymInput = document.getElementById('new-comp-acronym');
        if (nameInput.value && acronymInput.value) {
            disciplina.gradeComponents.push({ id: `new_${Date.now()}`, name: nameInput.value, acronym: acronymInput.value, description: '' });
            renderTurmaDetailView(turma, disciplina);
            showToast(`Atividade "${nameInput.value}" adicionada. Clique em 'Salvar Configurações' para persistir.`, 'info');
            nameInput.value = '';
            acronymInput.value = '';
        }
    });

    document.getElementById('save-grades-btn')?.addEventListener('click', async () => {
        const snapshot = createSnapshot(turma);
        let hasChanges = false;
        
        const updatePromises = [];
        const studentsToUpdate = [];

        document.querySelectorAll('#grades-table-body tr').forEach(row => {
            const studentId = row.dataset.studentId;
            const student = turma.students.find(s => s.id == studentId);
            if (student) {
                const newGradesPayload = {};
                let studentHasChanges = false;
                
                row.querySelectorAll('.grade-input[data-acronym]').forEach(input => {
                    const acronym = input.dataset.acronym;
                    const rawValue = input.value.trim();
                    
                    const newGrade = rawValue === '' ? null : parseFloat(rawValue);

                    if (rawValue !== '' && isNaN(newGrade)) {
                        return;
                    }

                    const oldGrade = student.grades[acronym] ?? null;

                    if (newGrade !== oldGrade) {
                        newGradesPayload[acronym] = newGrade;
                        studentHasChanges = true;
                        hasChanges = true;
                    }
                });

                if (studentHasChanges) {
                    studentsToUpdate.push({ student, updatedGrades: newGradesPayload });
                    updatePromises.push(ApiService.updateStudentGrades(turma.id, student.id, newGradesPayload));
                }
            }
        });

        if(hasChanges){
            try {
                await Promise.all(updatePromises);
                studentsToUpdate.forEach(({ student, updatedGrades }) => {
                    Object.assign(student.grades, updatedGrades);
                });
                addAuditLog(turma.id, `Notas salvas para a turma ${turma.name}.`, snapshot);
                renderTurmaDetailView(turma, disciplina);
                showToast('Notas salvas com sucesso!', 'success');
            } catch (error) {
                showToast(`Erro ao salvar notas: ${error.message}`, 'error');
            }
        } else {
            showToast('Nenhuma nota foi alterada.', 'info');
        }
    });

    document.getElementById('add-student-btn')?.addEventListener('click', () => modals.addStudentModal.show());

    document.getElementById('confirm-add-student-btn')?.addEventListener('click', async () => {
        const studentId = document.getElementById('new-student-id').value;
        const studentName = document.getElementById('new-student-name').value;
        if (!studentId || !studentName) {
            showToast('Matrícula e Nome são obrigatórios.', 'error');
            return;
        }
        try {
            await ApiService.addStudent(turma.id, { id: studentId, name: studentName });
            modals.addStudentModal.hide();
            showToast('Aluno adicionado com sucesso! Atualizando...', 'success');
            
            const updatedTurma = await ApiService.getTurmaDetail(turma.id);
            const updatedDiscipline = updatedTurma.discipline;
            renderTurmaDetailView(updatedTurma, { ...disciplina, ...updatedDiscipline });

        } catch (error) {
            showToast(`Erro ao adicionar aluno: ${error.message}`, 'error');
        }
    });


    document.getElementById('calculate-avg-btn')?.addEventListener('click', () => {
        renderTurmaDetailView(turma, disciplina);
        addAuditLog(turma.id, 'Médias recalculadas para todos os alunos.');
        renderAuditLog(currentTurmaContext, renderTurmaDetailView);
        showToast('Médias recalculadas com sucesso!', 'success');
    });

    document.getElementById('finalize-semester-btn')?.addEventListener('click', () => modals.finalizeSemesterModal.show());
    document.getElementById('reopen-turma-btn')?.addEventListener('click', () => modals.reopenTurmaModal.show());
}

// --- Lógica de Importação CSV Refatorada ---

function promptForConflictResolution(conflict, modal) {
    return new Promise((resolve) => {
        const message = document.getElementById('csv-conflict-message');
        const substituteBtn = document.getElementById('csv-substitute-btn');
        const ignoreBtn = document.getElementById('csv-ignore-btn');
        const cancelBtn = document.getElementById('csv-cancel-import-btn');
        const applyAllCheckbox = document.getElementById('csv-apply-all');

        message.textContent = `O aluno ${conflict.name} (matrícula ${conflict.id}) já existe. Deseja substituir os dados existentes pelos do arquivo?`;
        applyAllCheckbox.checked = false;

        const cleanupAndResolve = (action) => {
            substituteBtn.onclick = null;
            ignoreBtn.onclick = null;
            cancelBtn.onclick = null;
            modal.hide();
            resolve({ action, applyAll: applyAllCheckbox.checked });
        };
        
        substituteBtn.onclick = () => cleanupAndResolve('substitute');
        ignoreBtn.onclick = () => cleanupAndResolve('ignore');
        cancelBtn.onclick = () => cleanupAndResolve('cancel');
        
        modal.show();
    });
}

async function resolveImportConflicts(conflicts, modal) {
    const studentsToSubstitute = [];
    let applyAllAction = null;

    for (const conflict of conflicts) {
        let action = applyAllAction;
        if (!action) {
            const result = await promptForConflictResolution(conflict, modal);
            action = result.action;
            if (result.applyAll) {
                applyAllAction = action;
            }
        }

        if (action === 'cancel') {
            return { cancelled: true, studentsToSubstitute: [] };
        }

        if (action === 'substitute') {
            studentsToSubstitute.push(conflict);
        }
    }
    return { cancelled: false, studentsToSubstitute };
}


function attachCsvListeners(turma, disciplina, renderTurmaDetailView, modals) {
    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
        try {
            const csvData = exportTurmaToCsv(turma, disciplina);
            downloadFile(csvData, `turma_${turma.name}.csv`, 'text/csv');
            showToast('Exportação iniciada.', 'success');
        } catch (error) {
            showToast(`Erro ao exportar: ${error.message}`, 'error');
        }
    });

    document.getElementById('import-csv-btn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async event => {
                try {
                    const { students: importedStudents } = importStudentsFromCsv(event.target.result);
                    const snapshot = createSnapshot(turma);

                    const newStudents = [];
                    const conflictingStudents = [];
                    const existingStudentIds = new Set(turma.students.map(s => s.id.toString()));

                    for (const student of importedStudents) {
                        if (existingStudentIds.has(student.id.toString())) {
                            conflictingStudents.push(student);
                        } else {
                            newStudents.push(student);
                        }
                    }

                    let studentsToSave = [...newStudents];
                    let substitutedCount = 0;

                    if (conflictingStudents.length > 0) {
                        const { cancelled, studentsToSubstitute } = await resolveImportConflicts(conflictingStudents, modals.csvConflictModal);
                        if (cancelled) {
                            showToast('Importação cancelada pelo usuário.', 'info');
                            return;
                        }
                        studentsToSave.push(...studentsToSubstitute);
                        substitutedCount = studentsToSubstitute.length;
                    }

                    if (studentsToSave.length > 0) {
                        await ApiService.batchAddStudents(turma.id, studentsToSave);
                        
                        const ignoredCount = conflictingStudents.length - substitutedCount;
                        const summaryMessage = `${newStudents.length} novo(s) adicionado(s), ${substitutedCount} substituído(s), ${ignoredCount} ignorado(s).`;
                        addAuditLog(turma.id, `Importação via CSV: ${summaryMessage}`, snapshot);
                        
                        showToast('Importação bem-sucedida! Atualizando dados...', 'success');
                        const updatedTurma = await ApiService.getTurmaDetail(turma.id);
                        renderTurmaDetailView(updatedTurma, updatedTurma.discipline, modals);
                    } else {
                        showToast('Nenhum aluno novo para importar ou nenhuma alteração selecionada.', 'info');
                    }
                } catch (error) {
                    showToast(`Erro ao importar CSV: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });
}

function attachAuditPanelListeners() {
    const auditPanel = document.getElementById('audit-panel-container');
    document.getElementById('toggle-audit-panel-btn')?.addEventListener('click', () => {
        auditPanel.classList.remove('d-none');
        auditPanel.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('close-audit-panel-btn')?.addEventListener('click', () => auditPanel.classList.add('d-none'));
}

function attachStudentActionListeners(turma, disciplina, modals, renderTurmaDetailView) {
    document.querySelectorAll('.remove-student-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { studentId, studentName } = e.currentTarget.dataset;
            document.getElementById('student-to-delete-name').textContent = studentName;
            
            const confirmBtn = document.getElementById('confirm-delete-student-btn');
            confirmBtn.onclick = async () => {
                try {
                    const snapshot = createSnapshot(turma);
                    await ApiService.removeStudent(turma.id, studentId);
                    modals.deleteStudentModal.hide();
                    showToast(`Aluno ${studentName} removido com sucesso.`, 'success');
                    
                    addAuditLog(turma.id, `Aluno ${studentName} (matrícula ${studentId}) removido da turma.`, snapshot);
                    
                    const updatedTurma = await ApiService.getTurmaDetail(turma.id);
                    renderTurmaDetailView(updatedTurma, updatedTurma.discipline, modals);
                } catch (error) {
                    showToast(`Erro ao remover aluno: ${error.message}`, 'error');
                }
            };
            
            modals.deleteStudentModal.show();
        });
    });
}

export function attachAllListeners(turma, disciplina, modals, renderTurmaDetailView, currentTurmaContext) {
    const isFinalized = turma.isFinalized;

    if (!isFinalized) {
        attachGradeEditingListeners(turma, disciplina, renderTurmaDetailView, currentTurmaContext);
        attachFormulaEditorListeners(turma, disciplina, renderTurmaDetailView, currentTurmaContext);
        attachActionButtonsListeners(turma, disciplina, modals, renderTurmaDetailView, currentTurmaContext);
        attachStudentActionListeners(turma, disciplina, modals, renderTurmaDetailView);
    }
    
    attachCsvListeners(turma, disciplina, renderTurmaDetailView, modals);
    attachAuditPanelListeners();
}