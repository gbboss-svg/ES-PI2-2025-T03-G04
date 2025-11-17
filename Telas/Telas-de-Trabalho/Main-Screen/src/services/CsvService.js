/**
 * Converte os dados da turma para o formato CSV.
 */
export function exportTurmaToCsv(turma, disciplina) {
    const headers = ['matricula', 'nome', ...disciplina.gradeComponents.map(c => c.acronym)];
    const rows = turma.students.map(student => {
        const row = [student.id, student.name];
        disciplina.gradeComponents.forEach(comp => {
            row.push(student.grades[comp.acronym] || '');
        });
        return row.join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

/**
 * Faz o download de uma string de dados como um arquivo.
 */
export function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Analisa o conteúdo de um arquivo CSV e o converte em uma lista de alunos.
 */
export function importStudentsFromCsv(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");
    }

    const headers = lines[0].trim().toLowerCase().split(',');
    const requiredHeaders = ['matricula', 'nome'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
        throw new Error(`O arquivo CSV não contém as seguintes colunas obrigatórias: ${missingHeaders.join(', ')}.`);
    }

    const students = lines.slice(1).map(line => {
        const values = line.trim().split(',');
        const student = {
            id: values[headers.indexOf('matricula')],
            name: values[headers.indexOf('nome')],
            grades: {}
        };

        headers.forEach((header, index) => {
            if (!requiredHeaders.includes(header)) {
                student.grades[header] = parseFloat(values[index]) || 0;
            }
        });

        return student;
    });

    return { headers, students };
}