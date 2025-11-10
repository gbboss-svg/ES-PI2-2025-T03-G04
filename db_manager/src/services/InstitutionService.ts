import pool from "../database"
import { auditLog } from "./AuditService"

export class InstitutionService {
  async getAllInstitutions(userId: number) {
    try {
      const result = await pool.query("SELECT * FROM institutions WHERE user_id = $1 ORDER BY name", [userId])

      await auditLog({
        userId,
        action: "VIEW",
        entityType: "Institution",
        entityId: null,
        details: { count: result.rows.length },
      })

      return result.rows
    } catch (error) {
      console.error("Error getting institutions:", error)
      throw error
    }
  }

  async getInstitutionById(id: number, userId: number) {
    try {
      const result = await pool.query("SELECT * FROM institutions WHERE id = $1 AND user_id = $2", [id, userId])

      if (result.rows.length > 0) {
        await auditLog({
          userId,
          action: "VIEW",
          entityType: "Institution",
          entityId: id,
          details: result.rows[0],
        })
      }

      return result.rows[0]
    } catch (error) {
      console.error("Error getting institution:", error)
      throw error
    }
  }

  async createInstitution(data: any, userId: number) {
    try {
      const result = await pool.query(
        `INSERT INTO institutions (name, abbreviation, user_id) 
         VALUES ($1, $2, $3) RETURNING *`,
        [data.name, data.abbreviation, userId],
      )

      await auditLog({
        userId,
        action: "CREATE",
        entityType: "Institution",
        entityId: result.rows[0].id,
        details: result.rows[0],
      })

      return result.rows[0]
    } catch (error) {
      console.error("Error creating institution:", error)
      throw error
    }
  }

  async updateInstitution(id: number, data: any, userId: number) {
    try {
      const result = await pool.query(
        `UPDATE institutions 
         SET name = $1, abbreviation = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND user_id = $4 RETURNING *`,
        [data.name, data.abbreviation, id, userId],
      )

      await auditLog({
        userId,
        action: "UPDATE",
        entityType: "Institution",
        entityId: id,
        details: result.rows[0],
      })

      return result.rows[0]
    } catch (error) {
      console.error("Error updating institution:", error)
      throw error
    }
  }

  async deleteInstitution(id: number, userId: number) {
    try {
      await pool.query("DELETE FROM institutions WHERE id = $1 AND user_id = $2", [id, userId])

      await auditLog({
        userId,
        action: "DELETE",
        entityType: "Institution",
        entityId: id,
        details: { deleted: true },
      })

      return { success: true }
    } catch (error) {
      console.error("Error deleting institution:", error)
      throw error
    }
  }
}
