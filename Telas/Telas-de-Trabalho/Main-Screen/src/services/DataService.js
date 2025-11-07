// Serviço para buscar dados reais do backend
export async function fetchInstitutions(token) {
    const res = await fetch('http://localhost:3333/professor/instituicoes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar instituições');
    return await res.json();
}

export async function fetchCourses(token, institutionId) {
    const res = await fetch(`http://localhost:3333/instituicao/${institutionId}/cursos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar cursos');
    return await res.json();
}

export async function fetchDisciplines(token, courseId) {
    const res = await fetch(`http://localhost:3333/curso/${courseId}/disciplinas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar disciplinas');
    return await res.json();
}

export async function fetchTurmas(token, disciplineId) {
    const res = await fetch(`http://localhost:3333/disciplina/${disciplineId}/turmas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar turmas');
    return await res.json();
}
