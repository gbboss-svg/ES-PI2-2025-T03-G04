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

        // Novos Elementos de Curso
        courseInput: document.getElementById('course-input'),
        coursesList: document.getElementById('courses-list'),
        addCourseLink: document.getElementById('add-course-link'),
        courseModal: document.getElementById('add-course-modal'),
        newCourseInput: document.getElementById('new-course-input'),
        confirmAddCourseButton: document.getElementById('confirm-add-course-button'),
        cancelAddCourseButton: document.getElementById('cancel-add-course-button')
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
        // Nova lista de cursos
        courses: [
            "Engenharia de Software",
            "Ciência da Computação",
            "Design Gráfico",
            "Engenharia Civil"
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

    // --- Novas Funções de Curso ---
    function populateCourses() {
        if (!elements.coursesList) return;
        elements.coursesList.innerHTML = '';
        state.courses.forEach(course => {
            addCourseToDatalist(course);
        });
    }

    function addCourseToDatalist(courseName) {
        const option = document.createElement('option');
        option.value = courseName;
        elements.coursesList.appendChild(option);
    }

    // --- Função de Acesso Principal ATUALIZADA ---
    function handleDashboardAccess() {
        const selectedInstitution = elements.institutionInput.value.trim();
        const selectedCourse = elements.courseInput.value.trim();

        if (!selectedInstitution) {
            alert('Por favor, digite ou selecione uma instituição de ensino para continuar.');
            elements.institutionInput.focus();
            return;
        }

        if (!selectedCourse) {
            alert('Por favor, digite ou selecione um curso para continuar.');
            elements.courseInput.focus();
            return;
        }

        alert(`Acessando o dashboard para:\nInstituição: ${selectedInstitution}\nCurso: ${selectedCourse}`);
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

    // --- Novas Funções do Modal de Curso ---
    function openCourseModal() {
        elements.courseModal.classList.add('visible');
        elements.newCourseInput.focus();
    }

    function closeCourseModal() {
        elements.courseModal.classList.remove('visible');
        elements.newCourseInput.value = '';
    }

    function handleConfirmAddCourse() {
        const newCourse = elements.newCourseInput.value.trim();
        if (newCourse) {
            if (!state.courses.find(c => c.toLowerCase() === newCourse.toLowerCase())) {
                state.courses.push(newCourse);
                addCourseToDatalist(newCourse);
            }
            elements.courseInput.value = newCourse;
            alert(`Curso "${newCourse}" adicionado com sucesso!`);
            closeCourseModal();
        } else {
            alert('Por favor, digite o nome do curso.');
            elements.newCourseInput.focus();
        }
    }

    // --- Inicialização e Event Listeners ---
    function init() {
        setUsername();
        populateInstitutions();
        populateCourses(); // Adicionado

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

        // Novos Event Listeners do Modal de Curso
        elements.addCourseLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            openCourseModal();
        });
        elements.cancelAddCourseButton.addEventListener('click', closeCourseModal);
        elements.confirmAddCourseButton.addEventListener('click', handleConfirmAddCourse);
        elements.courseModal.addEventListener('click', (e) => {
            if (e.target === elements.courseModal) {
                closeCourseModal();
            }
        });
    }

    init();
});
