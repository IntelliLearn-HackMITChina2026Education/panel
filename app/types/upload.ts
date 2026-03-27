export interface UploadFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: string;
    status: "pending" | "uploading" | "paused" | "completed" | "failed";
    progress: number;
}

export interface UploadProgress {
    percentage: number;
    uploadedChunks: number;
    totalChunks: number;
    speed: number;
    timeRemaining: number;
}

export interface UploadState {
    file: File | null;
    progress: UploadProgress;
    isUploading: boolean;
    isPaused: boolean;
    uploadId: string | null;
    error: string | null;
}

export interface ChunkInfo {
    index: number;
    start: number;
    end: number;
    size: number;
    uploaded: boolean;
    hash?: string;
}

export interface FileUploadMetadata {
    id: string;
    name: string;
    size: number;
    totalChunks: number;
    chunkSize: number;
    uploadedChunks: Set<number>;
    hash: string;
    createdAt: string;
    lastModified: string;
}