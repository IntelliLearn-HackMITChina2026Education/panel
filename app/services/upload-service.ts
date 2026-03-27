import type {FileUploadMetadata} from "~/types/upload";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export type InitializeUploadResponse = {
    uploadId: string;
    alreadyCompleted?: boolean;
    fileUrl?: string | null;
    existingChunks?: number[];
};

export type UploadStatusResponse = {
    uploadId: string;
    fileName: string;
    fileSize: number;
    totalChunks: number;
    uploadedChunks: number[];
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    fileUrl?: string | null;
};

export const uploadService = {
    async initializeUpload(fileInfo: {
        fileName: string;
        fileSize: number;
        fileHash: string;
        chunkSize: number;
    }): Promise<InitializeUploadResponse> {
        const response = await fetch(`${API_BASE_URL}/uploads/initialize`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(fileInfo),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`Failed to initialize upload: ${response.status} ${text}`);
        }
        return response.json();
    },

    async getUploadStatus(uploadId: string): Promise<UploadStatusResponse> {
        const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/status`);
        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`Failed to get upload status: ${response.status} ${text}`);
        }
        return response.json();
    },

    async uploadChunk({
                          chunk,
                          chunkIndex,
                          uploadId,
                          totalChunks,
                          signal,
                      }: {
        chunk: Blob;
        chunkIndex: number;
        uploadId: string;
        totalChunks: number;
        signal?: AbortSignal;
    }) {
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", chunkIndex.toString());
        formData.append("uploadId", uploadId);
        formData.append("totalChunks", totalChunks.toString());

        const response = await fetch(`${API_BASE_URL}/uploads/chunk`, {
            method: "POST",
            body: formData,
            signal,
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(
                `Failed to upload chunk ${chunkIndex}: ${response.status} ${text}`
            );
        }
        return response.json();
    },

    async mergeChunks({
                          uploadId,
                          fileName,
                      }: {
        uploadId: string;
        fileName?: string; // 兼容旧后端/旧路由
    }) {
        const response = await fetch(`${API_BASE_URL}/uploads/merge`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({uploadId, fileName}),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`Failed to merge chunks: ${response.status} ${text}`);
        }
        return response.json();
    },

    async cancelUpload(uploadId: string) {
        const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/cancel`, {
            method: "POST",
        });
        return response.ok;
    },

    async getUploadedFiles(): Promise<FileUploadMetadata[]> {
        // ✅ 不再返回模拟数据，直接请求后端
        const response = await fetch(`${API_BASE_URL}/uploads/files`);
        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`Failed to get uploaded files: ${response.status} ${text}`);
        }
        return response.json();
    },
};
