





import express, { Request, Response } from "express"
import pool from "../database"
import { AuditService } from "../sms/AuditService"

const router = express.Router()

// GET students by turma
router.get("/turma/:turmaId", async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      `
      SELECT s.*, ts.enrollment_date, ts.status
      FROM students s
      JOIN turma_students ts ON s.id = ts.student_id
      WHERE ts.turma_id = $1
      ORDER BY s.name
    `,
      [turmaId],
    )

    if (userId) {
      await AuditService.log({ userId: Number.parseInt(userId), actionType: "VIEW", entityType: "students", details: `Visualizou alunos da turma ${turmaId}` })
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching turma students:", error)
    res.status(500).json({ error: "Failed to fetch turma students" })
  }
})

// GET student grades
router.get("/:studentId/grades/:turmaId", async (req: Request, res: Response) => {
  try {
    const { studentId, turmaId } = req.params
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      `
      SELECT g.*, d.name as discipline_name, d.code as discipline_code
      FROM grades g
      JOIN disciplines d ON g.discipline_id = d.id
      WHERE g.student_id = $1 AND g.turma_id = $2
      ORDER BY d.name
    `,
      [studentId, turmaId],
    )

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "VIEW",
        entityType: "grades",
        details: `Visualizou notas do aluno ${studentId} na turma ${turmaId}`,
      })
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching student grades:", error)
    res.status(500).json({ error: "Failed to fetch student grades" })
  }
})

// POST create student
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, registration_number, email } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      "INSERT INTO students (name, registration_number, email) VALUES ($1, $2, $3) RETURNING *",
      [name, registration_number, email],
    )

    if (userId) {
      await AuditService.log({ userId: Number.parseInt(userId), actionType: "CREATE", entityType: "students", entityId: result.rows[0].id, details: `Criou aluno: ${name}` })
    }

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating student:", error)
    res.status(500).json({ error: "Failed to create student" })
  }
})

// PUT update student
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, registration_number, email } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      "UPDATE students SET name = $1, registration_number = $2, email = $3 WHERE id = $4 RETURNING *",
      [name, registration_number, email, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" })
    }

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "UPDATE",
        entityType: "students",
        entityId: Number.parseInt(id),
        details: `Atualizou aluno: ${name}`,
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating student:", error)
    res.status(500).json({ error: "Failed to update student" })
  }
})

// POST save grades
router.post("/grades", async (req: Request, res: Response) => {
  try {
    const { student_id, turma_id, discipline_id, grade_data } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      `
      INSERT INTO grades (student_id, turma_id, discipline_id, grade_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, turma_id, discipline_id)
      DO UPDATE SET grade_data = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [student_id, turma_id, discipline_id, JSON.stringify(grade_data)],
    )

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "UPDATE",
        entityType: "grades",
        entityId: result.rows[0].id,
        details: `Salvou notas do aluno ${student_id} em disciplina ${discipline_id}`,
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error saving grades:", error)
    res.status(500).json({ error: "Failed to save grades" })
  }
})

export default router