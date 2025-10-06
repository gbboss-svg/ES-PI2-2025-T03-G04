document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ATUALIZADOS ---
    const elements = {
        usernameDisplay: document.getElementById('username-display'),
        institutionInput: document.getElementById('institution-input'), // Modificado
        institutionsList: document.getElementById('institutions-list'), // Novo
        dashboardButton: document.getElementById('dashboard-button'),
        logoutButton: document.getElementById('logout-button'),
        addInstitutionLink: document.getElementById('add-institution-link'),
        modal: document.getElementById('add-institution-modal'),
        newInstitutionInput: document.getElementById('new-institution-input'),
        confirmAddButton: document.getElementById('confirm-add-button'),
        cancelAddButton: document.getElementById('cancel-add-button')
    };

    // --- Estado da Aplicação ---
    const state = {
        username: "Maria Silva",
        institutions: [
            "Universidade Federal de Exemplo (UFE)",
            "Centro Tecnológico Estadual (CTE)",
            "Instituto de Inovação Digital (IID)",
            "Escola Superior de Artes e Design (ESAD)"
        ]
    };

    // --- Funções ---

    function setUsername() {
        if (elements.usernameDisplay && state.username) {
            elements.usernameDisplay.textContent = `${state.username}!`;
        }
    }
    
    // FUNÇÃO ATUALIZADA para popular a datalist
    function populateInstitutions() {
        if (!elements.institutionsList) return;
        elements.institutionsList.innerHTML = ''; // Limpa opções antigas

        state.institutions.forEach(institution => {
            addInstitutionToDatalist(institution);
        });
    }
    
    /**
     * Adiciona uma única instituição à <datalist>
     * @param {string} institutionName O nome da instituição a ser adicionada
     */
    function addInstitutionToDatalist(institutionName) {
        const option = document.createElement('option');
        option.value = institutionName;
        elements.institutionsList.appendChild(option);
    }

    // FUNÇÃO ATUALIZADA para ler o valor do input
    function handleDashboardAccess() {
        const selectedInstitution = elements.institutionInput.value.trim();

        if (selectedInstitution) {
            alert(`Acessando o dashboard para a instituição: ${selectedInstitution}`);
        } else {
            alert('Por favor, digite ou selecione uma instituição de ensino para continuar.');
            elements.institutionInput.focus();
        }
    }

    function handleLogout() {
        alert('Você foi desconectado. Até a próxima!');
    }

    // --- Funções do Modal ---
    
    function openModal() {
        elements.modal.classList.add('visible');
        elements.newInstitutionInput.focus();
    }

    function closeModal() {
        elements.modal.classList.remove('visible');
        elements.newInstitutionInput.value = ''; // Limpa o campo ao fechar
    }
    
    // FUNÇÃO ATUALIZADA para adicionar à datalist e preencher o input
    function handleConfirmAdd() {
        const newInstitution = elements.newInstitutionInput.value.trim();

        if (newInstitution) {
            // Evita adicionar instituições duplicadas
            if (!state.institutions.find(inst => inst.toLowerCase() === newInstitution.toLowerCase())) {
                state.institutions.push(newInstitution);
                addInstitutionToDatalist(newInstitution);
            }
            
            // Preenche o campo principal com a nova instituição
            elements.institutionInput.value = newInstitution;
            
            alert(`Instituição "${newInstitution}" adicionada com sucesso!`);
            closeModal();
        } else {
            alert('Por favor, digite o nome da instituição.');
            elements.newInstitutionInput.focus();
        }
    }


    // --- Inicialização e Event Listeners ---

    function init() {
        setUsername();
        populateInstitutions();

        // Event Listeners principais
        elements.dashboardButton.addEventListener('click', handleDashboardAccess);
        elements.logoutButton.addEventListener('click', handleLogout);
        
        // Event Listeners do Modal
        elements.addInstitutionLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            openModal();
        });

        elements.cancelAddButton.addEventListener('click', closeModal);
        elements.confirmAddButton.addEventListener('click', handleConfirmAdd);
        
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });
    }

    init();
});
