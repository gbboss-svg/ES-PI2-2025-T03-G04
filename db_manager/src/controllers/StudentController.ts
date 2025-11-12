





import { Request, Response } from "express"
import studentService from "../services/StudentService"

export class StudentController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const students = await studentService.getAllStudents(userId)
      res.json(students)
    } catch (error) {
      res.status(500).json({ error: "Error fetching students" })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const student = await studentService.getStudentById(Number.parseInt(id), userId)

      if (!student) {
        return res.status(404).json({ error: "Student not found" })
      }

      res.json(student)
    } catch (error) {
      res.status(500).json({ error: "Error fetching student" })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const student = await studentService.createStudent(req.body, userId)
      res.status(201).json(student)
    } catch (error) {
      res.status(500).json({ error: "Error creating student" })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const student = await studentService.updateStudent(Number.parseInt(id), req.body, userId)

      if (!student) {
        return res.status(404).json({ error: "Student not found" })
      }

      res.json(student)
    } catch (error) {
      res.status(500).json({ error: "Error updating student" })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      await studentService.deleteStudent(Number.parseInt(id), userId)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: "Error deleting student" })
    }
  }

  async getByTurma(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { turmaId } = req.params
      const students = await studentService.getStudentsByTurma(Number.parseInt(turmaId), userId)
      res.json(students)
    } catch (error) {
      res.status(500).json({ error: "Error fetching students" })
    }
  }
}
const studentController = new StudentController();