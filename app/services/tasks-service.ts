import type {ActiveExam, ExamTask} from "~/types/tasks";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const TasksService = {
    async getActiveExams(): Promise<ActiveExam[]> {
        const response = await fetch(`${API_BASE_URL}/exams`);
        if (!response.ok) {
            throw new Error("Failed to fetch active exams");
        }
        return response.json();
    },

    async getExamTasks(examId: number): Promise<ExamTask[]> {
        const response = await fetch(`${API_BASE_URL}/exam/${examId}/tasks`);
        if (!response.ok) {
            throw new Error(`Failed to fetch tasks for exam ${examId}`);
        }
        return response.json();
    }
}