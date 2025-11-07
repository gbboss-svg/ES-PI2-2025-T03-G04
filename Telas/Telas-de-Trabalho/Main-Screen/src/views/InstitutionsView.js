import { MOCK_DATA } from '../services/DataService.js';

// Variáveis de modais e callbacks que serão gerenciadas pelo app.js
let editTurmaModal, editDisciplineModal, deleteTurmaModal, deleteDisciplineModal;
let switchViewCallback, renderTurmaDetailViewCallback;

/**
 * Inicializa os modais e callbacks necessários para esta view.
 * @param {object} modals - Objeto com as instâncias dos modais.
 * @param {object} callbacks - Objeto com as funções de callback.
 */
export function initInstitutionsView(modals, callbacks) {
    editTurmaModal = modals.editTurmaModal;
    editDisciplineModal = modals.editDisciplineModal;
    deleteTurmaModal = modals.deleteTurmaModal;
    deleteDisciplineModal = modals.deleteDisciplineModal;
    switchViewCallback = callbacks.switchView;
    renderTurmaDetailViewCallback = callbacks.renderTurmaDetailView;
}

/**
 * Renderiza a view de gerenciamento de Instituições.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {object} params - Parâmetros adicionais, como o ID da instituição a ser expandida.
 */
export function renderInstitutionsView(container, params = {}) {
    container.innerHTML = `
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
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.id}" aria-expanded="false" aria-controls="collapse-inst-${inst.id}">
                            <i class="bi bi-building me-2"></i> ${inst.name}
                        </button>
                    </h2>
                    <div id="collapse-inst-${inst.id}" class="accordion-collapse collapse" aria-labelledby="heading-inst-${inst.id}" data-bs-parent="#institutions-accordion-container">
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
    
    // Lógica para expandir o accordion correto, se passado por parâmetro
    if (params.expandInstId) {
        const collapseElement = container.querySelector(`#collapse-inst-${params.expandInstId}`);
        if (collapseElement) {
            const button = container.querySelector(`[data-bs-target="#collapse-inst-${params.expandInstId}"]`);
            button.classList.remove('collapsed');
            button.setAttribute('aria-expanded', 'true');
            collapseElement.classList.add('show');
        }
    }

    // Adiciona os event listeners
    container.querySelector('#add-new-from-management-btn').addEventListener('click', () => {
        switchViewCallback('creation');
    });
    
    container.querySelectorAll('.view-turma-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
           const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
           const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
           renderTurmaDetailViewCallback(turma, disc);
           switchViewCallback('turmaDetail');
        });
    });

    container.querySelectorAll('.edit-turma-btn').forEach(btn => {
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

    container.querySelectorAll('.edit-discipline-btn').forEach(btn => {
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

    container.querySelectorAll('.delete-turma-btn').forEach(btn => {
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

     container.querySelectorAll('.delete-discipline-btn').forEach(btn => {
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
