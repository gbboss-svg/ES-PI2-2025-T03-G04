
// Serviço para buscar dados reais do backend
export async function fetchInstitutions(token) {
    const res = await fetch('http://localhost:3333/professor/instituicoes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar instituições');
    return await res.json();
}

export async function fetchCourses(token) {
    const res = await fetch('http://localhost:3333/professor/cursos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar cursos');
    return await res.json();
}

// Adicione funções semelhantes para disciplinas, turmas, alunos, etc. conforme o backend
