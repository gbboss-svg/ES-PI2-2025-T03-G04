  /**
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */

document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const elements = {
        usernameDisplay: document.getElementById('username-display'),
        dashboardButton: document.getElementById('dashboard-button'),
        logoutButton: document.getElementById('logout-button'),

        institutionSelect: document.getElementById('institution-select'),
        addInstitutionLink: document.getElementById('add-institution-link'),
        institutionModal: document.getElementById('add-institution-modal'),
        newInstitutionInput: document.getElementById('new-institution-input'),
        confirmAddInstitutionButton: document.getElementById('confirm-add-institution-button'),
        cancelAddInstitutionButton: document.getElementById('cancel-add-institution-button'),

        courseSelect: document.getElementById('course-select'),
        addCourseLink: document.getElementById('add-course-link'),
        courseModal: document.getElementById('add-course-modal'),
        newCourseInput: document.getElementById('new-course-input'),
        confirmAddCourseButton: document.getElementById('confirm-add-course-button'),
        cancelAddCourseButton: document.getElementById('cancel-add-course-button')
    };

    // --- Estado da Aplicação ---
    const state = {
        username: "",
        institutions: [],
        courses: []
    };

    // --- Funções ---

    async function fetchUsername() {
        try {
            const response = await fetch('/api/professor/me', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar dados do usuário.');
            
            const data = await response.json();
            state.username = data.name || data.NOME; 
            if (elements.usernameDisplay) {
                elements.usernameDisplay.textContent = `${state.username}!`;
            }
        } catch (error) {
            console.error('Erro ao buscar nome do usuário:', error);
            if (elements.usernameDisplay) elements.usernameDisplay.textContent = 'Usuário!';
        }
    }

    async function populateInstitutions() {
        try {
            const response = await fetch('/api/professor/instituicoes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            state.institutions = data;
            
            if (!elements.institutionSelect) return;
            
            elements.institutionSelect.innerHTML = '<option value="" disabled selected>Selecione sua instituição</option>';
            state.institutions.forEach(institution => {
                const option = document.createElement('option');
                option.value = institution.id;
                option.textContent = institution.name;
                elements.institutionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar instituições:', error);
            alert('Não foi possível carregar as instituições.');
        }
    }

    async function fetchAndPopulateCoursesForInstitution(institutionId) {
        elements.courseSelect.innerHTML = '<option value="" disabled selected>Carregando cursos...</option>';
        elements.courseSelect.disabled = true;

        try {
            const courses = await fetch(`/api/instituicao/${institutionId}/cursos`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(res => {
                if (!res.ok) throw new Error('Falha ao buscar cursos');
                return res.json();
            });

            state.courses = courses;
            elements.courseSelect.innerHTML = '<option value="" disabled selected>Selecione um curso</option>';
            
            if(courses.length === 0) {
                 elements.courseSelect.innerHTML = '<option value="" disabled selected>Nenhum curso encontrado</option>';
            }

            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                elements.courseSelect.appendChild(option);
            });

            elements.courseSelect.disabled = false;
        } catch (error) {
            console.error('Erro ao buscar cursos da instituição:', error);
            elements.courseSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar cursos</option>';
            elements.courseSelect.disabled = false; 
        }
    }

    async function handleDashboardAccess() {
        const selectedInstitutionId = elements.institutionSelect.value;
        const selectedCourseId = elements.courseSelect.value;

        if (!selectedInstitutionId) {
            alert('Por favor, selecione uma instituição de ensino para continuar.');
            elements.institutionSelect.focus();
            return;
        }

        if (!selectedCourseId) {
            alert('Por favor, selecione um curso para continuar.');
            elements.courseSelect.focus();
            return;
        }

        await handleConfirmAssociate(selectedInstitutionId, selectedCourseId);
    }

    async function handleConfirmAssociate(institutionId, courseId) {
        try {
            await fetch('/api/professor/cursos/' + courseId + '/access', {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            alert('Associação realizada com sucesso! Redirecionando para a tela principal.');
            window.location.href = `/main`;

        } catch (error) {
            console.error('Erro no processo de associação:', error);
            alert(`Erro: ${error.message}`);
        }
    }
    

    function handleLogout() {
        localStorage.removeItem('token');
        alert('Você foi desconectado. Até a próxima!');
        window.location.href = '/login';
    }

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
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ nome: newInstitutionName })
                });
                const data = await response.json();
                if (response.ok) {
                    const newInstitution = { id: data.id, name: newInstitutionName };
                    state.institutions.push(newInstitution);
                    
                    const option = document.createElement('option');
                    option.value = newInstitution.id;
                    option.textContent = newInstitution.name;
                    elements.institutionSelect.appendChild(option);
                    elements.institutionSelect.value = newInstitution.id;
                    
                    elements.institutionSelect.dispatchEvent(new Event('change'));

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

    function openCourseModal() {
        const selectedInstitutionId = elements.institutionSelect.value;
        if (!selectedInstitutionId) {
            alert('Por favor, selecione uma instituição antes de adicionar um curso.');
            return;
        }
        elements.courseModal.classList.add('visible');
        elements.newCourseInput.focus();
    }

    function closeCourseModal() {
        elements.courseModal.classList.remove('visible');
        elements.newCourseInput.value = '';
        document.getElementById('new-course-sigla').value = '';
        document.getElementById('new-course-semestres').value = '';
    }

    async function handleConfirmAddCourse() {
        const newCourseName = elements.newCourseInput.value.trim();
        const newCourseSigla = document.getElementById('new-course-sigla').value.trim();
        const newCourseSemestres = parseInt(document.getElementById('new-course-semestres').value, 10);
        const selectedInstitutionId = elements.institutionSelect.value;
        
        if (!newCourseName || !newCourseSigla || !newCourseSemestres || isNaN(newCourseSemestres) || newCourseSemestres < 1) {
            alert('Por favor, preencha todos os campos do curso corretamente.');
            return;
        }

        try {
            const response = await fetch('/api/professor/cursos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    nome: newCourseName,
                    sigla: newCourseSigla,
                    semestres: newCourseSemestres,
                    idInstituicao: selectedInstitutionId
                })
            });
            const data = await response.json();
            if (response.ok) {
                await fetchAndPopulateCoursesForInstitution(selectedInstitutionId);
                elements.courseSelect.value = data.id;
                
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

    function init() {
        fetchUsername();
        populateInstitutions();

        elements.institutionSelect.addEventListener('change', (e) => {
            const selectedInstitutionId = e.target.value;
            if (selectedInstitutionId) {
                fetchAndPopulateCoursesForInstitution(selectedInstitutionId);
            }
        });

        elements.dashboardButton.addEventListener('click', handleDashboardAccess);
        elements.logoutButton.addEventListener('click', handleLogout);
        
        elements.addInstitutionLink.addEventListener('click', (e) => { e.preventDefault(); openInstitutionModal(); });
        elements.cancelAddInstitutionButton.addEventListener('click', closeInstitutionModal);
        elements.confirmAddInstitutionButton.addEventListener('click', handleConfirmAddInstitution);
        elements.institutionModal.addEventListener('click', (e) => { if (e.target === elements.institutionModal) closeInstitutionModal(); });

        elements.addCourseLink.addEventListener('click', (e) => { e.preventDefault(); openCourseModal(); });
        elements.cancelAddCourseButton.addEventListener('click', closeCourseModal);
        elements.confirmAddCourseButton.addEventListener('click', handleConfirmAddCourse);
        elements.courseModal.addEventListener('click', (e) => { if (e.target === elements.courseModal) closeCourseModal(); });
    }

    init();
});