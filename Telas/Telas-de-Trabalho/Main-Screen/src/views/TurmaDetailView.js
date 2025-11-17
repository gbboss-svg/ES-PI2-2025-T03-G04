import { renderAuditLog } from "../services/AuditService.js";
import { renderMainHTML, renderGradeComponentsList, renderGradesTable } from "./TurmaDetail/ui.js";
import { attachAllListeners } from "./TurmaDetail/eventHandlers.js";

let currentTurmaContext = {};

/**
 * Renderiza a view de detalhes da turma.
 */
export function renderTurmaDetailView(turma, disciplina, modals) {
  if (!turma || !disciplina) {
    console.error("renderTurmaDetailView called with invalid parameters", { turma, disciplina });
    return;
  }

  currentTurmaContext = { turma, disciplina };
  const container = document.getElementById("turma-detail-view");
  if (!container) {
    console.error("turma-detail-view container not found");
    return;
  }

  const safeDisciplina = {
    ...disciplina,
    course: { ...(turma.course ?? {}), name: (turma.course?.name ?? 'Curso') }
  };

  container.innerHTML = renderMainHTML(turma, safeDisciplina);

  if (!safeDisciplina.gradeComponents) safeDisciplina.gradeComponents = [];
  if (!turma.students) turma.students = [];

  renderGradeComponentsList(safeDisciplina);
  renderGradesTable(turma, safeDisciplina);
  renderAuditLog(currentTurmaContext, renderTurmaDetailView);

  const gradeEditSelector = document.getElementById("grade-edit-selector");
  if (gradeEditSelector) {
    let options = '<option value="">Selecione para editar...</option>';
    if (disciplina.gradeComponents && disciplina.gradeComponents.length > 0) {
      disciplina.gradeComponents.forEach((comp) => {
        options += `<option value="${comp.acronym}">${comp.name}</option>`;
      });
    }
    gradeEditSelector.innerHTML = options;
  }
  
  attachAllListeners(turma, disciplina, modals, renderTurmaDetailView, currentTurmaContext);
}