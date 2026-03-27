import type {Exam, Student} from "~/types/exam";
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

    async searchStudents(keyword: string): Promise<Student[]> {
        if (!keyword) return [];

        const res = await fetch(`/api/students/search?keyword=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error("搜索失败");
        return await res.json();
    },

    async fetchStudentsByIds(ids: number[]): Promise<Student[]> {
        if (!ids.length) return [];

        const res = await fetch("/api/students/batch", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ids}),
        });
        if (!res.ok) throw new Error("批量获取失败");
        return await res.json();
    }
};