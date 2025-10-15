import { MOCK_DATA } from '../services/DataService.js';

/**
 * Renderiza o conteúdo da view do Painel Principal.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 * @param {function} switchViewCallback - Callback para alternar para outra view.
 */
export function renderDashboardView(container, switchViewCallback) {
    container.innerHTML = ''; // Limpa o container antes de renderizar

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

    // Adiciona os event listeners após o conteúdo ser inserido no DOM
    container.querySelectorAll('.view-discipline-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           const instId = btn.dataset.instId;
           // Chama o callback para mudar a view e expandir o accordion correto
           switchViewCallback('institutions', { expandInstId: instId });
        });
    });
}
