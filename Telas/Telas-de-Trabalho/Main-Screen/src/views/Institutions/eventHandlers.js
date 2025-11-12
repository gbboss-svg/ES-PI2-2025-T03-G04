import * as ApiService from '../../services/ApiService.js';
import { showToast } from '../../services/NotificationService.js';

function attachTurmaActionListeners(container, callbacks, modals) {
    // Botão para visualizar detalhes da turma
    container.querySelectorAll('.view-turma-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const turmaData = JSON.parse(btn.dataset.turmaId);
            try {
                // Registrar o acesso recente ao curso antes de abrir a turma
                if (turmaData.course && turmaData.course.id) {
                    await ApiService.touchCourse(turmaData.course.id);
                }
                // A API de detalhes da turma já retorna o necessário
                const turmaDetalhada = await ApiService.getTurmaDetail(turmaData.id);
                callbacks.renderTurmaDetailView(turmaDetalhada);
            } catch (error) {
                showToast(`Erro ao carregar detalhes da turma: ${error.message}`, 'error');
            }
        });
    });

    // Botão para deletar turma
    container.querySelectorAll('.delete-turma-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const { turmaId, turmaName } = btn.dataset;
            document.getElementById('turma-to-delete-name').textContent = turmaName;
            const confirmBtn = document.getElementById('confirm-delete-turma-btn');
            confirmBtn.dataset.turmaId = turmaId;
            modals.deleteTurmaModal.show();
        });
    });

    // Botão para editar turma
    container.querySelectorAll('.edit-turma-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const { turmaId } = btn.dataset;
            // Lógica para preencher o modal de edição e mostrá-lo
            // Ex: fillEditTurmaModal(turmaId);
            modals.editTurmaModal.show();
        });
    });
}


async function handleAccordionShow(event, callbacks, modals) {
    const disciplineId = event.target.id.replace('collapse-disc-', '');
    const turmasListContainer = event.target.querySelector('.turmas-list-container');

    if (turmasListContainer.dataset.loaded === 'true') {
        return;
    }

    turmasListContainer.innerHTML = `<li class="list-group-item text-muted">Carregando...</li>`;

    try {
        const turmas = await ApiService.getTurmas(disciplineId);
        turmasListContainer.dataset.loaded = 'true';

        if (turmas.length > 0) {
            turmasListContainer.innerHTML = turmas.map(turma => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        ${turma.name}
                        ${turma.isFinalized ? '<span class="badge bg-secondary ms-2">Finalizada</span>' : ''}
                    </span>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-danger delete-turma-btn" data-turma-id="${turma.id}" data-turma-name="${turma.name}" title="Excluir Turma">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary edit-turma-btn" data-turma-id="${turma.id}" title="Editar Turma">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary view-turma-btn" data-turma-id='${JSON.stringify(turma)}'>
                            Abrir Turma <i class="bi bi-arrow-right-short"></i>
                        </button>
                    </div>
                </li>
            `).join('');
        } else {
            turmasListContainer.innerHTML = '<li class="list-group-item text-muted">Nenhuma turma cadastrada.</li>';
        }
        
        attachTurmaActionListeners(turmasListContainer, callbacks, modals);

    } catch (error) {
        showToast(`Erro ao carregar turmas: ${error.message}`, 'error');
        turmasListContainer.innerHTML = `<li class="list-group-item text-danger">Falha ao carregar turmas.</li>`;
    }
}

export function attachInstitutionsViewListeners(container, modals, callbacks) {
    container.querySelector('#add-new-from-management-btn').addEventListener('click', () => {
        callbacks.switchView('creation');
    });

    container.querySelectorAll('.delete-institution-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const { instId, instName } = btn.dataset;
            document.getElementById('institution-to-delete-name').textContent = instName;
            const confirmBtn = document.getElementById('confirm-delete-institution-btn');
            confirmBtn.dataset.instId = instId;
            modals.deleteInstitutionModal.show();
        });
    });

    container.querySelectorAll('.collapse[id^="collapse-disc-"]').forEach(collapseEl => {
        collapseEl.addEventListener('show.bs.collapse', (event) => handleAccordionShow(event, callbacks, modals));
    });
    
    container.querySelectorAll('.edit-discipline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const { discId } = btn.dataset;
            // Lógica para preencher o modal de edição de disciplina e exibi-lo
            // Ex: fillEditDisciplineModal(discId);
            modals.editDisciplineModal.show();
        });
    });

    container.querySelectorAll('.delete-discipline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const { discId, discName } = btn.dataset;
            document.getElementById('discipline-to-delete-name').textContent = discName;
            const confirmBtn = document.getElementById('confirm-delete-discipline-btn');
            confirmBtn.dataset.discId = discId;
            modals.deleteDisciplineModal.show();
        });
    });
}