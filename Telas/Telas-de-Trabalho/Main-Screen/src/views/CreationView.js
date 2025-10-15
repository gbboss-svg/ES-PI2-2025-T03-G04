import { MOCK_DATA } from '../services/DataService.js';

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
    const newDiscFields = container.querySelector('#new-discipline-fields');

    instSelect.innerHTML = MOCK_DATA.institutions.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('');

    function updateCourseSelect(instId) {
        const institution = MOCK_DATA.institutions.find(i => i.id == instId);
        courseSelect.innerHTML = '';
        discSelect.innerHTML = '';
        discSelect.disabled = true;
        
        if (institution && institution.courses.length > 0) {
            courseSelect.innerHTML = institution.courses.map(course => `<option value="${course.name}">${course.name}</option>`).join('');
            courseSelect.disabled = false;
            updateDisciplineSelect(instId, courseSelect.value);
        } else {
            courseSelect.innerHTML = '<option disabled selected>Nenhum curso cadastrado</option>';
            courseSelect.disabled = true;
        }
    }

    function updateDisciplineSelect(instId, courseName) {
        const institution = MOCK_DATA.institutions.find(i => i.id == instId);
        discSelect.innerHTML = '';
        newDiscFields.classList.remove('expanded');
        if (institution) {
            const filteredDisciplines = institution.disciplines.filter(d => d.curso === courseName);
            discSelect.innerHTML = filteredDisciplines.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            discSelect.innerHTML += '<option value="new">--- Criar nova disciplina ---</option>';
            discSelect.disabled = false;
        }
    }
    
    instSelect.addEventListener('change', () => updateCourseSelect(instSelect.value));
    courseSelect.addEventListener('change', () => updateDisciplineSelect(instSelect.value, courseSelect.value));
    discSelect.addEventListener('change', () => {
        if (discSelect.value === 'new') {
            newDiscFields.classList.add('expanded');
        } else {
            newDiscFields.classList.remove('expanded');
        }
    });

    creationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedInstId = instSelect.value;
        const selectedCourseName = courseSelect.value;
        const institution = MOCK_DATA.institutions.find(i => i.id == selectedInstId);
        let discipline;

        if (discSelect.value === 'new') {
            if (!selectedCourseName) {
                alert('Por favor, selecione um curso antes de criar uma nova disciplina.'); return;
            }
            const newDisciplineName = document.getElementById('new-discipline-name').value;
            const newDisciplineCode = document.getElementById('new-discipline-code').value;
            if (!newDisciplineName || !newDisciplineCode) { 
                alert('Preencha o nome e o código da nova disciplina.'); return; 
            }
            discipline = {
                id: Date.now(), name: newDisciplineName, code: newDisciplineCode, curso: selectedCourseName,
                period: document.getElementById('new-turma-semestre').value,
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
        
        // Chama o callback para notificar o app.js que a criação foi concluída
        if (onTurmaCreatedCallback) {
            onTurmaCreatedCallback(selectedInstId);
        }
    });
    
    if (MOCK_DATA.institutions.length > 0) {
        updateCourseSelect(instSelect.value);
    }
}
