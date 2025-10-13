export function renderCreationView(views, MOCK_DATA, switchView, renderInstitutions, renderInstitutionsFlyout, renderDashboardView, renderActiveTurmasView) {
    const container = views.creation;
    container.innerHTML = `
        <h1>Cadastrar Nova Turma</h1>
        <p class="lead text-muted">Preencha os detalhes abaixo para criar uma nova turma.</p>
        <div class="card mt-4">
            <div class="card-body">
                <form id="creation-form">
                    <div class="mb-3">
                        <label for="institution-select" class="form-label fw-bold">1. Instituição</label>
                        <select id="institution-select" class="form-select"></select>
                    </div>

                    <div class="mb-3">
                        <label for="discipline-select" class="form-label fw-bold">2. Disciplina</label>
                        <select id="discipline-select" class="form-select"></select>
                    </div>
                    
                    <div id="new-discipline-fields" class="border p-3 rounded mb-3 bg-light">
                        <h6 class="text-dark">Criar Nova Disciplina</h6>
                        <div class="mb-2">
                            <label for="new-discipline-name" class="form-label text-dark">Nome da Disciplina</label>
                            <input type="text" id="new-discipline-name" class="form-control">
                        </div>
                        <div class="mb-2">
                            <label for="new-discipline-code" class="form-label text-dark">Código da Disciplina (Ex: ES-PI2)</label>
                            <input type="text" id="new-discipline-code" class="form-control">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">3. Detalhes da Turma</label>
                        <div class="row g-3">
                            <div class="col-md-12">
                                <label for="new-turma-name" class="form-label">Nome da Turma</label>
                                <input type="text" id="new-turma-name" class="form-control" required placeholder="Ex: Turma 1">
                            </div>
                            <div class="col-md-6">
                                <label for="new-turma-semestre" class="form-label">Semestre</label>
                                <input type="text" id="new-turma-semestre" class="form-control" placeholder="Ex: 4º Semestre">
                            </div>
                            <div class="col-md-6">
                                <label for="new-turma-periodo" class="form-label">Período</label>
                                <select id="new-turma-periodo" class="form-select">
                                    <option selected>Noturno</option>
                                    <option>Matutino</option>
                                    <option>Vespertino</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg mt-3"><i class="bi bi-check-circle me-2"></i>Criar Turma</button>
                </form>
            </div>
        </div>
    `;

    const instSelect = container.querySelector('#institution-select');
    const discSelect = container.querySelector('#discipline-select');
    const newDiscFields = container.querySelector('#new-discipline-fields');
    const creationForm = container.querySelector('#creation-form');

    instSelect.innerHTML = MOCK_DATA.institutions
        .map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

    function updateDisciplineSelect(instId) {
        const institution = MOCK_DATA.institutions.find(i => i.id == instId);
        if (institution) {
            discSelect.innerHTML = institution.disciplines
                .map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            discSelect.innerHTML += '<option value="new">--- Criar nova disciplina ---</option>';
        }
        newDiscFields.classList.remove('expanded');
    }
    
    instSelect.addEventListener('change', () => updateDisciplineSelect(instSelect.value));
    discSelect.addEventListener('change', () => {
        newDiscFields.classList.toggle('expanded', discSelect.value === 'new');
    });

    creationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedInstId = instSelect.value;
        const institution = MOCK_DATA.institutions.find(i => i.id == selectedInstId);
        let discipline;

        if (discSelect.value === 'new') {
            const newDisciplineName = document.getElementById('new-discipline-name').value;
            const newDisciplineCode = document.getElementById('new-discipline-code').value;
            if (!newDisciplineName || !newDisciplineCode) { alert('Preencha o nome e o código da nova disciplina.'); return; }
            discipline = {
                id: Date.now(), name: newDisciplineName, code: newDisciplineCode, period: document.getElementById('new-turma-semestre').value,
                maxGrade: 10, gradeComponents: [], finalGradeFormula: '', hasAdjustedColumn: false, turmas: []
            };
            institution.disciplines.push(discipline);
        } else {
            discipline = institution.disciplines.find(d => d.id == discSelect.value);
        }
        
        const newTurmaName = document.getElementById('new-turma-name').value;
        if(!newTurmaName) { alert('O nome da turma é obrigatório.'); return; }
        
        const newTurma = {
             id: Date.now(), name: newTurmaName, code: newTurmaName.replace(/\s/g, '').toUpperCase(), students: [], isFinalized: false
        };
        discipline.turmas.push(newTurma);
        alert(`Turma "${newTurma.name}" criada com sucesso na disciplina "${discipline.name}"!`);
        
        renderInstitutions(); 
        renderInstitutionsFlyout(); 
        renderDashboardView(); 
        renderActiveTurmasView();
        switchView('institutions');
        
        const collapseElement = document.getElementById(`collapse-inst-${selectedInstId}`);
        if (collapseElement) { new bootstrap.Collapse(collapseElement, { toggle: false }).show(); }
    });

    updateDisciplineSelect(instSelect.value);
}
