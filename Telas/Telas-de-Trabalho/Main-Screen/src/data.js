import * as ApiService from './services/ApiService.js';
import { showToast } from './services/NotificationService.js';
import { setAppState } from './state.js';
import { renderAll } from './navigation.js';

/**
 * Carrega os dados iniciais da aplicação a partir da API.
 */
export async function loadInitialData() {
    try {
        // Isola as chamadas para identificar a falha
        const user = await ApiService.getProfessorProfile();
        
        const institutions = await ApiService.getInstitutions();
        const courses = await ApiService.getCourses();
        const disciplines = await ApiService.getProfessorDisciplines();

        // Mapeia as disciplinas para seus respectivos cursos
        const coursesWithDisciplines = courses.map(course => ({
            ...course,
            disciplines: disciplines.filter(disc => disc.cursoId === course.id)
        }));

        // Mapeia os cursos para suas respectivas instituições
        const institutionsWithCourses = institutions.map(inst => ({
            ...inst,
            courses: coursesWithDisciplines.filter(course => course.institutionId === inst.id)
        }));
        
        const activeTurmas = await ApiService.getActiveTurmas();
        
        setAppState({
            user,
            institutions: institutionsWithCourses,
            activeTurmas
        });

        renderAll(); // Re-renderiza os componentes com os novos dados
    } catch (error) {
        console.error("Falha ao carregar dados iniciais:", error);
        showToast(`Erro ao carregar dados: ${error.message}`, 'error');
    }
}
