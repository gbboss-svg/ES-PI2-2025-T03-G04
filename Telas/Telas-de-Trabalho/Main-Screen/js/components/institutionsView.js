export function renderInstitutions(views, MOCK_DATA, switchView, renderTurmaDetailView, editDisciplineModal) {
    const institutionsAccordion = views.institutions;
    institutionsAccordion.innerHTML = `
        <h2>Gerenciamento</h2>
        <p>Navegue e gerencie suas instituições, disciplinas e turmas.</p>
        <div id="institutions-accordion-container"></div>
    `;

    const accordionContainer = institutionsAccordion.querySelector('#institutions-accordion-container');
    accordionContainer.innerHTML = MOCK_DATA.institutions.map((inst, i) => `
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading-inst-${inst.id}">
                <button class="accordion-button ${i !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-inst-${inst.id}" aria-expanded="${i === 0}" aria-controls="collapse-inst-${inst.id}">
                    <i class="bi bi-building me-2"></i> ${inst.name}
                </button>
            </h2>
            <div id="collapse-inst-${inst.id}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" aria-labelledby="heading-inst-${inst.id}">
                <div class="accordion-body">
                   ${inst.disciplines.length > 0 ? inst.disciplines.map(disc => `
                        <div class="card mb-2">
                            <div class="card-header">${disc.name} (${disc.code})</div>
                            <ul class="list-group list-group-flush">
                                ${disc.turmas.map(turma => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            ${turma.name} (${turma.code})
                                            ${turma.isFinalized ? '<span class="badge bg-secondary ms-2">Finalizada</span>' : ''}
                                        </span>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-outline-primary view-turma-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}" data-turma-id="${turma.id}">
                                                Abrir Turma <i class="bi bi-arrow-right-short"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-secondary edit-discipline-btn" data-inst-id="${inst.id}" data-disc-id="${disc.id}">
                                                <i class="bi bi-pencil" title="Editar Disciplina"></i>
                                            </button>
                                        </div>
                                    </li>`).join('')}
                            </ul>
                        </div>
                   `).join('') : '<p>Nenhuma disciplina cadastrada.</p>'}
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.view-turma-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
           const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
           const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
           renderTurmaDetailView(turma, disc);
           switchView('turmaDetail');
        });
    });

    document.querySelectorAll('.edit-discipline-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
           const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
           
           document.getElementById('edit-discipline-name').value = disc.name;
           document.getElementById('edit-discipline-code').value = disc.code;
           document.getElementById('edit-discipline-period').value = disc.period;
           document.getElementById('edit-discipline-max-grade').value = disc.maxGrade || 10;
           
           document.getElementById('confirm-edit-discipline-btn').dataset.instId = inst.id;
           document.getElementById('confirm-edit-discipline-btn').dataset.discId = disc.id;
           
           editDisciplineModal.show();
        });
    });
}

export function renderInstitutionsFlyout(MOCK_DATA, switchView, renderTurmaDetailView) {
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
