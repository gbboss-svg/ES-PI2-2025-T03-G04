// --- CACHE DE ELEMENTOS DO DOM ---
export const views = {
    profile: document.getElementById('profile-view'),
    dashboard: document.getElementById('dashboard-view'),
    institutions: document.getElementById('institutions-view'),
    creation: document.getElementById('creation-view'),
    activeTurmas: document.getElementById('activeTurmas-view'),
    turmaDetail: document.getElementById('turma-detail-view'),
    settings: document.getElementById('settings-view'),
};

export const navLinks = document.querySelectorAll('.sidebar .nav-link');

// --- INICIALIZAÇÃO DOS MODAIS DO BOOTSTRAP ---
export const modals = {
    logoutModal: new bootstrap.Modal(document.getElementById('logoutModal')),
    addInstitutionModal: new bootstrap.Modal(document.getElementById('addInstitutionModal')),
    addCourseModal: new bootstrap.Modal(document.getElementById('addCourseModal')),
    addDisciplineModal: new bootstrap.Modal(document.getElementById('addDisciplineModal')),
    editTurmaModal: new bootstrap.Modal(document.getElementById('editTurmaModal')),
    editDisciplineModal: new bootstrap.Modal(document.getElementById('editDisciplineModal')),
    addStudentModal: new bootstrap.Modal(document.getElementById('addStudentModal')),
    finalizeSemesterModal: new bootstrap.Modal(document.getElementById('finalizeSemesterModal')),
    reopenTurmaModal: new bootstrap.Modal(document.getElementById('reopenTurmaModal')),
    deleteTurmaModal: new bootstrap.Modal(document.getElementById('deleteTurmaModal')),
    deleteDisciplineModal: new bootstrap.Modal(document.getElementById('deleteDisciplineModal')),
    deleteInstitutionModal: new bootstrap.Modal(document.getElementById('deleteInstitutionModal')),
    deleteCourseModal: new bootstrap.Modal(document.getElementById('deleteCourseModal')),
};
