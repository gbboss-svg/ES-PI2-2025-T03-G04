document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const elements = {
        usernameDisplay: document.getElementById('username-display'),
        dashboardButton: document.getElementById('dashboard-button'),
        logoutButton: document.getElementById('logout-button'),

        // Elementos da Instituição
        institutionInput: document.getElementById('institution-input'),
        institutionsList: document.getElementById('institutions-list'),
        addInstitutionLink: document.getElementById('add-institution-link'),
        institutionModal: document.getElementById('add-institution-modal'),
        newInstitutionInput: document.getElementById('new-institution-input'),
        confirmAddInstitutionButton: document.getElementById('confirm-add-institution-button'),
        cancelAddInstitutionButton: document.getElementById('cancel-add-institution-button'),

        // Novos Elementos da Disciplina
        disciplineInput: document.getElementById('discipline-input'),
        disciplinesList: document.getElementById('disciplines-list'),
        addDisciplineLink: document.getElementById('add-discipline-link'),
        disciplineModal: document.getElementById('add-discipline-modal'),
        newDisciplineInput: document.getElementById('new-discipline-input'),
        confirmAddDisciplineButton: document.getElementById('confirm-add-discipline-button'),
        cancelAddDisciplineButton: document.getElementById('cancel-add-discipline-button')
    };

    // --- Estado da Aplicação ---
    const state = {
        username: "Maria Silva",
        institutions: [
            "Universidade Federal de Exemplo (UFE)",
            "Centro Tecnológico Estadual (CTE)",
            "Instituto de Inovação Digital (IID)",
            "Escola Superior de Artes e Design (ESAD)"
        ],
        // Nova lista de disciplinas
        disciplines: [
            "Cálculo I",
            "Algoritmos e Estrutura de Dados",
            "Física Experimental",
            "Introdução à Engenharia"
        ]
    };

    // --- Funções ---

    function setUsername() {
        if (elements.usernameDisplay && state.username) {
            elements.usernameDisplay.textContent = `${state.username}!`;
        }
    }

    // --- Funções da Instituição ---
    function populateInstitutions() {
        if (!elements.institutionsList) return;
        elements.institutionsList.innerHTML = '';
        state.institutions.forEach(institution => {
            addInstitutionToDatalist(institution);
        });
    }

    function addInstitutionToDatalist(institutionName) {
        const option = document.createElement('option');
        option.value = institutionName;
        elements.institutionsList.appendChild(option);
    }

    // --- Novas Funções da Disciplina ---
    function populateDisciplines() {
        if (!elements.disciplinesList) return;
        elements.disciplinesList.innerHTML = '';
        state.disciplines.forEach(discipline => {
            addDisciplineToDatalist(discipline);
        });
    }

    function addDisciplineToDatalist(disciplineName) {
        const option = document.createElement('option');
        option.value = disciplineName;
        elements.disciplinesList.appendChild(option);
    }

    // --- Função de Acesso Principal ATUALIZADA ---
    function handleDashboardAccess() {
        const selectedInstitution = elements.institutionInput.value.trim();
        const selectedDiscipline = elements.disciplineInput.value.trim();

        if (!selectedInstitution) {
            alert('Por favor, digite ou selecione uma instituição de ensino para continuar.');
            elements.institutionInput.focus();
            return;
        }

        if (!selectedDiscipline) {
            alert('Por favor, digite ou selecione uma disciplina para continuar.');
            elements.disciplineInput.focus();
            return;
        }

        alert(`Acessando o dashboard para:\nInstituição: ${selectedInstitution}\nDisciplina: ${selectedDiscipline}`);
    }

    function handleLogout() {
        alert('Você foi desconectado. Até a próxima!');
    }

    // --- Funções do Modal da Instituição ---
    function openInstitutionModal() {
        elements.institutionModal.classList.add('visible');
        elements.newInstitutionInput.focus();
    }

    function closeInstitutionModal() {
        elements.institutionModal.classList.remove('visible');
        elements.newInstitutionInput.value = '';
    }

    function handleConfirmAddInstitution() {
        const newInstitution = elements.newInstitutionInput.value.trim();
        if (newInstitution) {
            if (!state.institutions.find(inst => inst.toLowerCase() === newInstitution.toLowerCase())) {
                state.institutions.push(newInstitution);
                addInstitutionToDatalist(newInstitution);
            }
            elements.institutionInput.value = newInstitution;
            alert(`Instituição "${newInstitution}" adicionada com sucesso!`);
            closeInstitutionModal();
        } else {
            alert('Por favor, digite o nome da instituição.');
            elements.newInstitutionInput.focus();
        }
    }

    // --- Novas Funções do Modal da Disciplina ---
    function openDisciplineModal() {
        elements.disciplineModal.classList.add('visible');
        elements.newDisciplineInput.focus();
    }

    function closeDisciplineModal() {
        elements.disciplineModal.classList.remove('visible');
        elements.newDisciplineInput.value = '';
    }

    function handleConfirmAddDiscipline() {
        const newDiscipline = elements.newDisciplineInput.value.trim();
        if (newDiscipline) {
            if (!state.disciplines.find(disc => disc.toLowerCase() === newDiscipline.toLowerCase())) {
                state.disciplines.push(newDiscipline);
                addDisciplineToDatalist(newDiscipline);
            }
            elements.disciplineInput.value = newDiscipline;
            alert(`Disciplina "${newDiscipline}" adicionada com sucesso!`);
            closeDisciplineModal();
        } else {
            alert('Por favor, digite o nome da disciplina.');
            elements.newDisciplineInput.focus();
        }
    }

    // --- Inicialização e Event Listeners ---
    function init() {
        setUsername();
        populateInstitutions();
        populateDisciplines(); // Adicionado

        // Event Listeners principais
        elements.dashboardButton.addEventListener('click', handleDashboardAccess);
        elements.logoutButton.addEventListener('click', handleLogout);
        
        // Event Listeners do Modal da Instituição
        elements.addInstitutionLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            openInstitutionModal();
        });
        elements.cancelAddInstitutionButton.addEventListener('click', closeInstitutionModal);
        elements.confirmAddInstitutionButton.addEventListener('click', handleConfirmAddInstitution);
        elements.institutionModal.addEventListener('click', (e) => {
            if (e.target === elements.institutionModal) {
                closeInstitutionModal();
            }
        });

        // Novos Event Listeners do Modal da Disciplina
        elements.addDisciplineLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            openDisciplineModal();
        });
        elements.cancelAddDisciplineButton.addEventListener('click', closeDisciplineModal);
        elements.confirmAddDisciplineButton.addEventListener('click', handleConfirmAddDiscipline);
        elements.disciplineModal.addEventListener('click', (e) => {
            if (e.target === elements.disciplineModal) {
                closeDisciplineModal();
            }
        });
    }

    init();
});
