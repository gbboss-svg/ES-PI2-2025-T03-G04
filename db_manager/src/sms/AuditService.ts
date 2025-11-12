import { query } from "../database"

interface AuditLogEntry {
  userId?: number
  username?: string
  actionType: string
  entityType: string
  entityId?: number
  details?: string
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  // Registrar log de auditoria
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const sql = `
                INSERT INTO audit_log (
                    user_id, username, action_type, entity_type, 
                    entity_id, details, ip_address, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `

      await query(sql, [
        entry.userId || null,
        entry.username || null,
        entry.actionType,
        entry.entityType,
        entry.entityId || null,
        entry.details || null,
        entry.ipAddress || null,
        entry.userAgent || null,
      ])
    } catch (error) {
      console.error("Erro ao registrar auditoria:", error)
    }
  }

  // Buscar logs de auditoria com filtros
  static async getLogs(filters: {
    userId?: number
    actionType?: string
    entityType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<any[]> {
    let sql = "SELECT * FROM audit_log WHERE 1=1"
    const params: any[] = []

    if (filters.userId) {
      sql += " AND user_id = ?"
      params.push(filters.userId)
    }

    if (filters.actionType) {
      sql += " AND action_type = ?"
      params.push(filters.actionType)
    }

    if (filters.entityType) {
      sql += " AND entity_type = ?"
      params.push(filters.entityType)
    }

    if (filters.startDate) {
      sql += " AND created_at >= ?"
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      sql += " AND created_at <= ?"
      params.push(filters.endDate)
    }

    sql += " ORDER BY created_at DESC"

    if (filters.limit) {
      sql += " LIMIT ?"
      params.push(filters.limit)
    }

    return await query(sql, params)
  }

  // Buscar logs por usuário
  static async getLogsByUser(userId: number, limit = 100): Promise<any[]> {
    return await this.getLogs({ userId, limit })
  }

  // Buscar logs por tipo de entidade
  static async getLogsByEntity(entityType: string, entityId?: number, limit = 100): Promise<any[]> {
    const filters: any = { entityType, limit }
    if (entityId) {
      const sql = `
                SELECT * FROM audit_log 
                WHERE entity_type = ? AND entity_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            `
      return await query(sql, [entityType, entityId, limit])
    }
    return await this.getLogs(filters)
  }
}
