import { calculateFinalGrade, adjustGrade } from "../../services/FormulaService.js";

export function renderMainHTML(turma, disciplina) {
    const isFinalized = turma.isFinalized;
    return `
        ${isFinalized
            ? `
            <div class="alert alert-warning d-flex align-items-center justify-content-between" role="alert">
              <div class="d-flex align-items-center">
                  <i class="bi bi-lock-fill me-2"></i>
                  <div>
                    <strong>Semestre Finalizado!</strong> Esta turma está bloqueada e não pode mais ser editada.
                  </div>
              </div>
              <button id="reopen-turma-btn" class="btn btn-sm btn-outline-dark">Reabrir Turma</button>
            </div>`
            : ""
        }
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
                <h2>${disciplina.course.name || "Curso"}</h2>
                <h3 class="text-muted fw-normal">${disciplina.name} - ${turma.name}</h3>
                <p class="text-muted mb-0">Gerenciamento de notas e alunos.</p>
            </div>
            <div class="btn-toolbar" role="toolbar">
                <div class="btn-group me-2 mb-2" role="group">
                    <button id="save-grades-btn" class="btn btn-success" ${isFinalized ? "disabled" : ""}><i class="bi bi-check2-circle me-1"></i> Salvar</button>
                </div>
                <div class="btn-group me-2 mb-2" role="group">
                    <button id="add-student-btn" class="btn btn-primary" ${isFinalized ? "disabled" : ""}><i class="bi bi-person-plus-fill me-1"></i> Adicionar Aluno</button>
                    <button id="import-csv-btn" class="btn btn-outline-secondary" ${isFinalized ? "disabled" : ""}><i class="bi bi-upload me-1"></i> Importar</button>
                    <button id="export-csv-btn" class="btn btn-outline-secondary"><i class="bi bi-download me-1"></i> Exportar</button>
                </div>
                <div class="btn-group mb-2" role="group">
                    <button class="btn btn-info text-white" id="toggle-audit-panel-btn"><i class="bi bi-terminal me-1"></i> Auditoria</button>
                    <button id="calculate-avg-btn" class="btn btn-warning" ${isFinalized ? "disabled" : ""}><i class="bi bi-calculator me-1"></i> Calcular Médias</button>
                    <button id="finalize-semester-btn" class="btn btn-danger" ${isFinalized ? "disabled" : ""}><i class="bi bi-lock me-1"></i> Finalizar Semestre</button>
                </div>
            </div>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Configurações de Avaliação</h5>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-secondary" id="calc-media-simples-btn" ${isFinalized ? "disabled" : ""} title="Calcular Média Simples"><i class="bi bi-calculator-fill me-1"></i> Média Simples</button>
                        <button class="btn btn-outline-primary" id="toggle-formula-btn" ${isFinalized ? "disabled" : ""}><i class="bi bi-pencil-square me-1"></i> Editar</button>
                    </div>
                </div>
                <div id="formula-editor" class="d-none mt-3">
                    <div class="row g-3">
                        <div class="col-md-9">
                            <label for="formula-input" class="form-label">Fórmula de Cálculo</label>
                            <input type="text" id="formula-input" class="form-control" value="${disciplina.finalGradeFormula || ""}" ${isFinalized ? "disabled" : ""}>
                            <div id="formula-feedback" class="form-text mt-2"></div>
                        </div>
                        <div class="col-md-3">
                            <label for="max-grade-input" class="form-label">Nota Máxima</label>
                            <input type="number" id="max-grade-input" class="form-control" value="${disciplina.maxGrade || 10}" min="0" ${isFinalized ? "disabled" : ""}>
                        </div>
                    </div>
                    <div class="btn-group mt-3">
                        <button id="save-formula-btn" class="btn btn-success" ${isFinalized ? "disabled" : ""}>Salvar Configurações</button>
                        <button id="test-formula-btn" class="btn btn-outline-info" ${isFinalized ? "disabled" : ""}>Testar Fórmula</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Quadro de Notas</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-12">
                                <label for="grade-edit-selector" class="form-label d-inline-block me-2"><strong>Editar coluna:</strong></label>
                                <select class="form-select form-select-sm d-inline-block" id="grade-edit-selector" style="width: auto;" ${isFinalized ? "disabled" : ""}></select>
                            </div>
                        </div>
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
                        <div ${isFinalized ? 'style="display:none;"' : ""}>
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
                <h5 class="mb-0"><i class="bi bi-terminal me-2"></i>Painel de Auditoria</h5>
                <button class="btn-close" id="close-audit-panel-btn"></button>
            </div>
            <div class="card-body">
                <p class="text-muted">Qualquer alteração nesta turma ficará registrada aqui.</p>
                <div id="audit-log-list" class="list-group"></div>
            </div>
        </div>
    `;
}

export function renderGradeComponentsList(disciplina) {
    const list = document.getElementById("grade-components-list");
    if (!list) return;

    list.innerHTML = (!disciplina.gradeComponents || disciplina.gradeComponents.length === 0)
        ? '<li class="list-group-item text-muted fst-italic">Nenhuma atividade cadastrada</li>'
        : disciplina.gradeComponents.map(comp => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><strong>${comp.acronym}:</strong> ${comp.name}</span>
            </li>`).join("");
}

export function renderGradesTable(turma, disciplina) {
    const tableHead = document.getElementById("grades-table-head");
    const tableBody = document.getElementById("grades-table-body");
    const isFinalized = turma.isFinalized;
    if (!tableHead || !tableBody) return;

    const maxGrade = disciplina.maxGrade || 10;

    if (!disciplina.gradeComponents || disciplina.gradeComponents.length === 0) {
        tableHead.innerHTML = '<tr><th scope="col" colspan="3">Configure as atividades de avaliação para começar</th></tr>';
        tableBody.innerHTML = '';
        return;
    }

    let headers = ['Matrícula', 'Nome', ...disciplina.gradeComponents.map(c => `${c.name} (${c.acronym})`), 'Nota Final'];
    if (disciplina.hasAdjustedColumn) headers.push('Final Ajustada');
    headers.push('Ações');
    tableHead.innerHTML = `<tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr>`;
    
    tableBody.innerHTML = (!turma.students || turma.students.length === 0)
        ? '<tr><td colspan="100%" class="text-center text-muted fst-italic py-4">Nenhum aluno cadastrado</td></tr>'
        : turma.students.map(student => {
            const finalGrade = calculateFinalGrade(student.grades, disciplina.finalGradeFormula, disciplina.gradeComponents);
            const gradeCells = disciplina.gradeComponents.map(comp => `
                <td><input type="number" class="grade-input" data-acronym="${comp.acronym}" data-student-name="${student.name}" data-component-name="${comp.name}" value="${student.grades[comp.acronym] ?? ""}" min="0" max="${maxGrade}" step="0.01" disabled></td>
            `).join('');
            const finalAdjustedCell = disciplina.hasAdjustedColumn ? `<td><input type="number" class="grade-input" value="${isNaN(finalGrade) ? "" : adjustGrade(finalGrade).toFixed(1)}" min="0" max="${maxGrade}" step="0.5" disabled></td>` : '';
            const actionsCell = `
                <td>
                    <button class="btn btn-sm btn-outline-danger remove-student-btn" data-student-id="${student.id}" data-student-name="${student.name}" title="Remover Aluno" ${isFinalized ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            return `<tr data-student-id="${student.id}">
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        ${gradeCells}
                        <td>${isNaN(finalGrade) ? "Erro" : finalGrade.toFixed(2)}</td>
                        ${finalAdjustedCell}
                        ${actionsCell}
                    </tr>`;
        }).join('');
}