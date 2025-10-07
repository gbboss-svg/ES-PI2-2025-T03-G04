"use client"

import { PageHeader } from "@/components/page-header"
import { Settings, Trash2 } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DashboardPage() {
  const { disciplines, deleteDiscipline } = useApp()
  const { addToast } = useToast()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; disciplineId: string | null }>({
    open: false,
    disciplineId: null,
  })

  const handleDelete = (disciplineId: string) => {
    setDeleteDialog({ open: true, disciplineId })
  }

  const confirmDelete = () => {
    if (deleteDialog.disciplineId) {
      deleteDiscipline(deleteDialog.disciplineId)
      addToast({
        title: "Disciplina removida",
        description: "A disciplina foi removida com sucesso.",
        variant: "success",
      })
    }
    setDeleteDialog({ open: false, disciplineId: null })
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="BEM VINDO A AREA DE TRABALHO *USERNAME" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {disciplines.map((discipline) => (
            <Link
              key={discipline.id}
              href={`/discipline/${discipline.id}`}
              className="group relative overflow-hidden rounded-2xl p-6 text-white transition-transform hover:scale-105"
              style={{ background: discipline.gradient }}
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 uppercase">{discipline.name}</h3>
                <p className="text-sm opacity-90 uppercase">
                  {discipline.course} / {discipline.classNumber}
                </p>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-3 z-20">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = `/discipline/${discipline.id}`
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                  aria-label="Editar"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(discipline.id)
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, disciplineId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita e todos os dados de alunos
              e notas serão perdidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, disciplineId: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
