"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Discipline, Student, EvaluationColumn, GradeLog } from "./mock-data"
import { mockDisciplines } from "./mock-data"

interface AppState {
  disciplines: Discipline[]
  addDiscipline: (discipline: Omit<Discipline, "id">) => void
  updateDiscipline: (id: string, updates: Partial<Discipline>) => void
  deleteDiscipline: (id: string) => void
  getDiscipline: (id: string) => Discipline | undefined
  updateDisciplineData: (
    id: string,
    students: Student[],
    columns: EvaluationColumn[],
    formula: string,
    logs: GradeLog[],
  ) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(mockDisciplines)

  const addDiscipline = useCallback((discipline: Omit<Discipline, "id">) => {
    const newDiscipline: Discipline = {
      ...discipline,
      id: Date.now().toString(),
    }
    setDisciplines((prev) => [...prev, newDiscipline])
  }, [])

  const updateDiscipline = useCallback((id: string, updates: Partial<Discipline>) => {
    setDisciplines((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }, [])

  const deleteDiscipline = useCallback((id: string) => {
    setDisciplines((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const getDiscipline = useCallback(
    (id: string) => {
      return disciplines.find((d) => d.id === id)
    },
    [disciplines],
  )

  const updateDisciplineData = useCallback(
    (id: string, students: Student[], columns: EvaluationColumn[], formula: string, logs: GradeLog[]) => {
      setDisciplines((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                students,
                evaluationColumns: columns,
                formula,
                logs,
              }
            : d,
        ),
      )
    },
    [],
  )

  return (
    <AppContext.Provider
      value={{
        disciplines,
        addDiscipline,
        updateDiscipline,
        deleteDiscipline,
        getDiscipline,
        updateDisciplineData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
