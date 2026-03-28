import type {UnsignedInt32} from "~/types/uint32";

export interface Exam {
    id: number;
    name: string;
    subject: string;
    classes: string[];
    paper: string;
    grade: string;
}

export interface Student {
    id: number;
    name: string;
    className: string;
}

export interface Group {
    id: number;
    name: string;
    students: number[];
}

export interface KnowledgePoint {
    name: string;
    mastery: number;
    weakCount: number;
}

export interface StudentAnalysis {
    id: number;
    name: string;
    score: number;
    trend: "up" | "down" | "stable";
}

export interface GroupAnalysis {
    id: number;
    name: string;
    studentCount: number;
    avgScore: number;
    scoreChange: number;
    weakKnowledgePoints: KnowledgePoint[];
    strengths: string[];
    suggestions: string[];
    members: StudentAnalysis[];
}

export interface ExamOption {
    id: string;
    name: string;
    subject: string;
    className: string;
    date: string;
}

export interface TrendPoint {
    exam: string;
    avgScore: number;
}

export interface GroupTrend {
    id: number;
    name: string;
    trend: TrendPoint[];
    currentAvg: number;
    change: number;
}
