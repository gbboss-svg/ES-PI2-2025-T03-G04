  /**
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */
import * as ApiService from '../../services/ApiService.js';

export function renderCourseManagement(instId, institutions, container, modals) {
    const inst = institutions.find(i => i.id == instId);
    if (!inst || !container) return;

    container.innerHTML = `
        <ul class="list-group mt-3">
            ${inst.courses && inst.courses.length > 0 ? inst.courses.map(course => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${course.name}
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary edit-course-btn" data-course-id="${course.id}" title="Editar Curso">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-course-btn" data-course-id="${course.id}" data-course-name="${course.name}" title="Excluir Curso">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>
            `).join('') : '<li class="list-group-item text-muted">Nenhum curso cadastrado para esta instituição.</li>'}
        </ul>
        <div class="mt-2">
            <a class="text-decoration-none small add-course-link" href="#" data-inst-id="${inst.id}">
                <i class="bi bi-plus-circle me-1"></i> Adicionar novo curso a ${inst.name}
            </a>
        </div>
    `;

    container.querySelectorAll('.delete-course-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { courseId, courseName } = e.currentTarget.dataset;
            document.getElementById('course-to-delete-name').textContent = `${courseName} (da instituição ${inst.name})`;
            const confirmBtn = document.getElementById('confirm-delete-course-btn');
            confirmBtn.dataset.courseId = courseId;
            modals.deleteCourseModal.show();
        });
    });
    
    container.querySelectorAll('.edit-course-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { courseId } = e.currentTarget.dataset;
            const course = inst.courses.find(c => c.id == courseId);
            if(course) {
                document.getElementById('edit-course-name').value = course.name;
                document.getElementById('edit-course-sigla').value = course.sigla || '';
                document.getElementById('edit-course-semestres').value = course.semestres || '';
                document.getElementById('confirm-edit-course-btn').dataset.courseId = course.id;
                modals.editCourseModal.show();
            }
        });
    });

    const addCourseLink = container.querySelector('.add-course-link');
    if (addCourseLink) {
        addCourseLink.addEventListener('click', (e) => {
            e.preventDefault();
            const { instId } = e.currentTarget.dataset;
            const instName = institutions.find(i => i.id == instId)?.name || 'Instituição';
            document.getElementById('addCourseModalLabel').textContent = `Adicionar Novo Curso a ${instName}`;
            document.getElementById('confirm-add-course-btn').dataset.instId = instId;
            modals.addCourseModal.show();
        });
    }
}

export async function renderDisciplineManagement(courseId, courseName, container, modals, allCourses) {
    if (!container) return;
    
    container.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>`;

    const disciplines = await ApiService.getDisciplinesByCourse(courseId);

    container.innerHTML = `
        <ul class="list-group mt-3">
            ${disciplines.map(discipline => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${discipline.name}
                     <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary edit-discipline-btn" data-discipline-id="${discipline.id}" title="Editar Disciplina">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-discipline-btn" data-discipline-id="${discipline.id}" data-discipline-name="${discipline.name}" title="Excluir Disciplina">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>
            `).join('')}
            ${disciplines.length === 0 ? '<li class="list-group-item text-muted">Nenhuma disciplina cadastrada para este curso.</li>' : ''}
        </ul>
        <div class="mt-2">
            <a class="text-decoration-none small add-discipline-link" href="#" data-course-id="${courseId}">
                <i class="bi bi-plus-circle me-1"></i> Adicionar nova disciplina a ${courseName}
            </a>
        </div>
    `;

    container.querySelectorAll('.add-discipline-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const { courseId } = e.currentTarget.dataset;
            document.getElementById('addDisciplineModalLabel').textContent = `Adicionar Nova Disciplina a ${courseName}`;
            document.getElementById('confirm-add-discipline-btn').dataset.courseId = courseId;
            modals.addDisciplineModal.show();
        });
    });

    container.querySelectorAll('.delete-discipline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { disciplineId, disciplineName } = e.currentTarget.dataset;
            document.getElementById('discipline-to-delete-name').textContent = disciplineName;
            const confirmBtn = document.getElementById('confirm-delete-discipline-btn');
            confirmBtn.dataset.disciplineId = disciplineId;
            modals.deleteDisciplineModal.show();
        });
    });

    container.querySelectorAll('.edit-discipline-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const { disciplineId } = e.currentTarget.dataset;
            const discipline = disciplines.find(d => d.id == disciplineId);
            if(discipline) {
                document.getElementById('edit-discipline-name').value = discipline.name;
                document.getElementById('edit-discipline-sigla').value = discipline.sigla;
                document.getElementById('edit-discipline-period').value = discipline.periodo;
                
                const courseSelect = document.getElementById('edit-discipline-course-select-move');
                courseSelect.innerHTML = allCourses.map(c => `<option value="${c.id}" ${c.id === discipline.courseId ? 'selected' : ''}>${c.name}</option>`).join('');
                
                document.getElementById('confirm-edit-discipline-btn').dataset.disciplineId = discipline.id;
                modals.editDisciplineModal.show();
            }
        });
    });
}