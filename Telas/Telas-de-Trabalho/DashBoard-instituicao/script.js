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
        username: "", // Será preenchido pelo backend
        institutions: [], // Será preenchido pelo backend
        courses: []       // Será preenchido pelo backend
    };

    // --- Funções ---

    async function fetchUsername() {
        try {
            const response = await fetch('/api/professor/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar dados do usuário.');
            }
            const data = await response.json();
            state.username = data.NOME; // A API retorna a coluna NOME
            if (elements.usernameDisplay) {
                elements.usernameDisplay.textContent = `${state.username}!`;
            }
        } catch (error) {
            console.error('Erro ao buscar nome do usuário:', error);
            if (elements.usernameDisplay) {
                elements.usernameDisplay.textContent = 'Usuário!'; // Fallback
            }
        }
    }

    // --- Funções da Instituição ---
    async function populateInstitutions() {
        try {
            const response = await fetch('/api/professor/instituicoes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            state.institutions = data;
            if (!elements.institutionsList) return;
            elements.institutionsList.innerHTML = '';
            state.institutions.forEach(institution => {
                addInstitutionToDatalist(institution);
            });
        } catch (error) {
            console.error('Erro ao buscar instituições:', error);
            alert('Não foi possível carregar as instituições.');
        }
    }

    function addInstitutionToDatalist(institution) {
        const option = document.createElement('option');
        option.value = institution.name; // Assumindo que a API retorna objetos com 'name'
        elements.institutionsList.appendChild(option);
    }

    // --- Novas Funções de Curso ---
    async function populateCourses() {
        try {
            const response = await fetch('/api/professor/cursos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            state.courses = data;
            if (!elements.coursesList) return;
            elements.coursesList.innerHTML = '';
            state.courses.forEach(course => {
                addCourseToDatalist(course);
            });
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            alert('Não foi possível carregar os cursos.');
        }
    }

    function addCourseToDatalist(course) {
        const option = document.createElement('option');
        option.value = course.name; // Assumindo que a API retorna objetos com 'name'
        elements.coursesList.appendChild(option);
    }

    // --- Função de Acesso Principal ATUALIZADA ---
    function handleDashboardAccess() {
        const selectedInstitutionName = elements.institutionInput.value.trim();
        const selectedCourseName = elements.courseInput.value.trim();

        if (!selectedInstitutionName) {
            alert('Por favor, digite ou selecione uma instituição de ensino para continuar.');
            elements.institutionInput.focus();
            return;
        }

        if (!selectedCourseName) {
            alert('Por favor, digite ou selecione um curso para continuar.');
            elements.courseInput.focus();
            return;
        }

        // Obtém os IDs da instituição e curso selecionados
        const selectedInstitution = state.institutions.find(inst => inst.name === selectedInstitutionName);
        const selectedCourseObj = state.courses.find(course => course.name === selectedCourseName);

        if (!selectedInstitution || !selectedCourseObj) {
            alert('Instituição ou curso selecionado inválido.');
            return;
        }

        handleConfirmAssociate(selectedInstitution.id, selectedCourseObj.id);
    }

    async function handleConfirmAssociate(institutionId, courseId) {
        try {
            const response = await fetch('/api/professor/associar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ courseId }) // Envia apenas o courseId
            });

            if (response.ok) {
                alert('Associação realizada com sucesso! Redirecionando para a tela principal.');
                // Passa os IDs da instituição e curso como parâmetros na URL
                window.location.href = `/main?instId=${institutionId}&cursoId=${courseId}`;
            } else {
                const data = await response.json();
                alert(`Erro ao associar: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao associar:', error);
            alert('Erro ao associar.');
        }
    }

    function handleLogout() {
        alert('Você foi desconectado. Até a próxima!');
        window.location.href = '/login';
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

    async function handleConfirmAddInstitution() {
        const newInstitutionName = elements.newInstitutionInput.value.trim();
        if (newInstitutionName) {
            try {
                const response = await fetch('/api/professor/instituicoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ nome: newInstitutionName }) // Envia apenas o nome
                });
                const data = await response.json();
                if (response.ok) {
                    const newInstitution = { id: data.id, name: newInstitutionName };
                    state.institutions.push(newInstitution);
                    addInstitutionToDatalist(newInstitution);
                    elements.institutionInput.value = newInstitutionName;
                    alert(`Instituição "${newInstitutionName}" adicionada com sucesso!`);
                    closeInstitutionModal();
                } else {
                    alert(`Erro ao adicionar instituição: ${data.message}`);
                }
            } catch (error) {
                console.error('Erro ao adicionar instituição:', error);
                alert('Erro ao adicionar instituição.');
            }
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

    async function handleConfirmAddCourse() {
        const newCourseName = elements.newCourseInput.value.trim();
        const newCourseSigla = document.getElementById('new-course-sigla').value.trim();
        const newCourseSemestres = parseInt(document.getElementById('new-course-semestres').value, 10);
        const selectedInstitutionName = elements.institutionInput.value.trim();
        const selectedInstitution = state.institutions.find(inst => inst.name === selectedInstitutionName);

        if (!newCourseName) {
            alert('Por favor, digite o nome do curso.');
            elements.newCourseInput.focus();
            return;
        }
        if (!newCourseSigla) {
            alert('Por favor, digite a sigla do curso.');
            document.getElementById('new-course-sigla').focus();
            return;
        }
        if (!newCourseSemestres || isNaN(newCourseSemestres) || newCourseSemestres < 1) {
            alert('Por favor, informe a quantidade de semestres.');
            document.getElementById('new-course-semestres').focus();
            return;
        }
        if (!selectedInstitution) {
            alert('Por favor, selecione uma instituição válida antes de criar o curso.');
            elements.institutionInput.focus();
            return;
        }
        try {
            const response = await fetch('/api/professor/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    nome: newCourseName,
                    sigla: newCourseSigla,
                    semestres: newCourseSemestres,
                    idInstituicao: selectedInstitution.id
                })
            });
            const data = await response.json();
            if (response.ok) {
                const newCourse = { id: data.id, name: newCourseName };
                state.courses.push(newCourse);
                addCourseToDatalist(newCourse);
                elements.courseInput.value = newCourseName;
                alert(`Curso "${newCourseName}" adicionado com sucesso!`);
                closeCourseModal();
            } else {
                alert(`Erro ao adicionar curso: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar curso:', error);
            alert('Erro ao adicionar curso.');
        }
    }

    // --- Inicialização e Event Listeners ---
    function init() {
        fetchUsername();
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
