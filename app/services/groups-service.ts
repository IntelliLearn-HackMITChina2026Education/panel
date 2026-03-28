import type {ExamOption, Group, GroupAnalysis, GroupTrend, Student} from "~/types/exam";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const GroupsService = {
    async getGroups(): Promise<Group[]> {
        const res = await fetch(`${API_BASE_URL}/groups`);
        return res.json();
    },

    async getGroup(groupId: number): Promise<Group> {
        const res = await fetch(`${API_BASE_URL}/groups/${groupId}`);
        return res.json();
    },

    async getGroupAnalysis(groupId: number, examId: string): Promise<GroupAnalysis> {
        const res = await fetch(`${API_BASE_URL}/groups/${groupId}/analysis?examId=${examId}`);
        return res.json();
    },

    async getGroupTrend(groupId: number): Promise<GroupTrend> {
        const res = await fetch(`${API_BASE_URL}/groups/${groupId}/trend`);
        return res.json();
    },

    async searchStudents(keyword: string): Promise<Student[]> {
        const res = await fetch(`${API_BASE_URL}/students/search?keyword=${encodeURIComponent(keyword)}`);
        return res.json();
    },

    async fetchStudentsByIds(ids: number[]): Promise<Student[]> {
        const res = await fetch(`${API_BASE_URL}/students/batch`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(ids),
        });
        return res.json();
    },

    async addMember(groupId: number, studentId: number): Promise<void> {
        await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({studentId}),
        });
    },

    async removeMember(groupId: number, studentId: number): Promise<void> {
        await fetch(`${API_BASE_URL}/groups/${groupId}/members/${studentId}`, {
            method: "DELETE",
        });
    },

    async getExams(): Promise<ExamOption[]> {
        const res = await fetch(`${API_BASE_URL}/exam/list`);
        return res.json();
    },
};