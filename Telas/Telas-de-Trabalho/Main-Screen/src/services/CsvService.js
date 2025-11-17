/**
 * Formata um campo individual para ser seguro em um CSV, lidando com vírgulas e aspas.
 * @param {string | number | null | undefined} field - O valor do campo a ser formatado.
 * @returns {string} O campo formatado para CSV.
 */
function formatCsvField(field) {
    const value = field === null || field === undefined ? '' : String(field);
    // Se o campo contém vírgula, aspas ou quebra de linha, ele precisa ser encapsulado em aspas.
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // As aspas dentro do campo devem ser escapadas (duplicadas).
        const escapedValue = value.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
    return value;
}


/**
 * Converte os dados da turma para o formato CSV de forma robusta.
 */
export function exportTurmaToCsv(turma, disciplina) {
    // Formata os cabeçalhos para serem seguros no CSV
    const headers = ['matricula', 'nome', ...disciplina.gradeComponents.map(c => c.acronym)].map(formatCsvField);

    // Formata cada linha de dados do aluno
    const rows = turma.students.map(student => {
        const rowData = [student.id, student.name];
        disciplina.gradeComponents.forEach(comp => {
            rowData.push(student.grades[comp.acronym] || '');
        });
        // Aplica a formatação a cada célula da linha antes de juntar
        return rowData.map(formatCsvField).join(',');
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