export function renderActiveTurmasView(views, MOCK_DATA, switchView, renderTurmaDetailView) {
    const container = views.activeTurmas;
    container.innerHTML = `
        <h1>Turmas Ativas</h1>
        <p class="lead text-muted">Acesso rápido a todas as suas turmas que ainda não foram finalizadas.</p>
    `;

    let hasActiveTurmas = false;

    MOCK_DATA.institutions.forEach(inst => {
        const activeTurmas = inst.disciplines.flatMap(disc => 
            disc.turmas.filter(turma => !turma.isFinalized).map(turma => ({...turma, discipline: disc}))
        );

        if (activeTurmas.length > 0) {
            hasActiveTurmas = true;
            let institutionHTML = `
                <div class="mt-4">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-building fs-4 me-2"></i>
                        <h3 class="mb-0">${inst.name}</h3>
                    </div>
                    <hr class="my-3">
                    <div class="row g-3">
                        ${activeTurmas.map(turma => `
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title">${turma.discipline.name}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${turma.name}</h6>
                                        <p class="card-text">${turma.students.length} aluno(s) cadastrado(s).</p>
                                    </div>
                                    <div class="card-footer bg-transparent border-0 pb-3">
                                         <button class="btn btn-sm btn-primary manage-turma-btn" data-inst-id="${inst.id}" data-disc-id="${turma.discipline.id}" data-turma-id="${turma.id}">Gerenciar Turma</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            container.innerHTML += institutionHTML;
        }
    });

    if (!hasActiveTurmas) {
        container.innerHTML += '<div class="alert alert-info mt-4">Você não possui turmas ativas no momento.</div>';
    }

    container.querySelectorAll('.manage-turma-btn').forEach(btn => {
        btn.addEventListener('click', () => {
           const inst = MOCK_DATA.institutions.find(i => i.id == btn.dataset.instId);
           const disc = inst.disciplines.find(d => d.id == btn.dataset.discId);
           const turma = disc.turmas.find(t => t.id == btn.dataset.turmaId);
           renderTurmaDetailView(turma, disc);
           switchView('turmaDetail');
        });
    });
}
