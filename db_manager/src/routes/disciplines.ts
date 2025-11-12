





import express, { Request, Response } from "express"
import pool from "../database"
import { AuditService } from "../sms/AuditService"

const router = express.Router()

// GET all disciplines
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const result = await pool.query("SELECT * FROM disciplines ORDER BY name")

    if (userId) {
      await AuditService.log({ userId: Number.parseInt(userId), actionType: "VIEW", entityType: "disciplines", details: "Visualizou lista de disciplinas" })
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching disciplines:", error)
    res.status(500).json({ error: "Failed to fetch disciplines" })
  }
})

// GET discipline by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("SELECT * FROM disciplines WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Discipline not found" })
    }

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "VIEW",
        entityType: "disciplines",
        entityId: Number.parseInt(id),
        details: `Visualizou disciplina: ${result.rows[0].name}`,
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching discipline:", error)
    res.status(500).json({ error: "Failed to fetch discipline" })
  }
})

// GET disciplines by turma
router.get("/turma/:turmaId", async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query(
      `
      SELECT d.*, td.weight, td.formula_id, td.grade_components
      FROM disciplines d
      JOIN turma_disciplines td ON d.id = td.discipline_id
      WHERE td.turma_id = $1
      ORDER BY d.name
    `,
      [turmaId],
    )

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "VIEW",
        entityType: "disciplines",
        details: `Visualizou disciplinas da turma ${turmaId}`,
      })
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching turma disciplines:", error)
    res.status(500).json({ error: "Failed to fetch turma disciplines" })
  }
})

// POST create discipline
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("INSERT INTO disciplines (name, code) VALUES ($1, $2) RETURNING *", [name, code])

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "CREATE",
        entityType: "disciplines",
        entityId: result.rows[0].id,
        details: `Criou disciplina: ${name}`,
      })
    }

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating discipline:", error)
    res.status(500).json({ error: "Failed to create discipline" })
  }
})

// PUT update discipline
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, code } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("UPDATE disciplines SET name = $1, code = $2 WHERE id = $3 RETURNING *", [
      name,
      code,
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Discipline not found" })
    }

    if (userId) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "UPDATE",
        entityType: "disciplines",
        entityId: Number.parseInt(id),
        details: `Atualizou disciplina: ${name}`,
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating discipline:", error)
    res.status(500).json({ error: "Failed to update discipline" })
  }
})

// DELETE discipline
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.headers["x-user-id"] as string

    const discipline = await pool.query("SELECT name FROM disciplines WHERE id = $1", [id])
    const result = await pool.query("DELETE FROM disciplines WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Discipline not found" })
    }

    if (userId && discipline.rows.length > 0) {
      await AuditService.log({
        userId: Number.parseInt(userId),
        actionType: "DELETE",
        entityType: "disciplines",
        entityId: Number.parseInt(id),
        details: `Deletou disciplina: ${discipline.rows[0].name}`,
      })
    }

    res.json({ message: "Discipline deleted successfully" })
  } catch (error) {
    console.error("Error deleting discipline:", error)
    res.status(500).json({ error: "Failed to delete discipline" })
  }
})

export default router