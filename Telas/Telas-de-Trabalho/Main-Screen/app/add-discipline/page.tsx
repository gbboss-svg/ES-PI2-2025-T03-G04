"use client"

import type React from "react"

import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/lib/store"
import { useToast } from "@/components/ui/toast"

export default function AddDisciplinePage() {
  const router = useRouter()
  const { addDiscipline } = useApp()
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    course: "",
    discipline: "",
    classNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ]
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]

    addDiscipline({
      name: formData.discipline,
      course: formData.course,
      classNumber: formData.classNumber,
      gradient: randomGradient,
      students: [],
      evaluationColumns: [],
      formula: "",
      logs: [],
    })

    addToast({
      title: "Disciplina criada",
      description: `${formData.discipline} foi criada com sucesso!`,
      variant: "success",
    })

    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/")
    }, 500)
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="ADICIONE A SUA DISCIPLINA!" />

      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-2xl space-y-8">
          <h2 className="text-2xl font-bold text-center text-foreground">ESSA MATÉRIA PERTENCERÁ A *INSTITUIÇÃO</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              placeholder="DIGITE O SEU CURSO"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              required
            />

            <Input
              placeholder="DIGITE O NOME DE SUA DISCIPLINA"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              required
            />

            <Input
              placeholder="DIGITE O NUMERO DE SUA TURMA"
              value={formData.classNumber}
              onChange={(e) => setFormData({ ...formData, classNumber: e.target.value })}
              required
            />

            <div className="flex flex-col gap-4 items-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-6 px-12 rounded-full text-lg uppercase min-w-[280px] disabled:opacity-50"
              >
                {isSubmitting ? "CRIANDO..." : "CRIAR DISCIPLINA"}
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/")}
                variant="secondary"
                disabled={isSubmitting}
                className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-bold py-6 px-12 rounded-full text-lg uppercase min-w-[280px] disabled:opacity-50"
              >
                VOLTAR
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
