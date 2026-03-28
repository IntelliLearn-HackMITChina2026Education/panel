export interface ActiveExam {
    id: number;
    name: string;
    status: "processing" | "pending";
}

export interface ExamTask {
    name: string;
    desc: string;
    status: "processing" | "pending" | "completed" | "failed";
}