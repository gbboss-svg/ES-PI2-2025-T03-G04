import { Router, type Request, type Response } from "express"
import { TurmaService } from "../services/TurmaService"
import { AuditService } from "../services/AuditService"

const router = Router()

// Listar todas as turmas
router.get("/", async (req: Request, res: Response) => {
  try {
    const turmas = await TurmaService.getAll()
    res.json(turmas)
  } catch (error) {
    console.error("Erro ao buscar turmas:", error)
    res.status(500).json({ error: "Erro ao buscar turmas" })
  }
})

// Buscar turma por ID com detalhes completos
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const turma = await TurmaService.getById(Number.parseInt(req.params.id))

    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada" })
    }

    // Registrar auditoria
    await AuditService.log({
      actionType: "VIEW",
      entityType: "turma",
      entityId: turma.id,
      details: `Visualização da turma ${turma.name}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json(turma)
  } catch (error) {
    console.error("Erro ao buscar turma:", error)
    res.status(500).json({ error: "Erro ao buscar turma" })
  }
})

// Criar nova turma
router.post("/", async (req: Request, res: Response) => {
  try {
    const turmaData = req.body
    const turmaId = await TurmaService.create(turmaData)

    // Registrar auditoria
    await AuditService.log({
      actionType: "CREATE",
      entityType: "turma",
      entityId: turmaId,
      details: `Nova turma criada: ${turmaData.name}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.status(201).json({ id: turmaId, message: "Turma criada com sucesso" })
  } catch (error) {
    console.error("Erro ao criar turma:", error)
    res.status(500).json({ error: "Erro ao criar turma" })
  }
})

// Atualizar turma
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    const turmaData = req.body

    await TurmaService.update(turmaId, turmaData)

    // Registrar auditoria
    await AuditService.log({
      actionType: "UPDATE",
      entityType: "turma",
      entityId: turmaId,
      details: `Turma atualizada: ${turmaData.name}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json({ message: "Turma atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar turma:", error)
    res.status(500).json({ error: "Erro ao atualizar turma" })
  }
})

// Deletar turma (soft delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    await TurmaService.delete(turmaId)

    // Registrar auditoria
    await AuditService.log({
      actionType: "DELETE",
      entityType: "turma",
      entityId: turmaId,
      details: `Turma deletada`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json({ message: "Turma deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar turma:", error)
    res.status(500).json({ error: "Erro ao deletar turma" })
  }
})

// Finalizar turma
router.post("/:id/finalize", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    await TurmaService.finalize(turmaId)

    // Registrar auditoria
    await AuditService.log({
      actionType: "FINALIZE",
      entityType: "turma",
      entityId: turmaId,
      details: `Turma finalizada`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json({ message: "Turma finalizada com sucesso" })
  } catch (error) {
    console.error("Erro ao finalizar turma:", error)
    res.status(500).json({ error: "Erro ao finalizar turma" })
  }
})

// Listar alunos de uma turma
router.get("/:id/students", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    const students = await TurmaService.getStudents(turmaId)
    res.json(students)
  } catch (error) {
    console.error("Erro ao buscar alunos:", error)
    res.status(500).json({ error: "Erro ao buscar alunos" })
  }
})

// Adicionar aluno à turma
router.post("/:id/students", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    const { studentId } = req.body

    await TurmaService.addStudent(turmaId, studentId)

    // Registrar auditoria
    await AuditService.log({
      actionType: "ADD_STUDENT",
      entityType: "turma",
      entityId: turmaId,
      details: `Aluno ${studentId} adicionado à turma`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.status(201).json({ message: "Aluno adicionado com sucesso" })
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error)
    res.status(500).json({ error: "Erro ao adicionar aluno" })
  }
})

// Remover aluno da turma
router.delete("/:id/students/:studentId", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.id)
    const studentId = Number.parseInt(req.params.studentId)

    await TurmaService.removeStudent(turmaId, studentId)

    // Registrar auditoria
    await AuditService.log({
      actionType: "REMOVE_STUDENT",
      entityType: "turma",
      entityId: turmaId,
      details: `Aluno ${studentId} removido da turma`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json({ message: "Aluno removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover aluno:", error)
    res.status(500).json({ error: "Erro ao remover aluno" })
  }
})

// Atualizar nota de aluno
router.put("/:turmaId/students/:studentId/grades", async (req: Request, res: Response) => {
  try {
    const turmaId = Number.parseInt(req.params.turmaId)
    const studentId = Number.parseInt(req.params.studentId)
    const { gradeComponentId, score } = req.body

    await TurmaService.updateGrade(turmaId, studentId, gradeComponentId, score)

    // Registrar auditoria
    await AuditService.log({
      actionType: "UPDATE_GRADE",
      entityType: "grade",
      details: `Nota atualizada: Aluno ${studentId}, Componente ${gradeComponentId}, Nota ${score}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })

    res.json({ message: "Nota atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar nota:", error)
    res.status(500).json({ error: "Erro ao atualizar nota" })
  }
})

export default router
