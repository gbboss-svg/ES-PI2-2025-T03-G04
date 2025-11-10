import * as ApiService from '../services/ApiService.js';
import { showToast } from '../services/NotificationService.js';

// Variáveis de modais e callbacks que serão gerenciadas pelo app.js
let modals = {};
let callbacks = {};

/**
 * Inicializa os modais e callbacks necessários para esta view.
 * @param {object} modals - Objeto com as instâncias dos modais.
 * @param {object} callbacksObj - Objeto com as funções de callback.
 */
export function initInstitutionsView(modalsObj, callbacksObj) {
    modals = modalsObj;
    callbacks = callbacksObj;
}

/**
 * Renderiza a view de gerenciamento de Instituições.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {Array} institutions - A lista de instituições do estado da aplicação.
 * @param {object} params - Parâmetros adicionais, como o ID da instituição a ser expandida.
 */
export function renderInstitutionsView(container, institutions, params = {}) {
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
            ${institutions.map((inst, i) => `
                <div class="accordion-item">
                    <h2 class="accordion-header d-flex" id="heading-inst-${inst.id}">
                        <button class="accordion-button collapsed flex-grow-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.id}" aria-expanded="false" aria-controls="collapse-inst-${inst.id}">
                            <i class="bi bi-building me-2"></i> ${inst.name}
                        </button>
                        <div class="p-2">
                            <button class="btn btn-sm btn-outline-danger delete-institution-btn" data-inst-id="${inst.id}" data-inst-name="${inst.name}">
                                <i class="bi bi-trash" title="Excluir Instituição"></i>
                            </button>
                        </div>
                    </h2>
                    <div id="collapse-inst-${inst.id}" class="accordion-collapse collapse" aria-labelledby="heading-inst-${inst.id}" data-bs-parent="#institutions-accordion-container">
                        <div class="accordion-body">
                            <div class="accordion" id="courses-accordion-${inst.id}">
                                ${inst.courses && inst.courses.length > 0 ? inst.courses.map(course => `
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="heading-course-${course.id}">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-course-${course.id}" aria-expanded="false" aria-controls="collapse-course-${course.id}">
                                                <i class="bi bi-book me-2"></i> ${course.name}
                                            </button>
                                        </h2>
                                        <div id="collapse-course-${course.id}" class="accordion-collapse collapse" aria-labelledby="heading-course-${course.id}" data-bs-parent="#courses-accordion-${inst.id}">
                                            <div class="accordion-body">
                                                ${course.disciplines && course.disciplines.length > 0 ? course.disciplines.map(disc => `
                                                    <div class="card mb-2 shadow-sm">
                                                        <div class="card-header d-flex justify-content-between align-items-center">
                                                            <a class="text-decoration-none text-body flex-grow-1" data-bs-toggle="collapse" href="#collapse-disc-${disc.id}" role="button" aria-expanded="false" aria-controls="collapse-disc-${disc.id}">
                                                                <div>
                                                                    <span class="fw-bold">${disc.name} (${disc.sigla})</span>
                                                                    <br>
                                                                    <small class="text-muted">Período: ${disc.periodo}</small>
                                                                </div>
                                                            </a>
                                                            <div class="btn-group">
                                                                <button class="btn btn-sm btn-outline-secondary edit-discipline-btn" data-inst-id="${inst.id}" data-course-id="${course.id}" data-disc-id="${disc.id}">
                                                                    <i class="bi bi-pencil-square" title="Editar Disciplina"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-danger delete-discipline-btn" data-inst-id="${inst.id}" data-course-id="${course.id}" data-disc-id="${disc.id}" data-disc-name="${disc.name}">
                                                                    <i class="bi bi-trash" title="Excluir Disciplina"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div class="collapse" id="collapse-disc-${disc.id}">
                                                            <ul class="list-group list-group-flush turmas-list-container">
                                                                <li class="list-group-item text-muted">Clique para carregar as turmas.</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                `).join('') : '<p>Nenhuma disciplina cadastrada para este curso.</p>'}
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : '<p>Nenhum curso cadastrado para esta instituição.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
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
        callbacks.switchView('creation');
    });

    container.querySelectorAll('.delete-institution-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o accordion abra/feche
            const { instId, instName } = btn.dataset;
            document.getElementById('institution-to-delete-name').textContent = instName;
            const confirmBtn = document.getElementById('confirm-delete-institution-btn');
            confirmBtn.dataset.instId = instId;
            modals.deleteInstitutionModal.show();
        });
    });
    
    container.querySelectorAll('.collapse[id^="collapse-disc-"]').forEach(collapseEl => {
        collapseEl.addEventListener('show.bs.collapse', async event => {
            const disciplineId = event.target.id.replace('collapse-disc-', '');
            const turmasListContainer = event.target.querySelector('.turmas-list-container');

            if (turmasListContainer.dataset.loaded === 'true') {
                return;
            }

            turmasListContainer.innerHTML = `<li class="list-group-item text-muted">Carregando...</li>`;

            try {
                const turmas = await ApiService.getTurmas(disciplineId);
                turmasListContainer.dataset.loaded = 'true';

                if (turmas.length > 0) {
                    turmasListContainer.innerHTML = turmas.map(turma => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                ${turma.name}
                                ${turma.isFinalized ? '<span class="badge bg-secondary ms-2">Finalizada</span>' : ''}
                            </span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-danger delete-turma-btn" data-turma-id="${turma.id}" data-turma-name="${turma.name}">
                                    <i class="bi bi-trash" title="Excluir Turma"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary edit-turma-btn" data-turma-id="${turma.id}">
                                    <i class="bi bi-pencil" title="Editar Turma"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary view-turma-btn" data-turma-id='${JSON.stringify(turma)}'>
                                    Abrir Turma <i class="bi bi-arrow-right-short"></i>
                                </button>
                            </div>
                        </li>
                    `).join('');
                } else {
                    turmasListContainer.innerHTML = '<li class="list-group-item text-muted">Nenhuma turma cadastrada.</li>';
                }

                // Reatribuir event listeners para os novos botões
                turmasListContainer.querySelectorAll('.view-turma-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const turmaData = JSON.parse(btn.dataset.turmaId);
                        callbacks.renderTurmaDetailView(turmaData, turmaData.discipline);
                        callbacks.switchView('turmaDetail');
                    });
                });

            } catch (error) {
                showToast(`Erro ao carregar turmas: ${error.message}`, 'error');
                turmasListContainer.innerHTML = `<li class="list-group-item text-danger">Falha ao carregar turmas.</li>`;
            }
        });
    });

    // Os event listeners para edit e delete de turmas/disciplinas precisam ser refatorados
    // para buscar os dados via API ou usar o estado global passado por app.js
    // Por enquanto, vamos focar na exclusão da instituição.
    // TODO: Refatorar os listeners abaixo para usar a API.
    // A lógica de edição e exclusão de disciplinas/turmas deve ser movida para app.js
    // ou usar callbacks que acessem o estado real da aplicação (appState).
    // Por enquanto, a dependência de MOCK_DATA será removida para evitar inconsistências.

    // container.querySelectorAll('.edit-discipline-btn').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         // Esta lógica precisa ser refatorada para usar appState.institutions
    //     });
    // });

    // container.querySelectorAll('.delete-turma-btn').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         // Esta lógica precisa ser refatorada para usar appState.institutions
    //     });
    // });

    //  container.querySelectorAll('.delete-discipline-btn').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         // Esta lógica precisa ser refatorada para usar appState.institutions
    //     });
    // });
}
