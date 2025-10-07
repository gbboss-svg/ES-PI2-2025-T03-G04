export interface Discipline {
  id: string
  course: string
  name: string
  classNumber: string
  institution: string
  gradient: string
}

export interface EvaluationColumn {
  id: string
  name: string
  shortName: string
  weight?: number
}

export interface Student {
  id: string
  ra: string
  name: string
  email: string
  grades: Record<string, number> // Dynamic grades by column shortName
  average?: number
}

export interface GradeLog {
  id: string
  timestamp: string
  action: "grade_change" | "student_add" | "column_add" | "formula_change"
  studentName?: string
  columnName?: string
  oldValue?: string | number
  newValue?: string | number
  snapshot: {
    students: Student[]
    columns: EvaluationColumn[]
    formula: string
  }
}

export interface DisciplineData {
  discipline: Discipline
  students: Student[]
  evaluationColumns: EvaluationColumn[]
  formula: string
  logs: GradeLog[]
}

export const mockDisciplines: Discipline[] = [
  {
    id: "1",
    course: "Engenharia de Software",
    name: "Programação Web",
    classNumber: "A1",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  },
  {
    id: "2",
    course: "Ciência da Computação",
    name: "Banco de Dados",
    classNumber: "B2",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
  },
  {
    id: "3",
    course: "Sistemas de Informação",
    name: "Redes de Computadores",
    classNumber: "C3",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
  },
  {
    id: "4",
    course: "Engenharia de Software",
    name: "Inteligência Artificial",
    classNumber: "D4",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
  },
  {
    id: "5",
    course: "Ciência da Computação",
    name: "Estrutura de Dados",
    classNumber: "E5",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
  },
  {
    id: "6",
    course: "Sistemas de Informação",
    name: "Segurança da Informação",
    classNumber: "F6",
    institution: "Universidade Federal",
    gradient: "linear-gradient(135deg, #0891b2 0%, #f59e0b 100%)",
  },
]

export const mockStudents: Student[] = [
  {
    id: "1",
    ra: "2021001",
    name: "João Silva",
    email: "joao@email.com",
    grades: { P1: 8.5, P2: 7.0, T1: 9.0 },
    average: 8.17,
  },
  {
    id: "2",
    ra: "2021002",
    name: "Maria Santos",
    email: "maria@email.com",
    grades: { P1: 9.0, P2: 8.5, T1: 9.5 },
    average: 9.0,
  },
  {
    id: "3",
    ra: "2021003",
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    grades: { P1: 7.0, P2: 6.5, T1: 7.5 },
    average: 7.0,
  },
]

export const mockGradeLogs: GradeLog[] = [
  {
    id: "1",
    timestamp: "15/01/2025 14:30:25",
    action: "grade_change",
    studentName: "João Silva",
    columnName: "P1",
    oldValue: 8.0,
    newValue: 8.5,
    snapshot: {
      students: [],
      columns: [],
      formula: "",
    },
  },
]

export const mockDisciplineData: Record<string, DisciplineData> = {
  "1": {
    discipline: mockDisciplines[0],
    students: [
      {
        id: "1",
        ra: "2021001",
        name: "João Silva",
        email: "joao@email.com",
        grades: { P1: 8.5, P2: 7.0, T1: 9.0 },
        average: 8.17,
      },
      {
        id: "2",
        ra: "2021002",
        name: "Maria Santos",
        email: "maria@email.com",
        grades: { P1: 9.0, P2: 8.5, T1: 9.5 },
        average: 9.0,
      },
      {
        id: "3",
        ra: "2021003",
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        grades: { P1: 7.0, P2: 6.5, T1: 7.5 },
        average: 7.0,
      },
    ],
    evaluationColumns: [
      { id: "1", name: "Prova 1", shortName: "P1", weight: 0.4 },
      { id: "2", name: "Prova 2", shortName: "P2", weight: 0.4 },
      { id: "3", name: "Trabalho 1", shortName: "T1", weight: 0.2 },
    ],
    formula: "(P1 + P2) / 2 * 0.8 + T1 * 0.2",
    logs: [
      {
        id: "1",
        timestamp: "15/01/2025 14:30:25",
        action: "grade_change",
        studentName: "João Silva",
        columnName: "P1",
        oldValue: 8.0,
        newValue: 8.5,
        snapshot: {
          students: [],
          columns: [],
          formula: "",
        },
      },
    ],
  },
}
