import { navLinks, modals } from './ui.js';
import { switchView } from './navigation.js';
import { loadInitialData } from './data.js';
import * as ApiService from './services/ApiService.js';
import { showToast } from './services/NotificationService.js';
import { currentTurmaContext } from './state.js';
import { renderTurmaDetailView } from './views/TurmaDetailView.js';

export function setupGlobalEventListeners() {
    // Navegação principal
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.dataset.view);
        });
    });

    // Toggler da Sidebar
    const sidebarToggler = document.getElementById('sidebarToggler');
    const togglerIcon = sidebarToggler.querySelector('i');
    sidebarToggler.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        togglerIcon.className = document.body.classList.contains('sidebar-collapsed') ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
    });

    // Lógica dos Modais (ações de confirmação)
    document.getElementById('confirm-logout-btn').addEventListener('click', () => {
        modals.logoutModal.hide();
        document.body.innerHTML = `<div class="vh-100 d-flex justify-content-center align-items-center"><h1>Você saiu do sistema.</h1></div>`;
    });

    document.getElementById('confirm-add-course-btn').addEventListener('click', async (e) => {
        const newCourseNameInput = document.getElementById('new-course-name');
        const passwordInput = document.getElementById('current-password-course');
        const courseName = newCourseNameInput.value.trim();
        const instId = e.currentTarget.dataset.instId;

        if (courseName && passwordInput.value && instId) {
            try {
                await ApiService.addCourse({ 
                    nome: courseName, 
                    idInstituicao: parseInt(instId), // Garante que o ID é um número
                    // Adicione outros campos necessários para o curso, se houver
                    sigla: 'N/A', // Valor padrão, ajuste se necessário
                    semestres: 0 // Valor padrão, ajuste se necessário
                });
                document.getElementById('add-course-form').reset();
                modals.addCourseModal.hide();
                await loadInitialData();
                showToast(`Curso "${courseName}" adicionado com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar curso: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-add-discipline-btn').addEventListener('click', async (e) => {
        const newDisciplineNameInput = document.getElementById('new-discipline-name');
        const newDisciplineSiglaInput = document.getElementById('new-discipline-sigla');
        const newDisciplinePeriodoInput = document.getElementById('new-discipline-periodo');
        const disciplineName = newDisciplineNameInput.value.trim();
        const disciplineSigla = newDisciplineSiglaInput.value.trim();
        const disciplinePeriodo = newDisciplinePeriodoInput.value.trim();
        const courseId = e.currentTarget.dataset.courseId;

        if (disciplineName && disciplineSigla && disciplinePeriodo && courseId) {
            try {
                await ApiService.addDiscipline({ 
                    nome: disciplineName, 
                    sigla: disciplineSigla,
                    periodo: disciplinePeriodo,
                    idCurso: parseInt(courseId)
                });
                document.getElementById('add-discipline-form').reset();
                modals.addDisciplineModal.hide();
                await loadInitialData();
                showToast(`Disciplina "${disciplineName}" adicionada com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar disciplina: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-add-student-btn').addEventListener('click', async () => {
        const studentIdInput = document.getElementById('new-student-id');
        const studentNameInput = document.getElementById('new-student-name');
        const studentId = studentIdInput.value;
        const studentName = studentNameInput.value.trim();

        if (studentId && studentName) {
            const { turma, disciplina } = currentTurmaContext;
            try {
                await ApiService.addStudent(turma.id, { id: parseInt(studentId), name: studentName });
                document.getElementById('add-student-form').reset();
                modals.addStudentModal.hide();
                // Recarrega os detalhes da turma para mostrar o novo aluno
                const turmaDetails = await ApiService.getTurmaDetail(turma.id);
                currentTurmaContext.turma = turmaDetails.turma;
                renderTurmaDetailView(currentTurmaContext.turma, currentTurmaContext.disciplina);
                showToast(`Aluno "${studentName}" adicionado com sucesso!`, 'success');
            } catch (error) {
                showToast(`Erro ao adicionar aluno: ${error.message}`, 'error');
            }
        } else {
            showToast('Por favor, preencha todos os campos.', 'error');
        }
    });

    document.getElementById('confirm-delete-institution-btn').addEventListener('click', async (e) => {
        const instId = e.currentTarget.dataset.instId;
        if (instId) {
            try {
                await ApiService.deleteInstitution(instId);
                modals.deleteInstitutionModal.hide();
                await loadInitialData();
                showToast('Instituição excluída com sucesso!', 'success');
            } catch (error) {
                showToast(`Erro ao excluir instituição: ${error.message}`, 'error');
            }
        }
    });
    
    // ... (outros event listeners de modais) ...
    // O código para os outros modais (edit, delete, finalize, reopen) será adicionado aqui.
    // Por brevidade, eles foram omitidos, mas a estrutura é a mesma.
}
