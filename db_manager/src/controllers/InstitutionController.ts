





import { Request, Response } from "express"
import { InstitutionService } from "../services/InstitutionService"

const institutionService = new InstitutionService()

export class InstitutionController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id 
      const institutions = await institutionService.getAllInstitutions(userId)
      res.json(institutions)
    } catch (error) {
      res.status(500).json({ error: "Error fetching institutions" })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const institution = await institutionService.getInstitutionById(Number.parseInt(id), userId)

      if (!institution) {
        return res.status(404).json({ error: "Institution not found" })
      }

      res.json(institution)
    } catch (error) {
      res.status(500).json({ error: "Error fetching institution" })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const institution = await institutionService.createInstitution(req.body, userId)
      res.status(201).json(institution)
    } catch (error) {
      res.status(500).json({ error: "Error creating institution" })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const institution = await institutionService.updateInstitution(Number.parseInt(id), req.body, userId)

      if (!institution) {
        return res.status(404).json({ error: "Institution not found" })
      }

      res.json(institution)
    } catch (error) {
      res.status(500).json({ error: "Error updating institution" })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      await institutionService.deleteInstitution(Number.parseInt(id), userId)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: "Error deleting institution" })
    }
  }
}