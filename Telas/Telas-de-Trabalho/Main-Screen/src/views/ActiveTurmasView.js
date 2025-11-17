import * as ApiService from '../services/ApiService.js';

let switchViewCallback, renderTurmaDetailViewCallback;

/**
 * Inicializa a view com os callbacks necessários.
 */
export function initActiveTurmasView(callbacks) {
    switchViewCallback = callbacks.switchView;
    renderTurmaDetailViewCallback = callbacks.renderTurmaDetailView;
}

/**
 * Renderiza a view de Turmas Ativas.
 */
export async function renderActiveTurmasView(container) {
    container.innerHTML = `
        <h1>Turmas Ativas</h1>
        <p class="lead text-muted">Acesso rápido a todas as suas turmas que ainda não foram finalizadas.</p>
        <div id="turmas-container">
            <div class="d-flex justify-content-center mt-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    `;

    try {
        const turmas = await ApiService.getActiveTurmas();
        const turmasContainer = container.querySelector('#turmas-container');

        if (turmas.length === 0) {
            turmasContainer.innerHTML = '<div class="alert alert-info mt-4">Você não possui turmas ativas no momento.</div>';
        } else {
            const turmasByInstitution = turmas.reduce((acc, turma) => {
                const { institution } = turma;
                if (!acc[institution.id]) {
                    acc[institution.id] = { name: institution.name, turmas: [] };
                }
                acc[institution.id].turmas.push(turma);
                return acc;
            }, {});

            turmasContainer.innerHTML = Object.values(turmasByInstitution).map(inst => `
                <div class="mt-4">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-building fs-4 me-2"></i>
                        <h3 class="mb-0">${inst.name}</h3>
                    </div>
                    <hr class="my-3">
                    <div class="row g-3">
                        ${inst.turmas.map(turma => `
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title">${turma.discipline.name}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${turma.course.name}</h6>
                                        <h6 class="card-subtitle mb-2 text-muted">${turma.name}</h6>
                                        <p class="card-text">Clique para gerenciar a turma.</p>
                                    </div>
                                    <div class="card-footer bg-transparent border-0 pb-3">
                                         <button class="btn btn-sm btn-primary manage-turma-btn" data-turma-id='${JSON.stringify(turma)}'>Gerenciar Turma</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        container.querySelectorAll('.manage-turma-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const turmaData = JSON.parse(btn.dataset.turmaId);
                try {
                    const turmaDetalhada = await ApiService.getTurmaDetail(turmaData.id);
                    renderTurmaDetailViewCallback(turmaDetalhada);
                } catch (error) {
                    console.error('Erro ao buscar detalhes da turma:', error);
                }
            });
        });

    } catch (error) {
        const turmasContainer = container.querySelector('#turmas-container');
        turmasContainer.innerHTML = `<div class="alert alert-danger mt-4">Erro ao carregar as turmas ativas.</div>`;
    }
}
