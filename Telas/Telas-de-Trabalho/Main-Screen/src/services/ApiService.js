const BASE_URL = 'http://localhost:3333/api'; // O backend roda na porta 3333

/**
 * Função genérica para realizar requisições fetch.
 * @param {string} endpoint - O endpoint da API para o qual a requisição será feita.
 * @param {object} options - Opções da requisição (method, headers, body, etc.).
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            throw new Error(errorData.message || `Erro na requisição: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        // Aqui, poderíamos disparar um evento global para notificar o usuário
        throw error;
    }
}

// Funções de autenticação
export const login = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const getProfessorProfile = () => request('/professor/me');
export const verifyPassword = (password) => request('/professor/verify-password', { method: 'POST', body: JSON.stringify({ password }) });

// Funções para Instituições
export const getInstitutions = () => request('/professor/instituicoes');
export const addInstitution = (data) => request('/professor/instituicoes', { method: 'POST', body: JSON.stringify(data) });
export const updateInstitution = (id, data) => request(`/professor/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInstitution = (id) => request(`/professor/institutions/${id}`, { method: 'DELETE' });

// Funções para Cursos
export const getCourses = () => request('/professor/cursos');
export const addCourse = (data) => request('/professor/cursos', { method: 'POST', body: JSON.stringify(data) });
export const updateCourse = (instId, courseId, data) => request(`/institutions/${instId}/courses/${courseId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCourse = (instId, courseId) => request(`/institutions/${instId}/courses/${courseId}`, { method: 'DELETE' });

// Funções para Disciplinas
export const getProfessorDisciplines = () => request('/professor/disciplinas');
export const getDisciplinesByCourse = (courseId) => request(`/curso/${courseId}/disciplinas`);
export const addDiscipline = (data) => request('/disciplinas', { method: 'POST', body: JSON.stringify(data) });
export const updateDiscipline = (id, data) => request(`/disciplines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDiscipline = (id) => request(`/disciplines/${id}`, { method: 'DELETE' });

// Funções para Turmas
export const getActiveTurmas = () => request('/turmas/ativas');
export const getTurmas = (disciplineId) => request(`/disciplina/${disciplineId}/turmas`);
export const getTurmaDetail = (id) => request(`/turmas/${id}`);
export const addTurma = (data) => request('/turmas', { method: 'POST', body: JSON.stringify(data) });
export const updateTurma = (id, data) => request(`/turmas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTurma = (id) => request(`/turmas/${id}`, { method: 'DELETE' });
export const finalizeTurma = (id) => request(`/turmas/${id}/finalize`, { method: 'POST' });
export const reopenTurma = (id, password) => request(`/turmas/${id}/reopen`, { method: 'POST', body: JSON.stringify({ password }) });

// Funções para Alunos
export const addStudent = (turmaId, data) => request(`/turmas/${turmaId}/students`, { method: 'POST', body: JSON.stringify(data) });
export const updateStudentGrades = (turmaId, studentId, grades) => request(`/turmas/${turmaId}/students/${studentId}/grades`, { method: 'PUT', body: JSON.stringify({ grades }) });
export const removeStudent = (turmaId, studentId) => request(`/turmas/${turmaId}/students/${studentId}`, { method: 'DELETE' });
