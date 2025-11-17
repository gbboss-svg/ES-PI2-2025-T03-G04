import { attachInstitutionsViewListeners } from './Institutions/eventHandlers.js';

/**
 * Renderiza a view de gerenciamento de Instituições.
 */
export function renderInstitutionsView(container, institutions, params = {}, modals, callbacks) {
    if (!institutions) {
        container.innerHTML = `
            <div class="d-flex justify-content-center mt-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>`;
        return;
    }

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
            ${institutions.length > 0 ? institutions.map((inst, i) => `
                <div class="accordion-item">
                    <h2 class="accordion-header d-flex" id="heading-inst-${inst.id}">
                        <button class="accordion-button collapsed flex-grow-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.id}" aria-expanded="false" aria-controls="collapse-inst-${inst.id}">
                            <i class="bi bi-building me-2"></i> ${inst.name}
                        </button>
                        <div class="p-2">
                            <button class="btn btn-sm btn-outline-danger delete-institution-btn" data-inst-id="${inst.id}" data-inst-name="${inst.name}" title="Excluir Instituição">
                                <i class="bi bi-trash"></i>
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
                                                                    <span class="fw-bold">${disc.name} (${disc.sigla || 'N/A'})</span>
                                                                    <br>
                                                                    <small class="text-muted">Período: ${disc.periodo || 'N/A'}</small>
                                                                </div>
                                                            </a>
                                                            <div class="btn-group">
                                                                <button class="btn btn-sm btn-outline-secondary edit-discipline-btn" data-disc-id="${disc.id}" title="Editar Disciplina">
                                                                    <i class="bi bi-pencil-square"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-danger delete-discipline-btn" data-disc-id="${disc.id}" data-disc-name="${disc.name}" title="Excluir Disciplina">
                                                                    <i class="bi bi-trash"></i>
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
            `).join('') : '<div class="alert alert-info">Nenhuma instituição cadastrada.</div>'}
        </div>
    `;
    
    if (params.expandInstId) {
        const collapseElement = container.querySelector(`#collapse-inst-${params.expandInstId}`);
        if (collapseElement) {
            const button = container.querySelector(`[data-bs-target="#collapse-inst-${params.expandInstId}"]`);
            if(button && !button.getAttribute('aria-expanded')) {
                button.click();
            }
        }
    }
    
    attachInstitutionsViewListeners(container, modals, callbacks, institutions);
}