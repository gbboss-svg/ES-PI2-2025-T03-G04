import { Router } from "express"
import pool from "../database"
import { AuditService } from "../services/AuditService"

const router = Router()

// GET all institutions
router.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const result = await pool.query("SELECT * FROM institutions ORDER BY name")

    if (userId) {
      await AuditService.log(Number.parseInt(userId), "VIEW", "institutions", null, "Visualizou lista de instituições")
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching institutions:", error)
    res.status(500).json({ error: "Failed to fetch institutions" })
  }
})

// GET institution by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("SELECT * FROM institutions WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Institution not found" })
    }

    if (userId) {
      await AuditService.log(
        Number.parseInt(userId),
        "VIEW",
        "institutions",
        Number.parseInt(id),
        `Visualizou instituição: ${result.rows[0].name}`,
      )
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching institution:", error)
    res.status(500).json({ error: "Failed to fetch institution" })
  }
})

// POST create institution
router.post("/", async (req, res) => {
  try {
    const { name, type } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("INSERT INTO institutions (name, type) VALUES ($1, $2) RETURNING *", [name, type])

    if (userId) {
      await AuditService.log(
        Number.parseInt(userId),
        "CREATE",
        "institutions",
        result.rows[0].id,
        `Criou instituição: ${name}`,
      )
    }

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating institution:", error)
    res.status(500).json({ error: "Failed to create institution" })
  }
})

// PUT update institution
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, type } = req.body
    const userId = req.headers["x-user-id"] as string

    const result = await pool.query("UPDATE institutions SET name = $1, type = $2 WHERE id = $3 RETURNING *", [
      name,
      type,
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Institution not found" })
    }

    if (userId) {
      await AuditService.log(
        Number.parseInt(userId),
        "UPDATE",
        "institutions",
        Number.parseInt(id),
        `Atualizou instituição: ${name}`,
      )
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating institution:", error)
    res.status(500).json({ error: "Failed to update institution" })
  }
})

// DELETE institution
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers["x-user-id"] as string

    const institution = await pool.query("SELECT name FROM institutions WHERE id = $1", [id])
    const result = await pool.query("DELETE FROM institutions WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Institution not found" })
    }

    if (userId && institution.rows.length > 0) {
      await AuditService.log(
        Number.parseInt(userId),
        "DELETE",
        "institutions",
        Number.parseInt(id),
        `Deletou instituição: ${institution.rows[0].name}`,
      )
    }

    res.json({ message: "Institution deleted successfully" })
  } catch (error) {
    console.error("Error deleting institution:", error)
    res.status(500).json({ error: "Failed to delete institution" })
  }
})

export default router
