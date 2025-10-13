export function renderProfileView(views, MOCK_DATA, addInstitutionModal, renderInstitutions, renderInstitutionsFlyout, renderDashboardView, renderCreationView, renderActiveTurmasView, alert) {
    const container = views.profile;
    const user = MOCK_DATA.user;
    container.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=${user.name.charAt(0)}" class="rounded-circle me-4" alt="Avatar">
            <div>
                <h1>${user.name}</h1>
                <p class="lead text-muted">${user.email}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-body p-4">
                <h5 class="card-title mb-4">Informações Pessoais</h5>
                <div class="row g-4">
                    <div class="col-md-6">
                        <small class="text-muted d-block mb-1">Nome Completo</small>
                        <p class="fw-bold mb-0"><em>*informação*</em></p>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted d-block mb-1">CPF</small>
                        <p class="fw-bold mb-0"><em>*informação*</em></p>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted d-block mb-1">Email</small>
                        <p class="fw-bold mb-0"><em>*informação*</em></p>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted d-block mb-1">Telefone</small>
                        <p class="fw-bold mb-0"><em>*informação*</em></p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">Instituição Atual</h5>
                <label for="institutionInput" class="form-label">Selecione ou digite o nome da sua instituição</label>
                <input class="form-control" list="institutionOptions" id="institutionInput" placeholder="Digite para buscar...">
                <datalist id="institutionOptions">
                    <!-- Options will be populated by JS -->
                </datalist>
                <div class="mt-2">
                    <a class="text-decoration-none small" href="#" data-bs-toggle="modal" data-bs-target="#addInstitutionModal">
                        <i class="bi bi-plus-circle me-1"></i>Minha instituição não está na lista
                    </a>
                </div>
            </div>
        </div>
    `;
    
    const datalist = container.querySelector('#institutionOptions');
    datalist.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.name}"></option>`).join('');
    
    const institutionInput = container.querySelector('#institutionInput');
    institutionInput.value = MOCK_DATA.institutions[0]?.name || '';

    document.getElementById('confirm-add-institution-btn').addEventListener('click', () => {
        const newInstNameInput = document.getElementById('new-institution-name');
        if(newInstNameInput.value && document.getElementById('current-password-inst').value) {
            MOCK_DATA.institutions.push({ id: Date.now(), name: newInstNameInput.value, disciplines: [] });
            document.getElementById('add-institution-form').reset();
            addInstitutionModal.hide();
            renderProfileView(views, MOCK_DATA, addInstitutionModal, renderInstitutions, renderInstitutionsFlyout, renderDashboardView, renderCreationView, renderActiveTurmasView, alert);
            renderInstitutions(); 
            renderInstitutionsFlyout(); 
            renderDashboardView(); 
            renderCreationView(); 
            renderActiveTurmasView();
            alert(`Instituição "${newInstNameInput.value}" adicionada com sucesso!`);
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
}
