import * as ApiService from '../services/ApiService.js';
import { showToast } from '../services/NotificationService.js';

// Callback para ser chamado após a criação bem-sucedida
let onTurmaCreatedCallback;

/**
 * Inicializa a view de criação com um callback.
 * @param {function} onTurmaCreated - Função a ser chamada quando uma turma for criada.
 */
export function initCreationView(onTurmaCreated) {
    onTurmaCreatedCallback = onTurmaCreated;
}

/**
 * Renderiza a view de criação de turmas.
 * @param {HTMLElement} container - O elemento container onde a view será renderizada.
 */
export function renderCreationView(container) {
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
                        <label for="course-select" class="form-label fw-bold">2. Curso</label>
                        <select id="course-select" class="form-select" disabled></select>
                    </div>

                    <div class="mb-3">
                        <label for="discipline-select" class="form-label fw-bold">3. Disciplina</label>
                        <select id="discipline-select" class="form-select" disabled></select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">4. Detalhes da Turma</label>
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

    const creationForm = container.querySelector('#creation-form');
    const instSelect = container.querySelector('#institution-select');
    const courseSelect = container.querySelector('#course-select');
    const discSelect = container.querySelector('#discipline-select');

    async function loadInstitutions() {
        try {
            const institutions = await ApiService.getInstitutions();
            instSelect.innerHTML = institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');
            if (institutions.length > 0) {
                loadCourses(instSelect.value);
            }
        } catch (error) {
            showToast(`Erro ao carregar instituições: ${error.message}`, 'error');
        }
    }

    async function loadCourses(instId) {
        try {
            const allCourses = await ApiService.getCourses();
            const filteredCourses = allCourses.filter(course => course.institutionId == instId);
            
            courseSelect.innerHTML = filteredCourses.map(course => `<option value="${course.id}">${course.name}</option>`).join('');
            courseSelect.disabled = false;
            
            if (filteredCourses.length > 0) {
                loadDisciplines(courseSelect.value);
            } else {
                discSelect.innerHTML = '<option>Nenhum curso encontrado</option>';
                discSelect.disabled = true;
            }
        } catch (error) {
            showToast(`Erro ao carregar cursos: ${error.message}`, 'error');
        }
    }

    async function loadDisciplines(courseId) {
        try {
            const disciplines = await ApiService.getDisciplinesByCourse(courseId);
            discSelect.innerHTML = disciplines.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            discSelect.disabled = false;
        } catch (error) {
            showToast(`Erro ao carregar disciplinas: ${error.message}`, 'error');
        }
    }

    instSelect.addEventListener('change', () => loadCourses(instSelect.value));
    courseSelect.addEventListener('change', () => loadDisciplines(courseSelect.value));

    creationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTurma = {
            nome: document.getElementById('new-turma-name').value,
            idDisciplina: parseInt(discSelect.value),
            semestre: document.getElementById('new-turma-semestre').value,
            periodo: document.getElementById('new-turma-periodo').value,
        };

        if (!newTurma.nome || !newTurma.idDisciplina) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }

        try {
            await ApiService.addTurma(newTurma);
            showToast(`Turma "${newTurma.nome}" criada com sucesso!`, 'success');
            if (onTurmaCreatedCallback) {
                onTurmaCreatedCallback(instSelect.value);
            }
        } catch (error) {
            showToast(`Erro ao criar turma: ${error.message}`, 'error');
        }
    });

    loadInstitutions();
}
