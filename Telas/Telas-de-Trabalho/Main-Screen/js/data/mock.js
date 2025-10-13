// --- DADOS MOCK (Simulando o banco de dados) ---
export const MOCK_DATA = {
    user: {
        name: 'Prof. Dr. Lua Muriana',
        email: 'lua.marcelo@puc-campinas.edu.br'
    },
    institutions: [
        {
            id: 1,
            name: 'PUC-Campinas',
            disciplines: [
                {
                    id: 101,
                    name: 'Projeto Integrador 2',
                    code: 'ES-PI2',
                    period: '4º Semestre',
                    maxGrade: 10,
                    gradeComponents: [
                        { id: 201, name: 'Entrega 1', acronym: 'E1', description: 'Documento de Visão e Requisitos' },
                        { id: 202, name: 'Entrega 2', acronym: 'E2', description: 'Protótipo e Modelagem' },
                        { id: 203, name: 'Apresentação Final', acronym: 'AF', description: 'Apresentação para a banca' },
                    ],
                    finalGradeFormula: '(E1*0.3) + (E2*0.3) + (AF*0.4)',
                    hasAdjustedColumn: true,
                    turmas: [
                        {
                            id: 1001,
                            name: 'Turma 1',
                            code: 'T1',
                            isFinalized: false,
                            students: [
                                { id: 11111, name: 'Abel Antimônio', grades: { 'E1': 8.5, 'E2': 9.0, 'AF': 9.5 } },
                                { id: 11112, name: 'Bianca Nióbio', grades: { 'E1': 7.0, 'E2': 6.5, 'AF': 8.0 } },
                                { id: 11113, name: 'Carla Polônio', grades: { 'E1': 9.5, 'E2': 9.8, 'AF': 10.0 } },
                                { id: 11114, name: 'Carlos Zinco', grades: { 'E1': 4.3, 'E2': 5.0, 'AF': 3.5 } },
                            ]
                        },
                        { id: 1002, name: 'Turma 2', code: 'T2', isFinalized: true, students: [] }
                    ]
                },
                { id: 102, name: 'Cálculo I', code: 'MAT001', period: '1º Semestre', maxGrade: 10, gradeComponents: [], finalGradeFormula: '', hasAdjustedColumn: false, turmas: [] }
            ]
        },
        { id: 2, name: 'UNICAMP', disciplines: [] }
    ],
    auditLog: [
        { id: 1, timestamp: '2025-10-09 14:30:15', message: 'Nota de "Entrega 1" do aluno Abel Antimônio alterada de 8.0 para 8.5.', snapshot: null },
        { id: 2, timestamp: '2025-10-09 14:28:02', message: 'Nota de "Entrega 1" do aluno Bianca Nióbio lançada: 7.0.', snapshot: null },
        { id: 3, timestamp: '2025-10-08 11:05:41', message: 'Aluno Carlos Zinco adicionado à Turma 1.', snapshot: null },
    ]
};
