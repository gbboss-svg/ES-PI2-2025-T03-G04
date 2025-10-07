"use client"

import type { Student } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface GradeTableProps {
  students: Student[]
  onGradeChange: (studentId: string, field: string, value: number) => void
}

export function GradeTable({ students, onGradeChange }: GradeTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      onGradeChange(studentId, field, numValue)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#3a3a3a] text-white">
            <th className="border border-gray-600 p-3 text-sm font-semibold uppercase text-center">
              *PRIMEIRA LINHA COM
              <br />
              INFORMAÇÕES DE SISTEMA
              <br />
              (ID, RA, NOME+
              <br />
              NOTA1,NOTA2,NOTA3)
            </th>
            <th className="border border-gray-600 p-3 text-sm font-semibold uppercase">
              &lt;-----AQUI
              <br />
              TAMBEM
            </th>
            <th className="border border-gray-600 p-3 text-sm font-semibold uppercase">
              PARTE DE
              <br />
              RESULTADO/MÉDIA
            </th>
            <th className="border border-gray-600 p-3 text-sm font-semibold uppercase">Parte de log</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white text-gray-800">
            <td className="border border-gray-300 p-3 text-sm">
              <div className="space-y-1">
                <div>
                  <strong>ID:</strong> 001
                </div>
                <div>
                  <strong>RA:</strong> 2021001
                </div>
                <div>
                  <strong>Nome:</strong> João Silva
                </div>
              </div>
            </td>
            <td className="border border-gray-300 p-3">
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Nota 1"
                  defaultValue="8.5"
                  className="h-10 text-gray-800 bg-white border-gray-300"
                  onFocus={() => setEditingCell("001-nota1")}
                  onBlur={() => setEditingCell(null)}
                />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Nota 2"
                  defaultValue="7.0"
                  className="h-10 text-gray-800 bg-white border-gray-300"
                  onFocus={() => setEditingCell("001-nota2")}
                  onBlur={() => setEditingCell(null)}
                />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Nota 3"
                  defaultValue="9.0"
                  className="h-10 text-gray-800 bg-white border-gray-300"
                  onFocus={() => setEditingCell("001-nota3")}
                  onBlur={() => setEditingCell(null)}
                />
              </div>
            </td>
            <td className="border border-gray-300 p-3 text-center">
              <div className="text-2xl font-bold text-[#10b981]">8.17</div>
              <div className="text-sm text-gray-600 mt-1">Média</div>
            </td>
            <td className="border border-gray-300 p-3 text-sm bg-gray-100">
              <p className="text-gray-700 leading-relaxed">
                O docente alterou a nota do João de 5 para 5.5. Deverá aparecer uma mensagem dd/mm/yyyy HH:MMss - (Aluno
                João Silva) - Nota de 5.0 para 5.5 modificada e salva.
              </p>
            </td>
          </tr>

          {students.slice(1).map((student) => (
            <tr key={student.id} className="bg-white text-gray-800 hover:bg-gray-50">
              <td className="border border-gray-300 p-3 text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>ID:</strong> {student.id.padStart(3, "0")}
                  </div>
                  <div>
                    <strong>RA:</strong> {student.ra}
                  </div>
                  <div>
                    <strong>Nome:</strong> {student.name}
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-3">
                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Nota 1"
                    defaultValue={student.nota1?.toString()}
                    className="h-10 text-gray-800 bg-white border-gray-300"
                    onChange={(e) => handleGradeChange(student.id, "nota1", e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Nota 2"
                    defaultValue={student.nota2?.toString()}
                    className="h-10 text-gray-800 bg-white border-gray-300"
                    onChange={(e) => handleGradeChange(student.id, "nota2", e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Nota 3"
                    defaultValue={student.nota3?.toString()}
                    className="h-10 text-gray-800 bg-white border-gray-300"
                    onChange={(e) => handleGradeChange(student.id, "nota3", e.target.value)}
                  />
                </div>
              </td>
              <td className="border border-gray-300 p-3 text-center">
                <div className="text-2xl font-bold text-[#10b981]">{student.average?.toFixed(2)}</div>
                <div className="text-sm text-gray-600 mt-1">Média</div>
              </td>
              <td className="border border-gray-300 p-3 text-sm bg-gray-50">
                <p className="text-gray-500 italic">Nenhuma alteração recente</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
