import type {Exam} from "~/types/exam";
import type {UnsignedInt32} from "~/types/uint32";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const ExamService = {
    async getExams() {
        const response = await fetch(`${API_BASE_URL}/exam/list`);
        return response.json();
    },

    async getLatestExams(id: string) {
        const response = await fetch(`${API_BASE_URL}/exam/list?targetClass=${id}`);
        return response.json();
    },

    async getExam(id: UnsignedInt32): Promise<Exam> {
        const response = await fetch(`${API_BASE_URL}/exam/${id.getValue()}`);
        return response.json();
    },
};