import {useCallback, useEffect, useRef, useState} from "react";
import {uploadService} from "~/services/upload-service";
import {calculateFileHash, splitFileIntoChunks} from "~/lib/file-utils";
import type {ChunkInfo, UploadProgress} from "~/types/upload";

const CHUNK_SIZE = 1024 * 1024; // 1MB
const MAX_CONCURRENT_UPLOADS = 3;

type InitializeUploadResponse = {
    uploadId: string;
    alreadyCompleted?: boolean;
    existingChunks?: number[];
    fileUrl?: string;
};

export interface UseResumableUploadOptions {
    onUploadComplete?: (uploadId: string) => void;
}

export const useResumableUpload = (options: UseResumableUploadOptions = {}) => {
    const {onUploadComplete} = options;

    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState<UploadProgress>({
        percentage: 0,
        uploadedChunks: 0,
        totalChunks: 0,
        speed: 0,
        timeRemaining: 0,
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chunks, setChunks] = useState<ChunkInfo[]>([]);

    const fileRef = useRef<File | null>(null);
    const uploadIdRef = useRef<string | null>(null);
    const chunksRef = useRef<ChunkInfo[]>([]);
    const abortControllers = useRef<Map<number, AbortController>>(new Map());
    const uploadStartTime = useRef<number | null>(null);
    const uploadedBytes = useRef<number>(0);
    const speedInterval = useRef<NodeJS.Timeout | null>(null);

    // 计算上传速度
    const calculateSpeed = useCallback(() => {
        if (!uploadStartTime.current) return 0;
        const elapsed = (Date.now() - uploadStartTime.current) / 1000;
        return elapsed > 0 ? uploadedBytes.current / elapsed : 0;
    }, []);

    // 计算剩余时间
    const calculateTimeRemaining = useCallback((speed: number) => {
        if (speed === 0) return 0;
        if (!fileRef.current) return 0;
        const remainingBytes = fileRef.current.size - uploadedBytes.current;
        return remainingBytes / speed;
    }, []);

    // 确保 chunksRef/chunks 已初始化（即使是“已有 uploadId 继续上传”的情况也要有分片信息）
    const ensureChunksInitialized = useCallback(() => {
        if (!fileRef.current) throw new Error("No file selected");
        if (chunksRef.current.length > 0) return;

        const nextChunks = splitFileIntoChunks(fileRef.current, CHUNK_SIZE);
        chunksRef.current = nextChunks;
        setChunks(nextChunks);

        const totalChunks = Math.ceil(fileRef.current.size / CHUNK_SIZE);
        setProgress(prev => ({
            ...prev,
            totalChunks,
        }));
    }, []);

    // 初始化上传（返回后端完整响应：uploadId / alreadyCompleted / existingChunks）
    const initializeUpload = useCallback(async (): Promise<InitializeUploadResponse> => {
        if (!fileRef.current) throw new Error("No file selected");

        const fileHash = await calculateFileHash(fileRef.current);

        return (await uploadService.initializeUpload({
            fileName: fileRef.current.name,
            fileSize: fileRef.current.size,
            fileHash,
            chunkSize: CHUNK_SIZE,
        })) as InitializeUploadResponse;
    }, []);

    // 上传单个分片
    const uploadChunk = useCallback(
        async (chunkIndex: number, chunk: Blob, id: string) => {
            const controller = new AbortController();
            abortControllers.current.set(chunkIndex, controller);

            try {
                await uploadService.uploadChunk({
                    chunk,
                    chunkIndex,
                    uploadId: id,
                    totalChunks: Math.ceil(fileRef.current!.size / CHUNK_SIZE),
                    signal: controller.signal,
                });

                // 更新上传状态
                uploadedBytes.current += chunk.size;
                setProgress(prev => ({
                    ...prev,
                    uploadedChunks: prev.uploadedChunks + 1,
                    percentage: Math.round(((prev.uploadedChunks + 1) / prev.totalChunks) * 100),
                    speed: calculateSpeed(),
                    timeRemaining: calculateTimeRemaining(calculateSpeed()),
                }));

                // 更新分片状态
                setChunks(prev =>
                    prev.map(c => (c.index === chunkIndex ? {...c, uploaded: true} : c)),
                );
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    throw error;
                }
                console.error(`Failed to upload chunk ${chunkIndex}:`, error);
                throw error;
            } finally {
                abortControllers.current.delete(chunkIndex);
            }
        },
        [calculateSpeed, calculateTimeRemaining],
    );

    // 开始/继续上传
    const startUpload = useCallback(async () => {
        if (!fileRef.current || isUploading) return;

        try {
            setIsUploading(true);
            setIsPaused(false);
            setError(null);

            // 必须先有分片信息（否则“续传”时 chunksRef 为空会直接上传 0 个分片）
            ensureChunksInitialized();

            uploadStartTime.current = Date.now();
            uploadedBytes.current = 0;

            // 设置速度计算间隔
            speedInterval.current = setInterval(() => {
                setProgress(prev => ({
                    ...prev,
                    speed: calculateSpeed(),
                    timeRemaining: calculateTimeRemaining(calculateSpeed()),
                }));
            }, 1000);

            // 获取或创建上传ID
            let currentUploadId = uploadIdRef.current;
            let initResp: InitializeUploadResponse | null = null;

            if (!currentUploadId) {
                initResp = await initializeUpload();
                currentUploadId = initResp.uploadId;

                uploadIdRef.current = currentUploadId;
                setUploadId(currentUploadId);
            }

            // 秒传命中：直接完成（不再上传 chunk / 不再 merge）
            if (initResp?.alreadyCompleted) {
                // UI 置为完成
                uploadedBytes.current = fileRef.current.size;

                setChunks(prev => prev.map(c => ({...c, uploaded: true})));
                setProgress(prev => ({
                    ...prev,
                    uploadedChunks: prev.totalChunks || Math.ceil(fileRef.current!.size / CHUNK_SIZE),
                    totalChunks: prev.totalChunks || Math.ceil(fileRef.current!.size / CHUNK_SIZE),
                    percentage: 100,
                    speed: 0,
                    timeRemaining: 0,
                }));

                if (onUploadComplete) onUploadComplete(currentUploadId!);
                return; // 必须 return，防止继续 /chunk
            }

            // 断点续传：如果 initialize 返回了 existingChunks，优先用它；否则再请求 /status
            let uploadedChunkIndexes: number[];

            if (initResp?.existingChunks && initResp.existingChunks.length > 0) {
                uploadedChunkIndexes = initResp.existingChunks;
            } else {
                const status = await uploadService.getUploadStatus(currentUploadId!);
                uploadedChunkIndexes = status.uploadedChunks || [];
            }

            const uploadedChunksSet = new Set<number>(uploadedChunkIndexes);

            // 修正 chunks 的 uploaded 状态（用于 UI）
            setChunks(prev =>
                prev.map(c => (uploadedChunksSet.has(c.index) ? {...c, uploaded: true} : c)),
            );

            // 计算已上传字节（更准确的速度/剩余时间）
            const totalChunks = Math.ceil(fileRef.current.size / CHUNK_SIZE);
            let alreadyUploadedBytes = 0;
            for (const idx of uploadedChunksSet) {
                const info = chunksRef.current[idx];
                if (info) alreadyUploadedBytes += info.end - info.start;
            }
            uploadedBytes.current = alreadyUploadedBytes;

            // 初始化进度
            setProgress(prev => ({
                ...prev,
                uploadedChunks: uploadedChunksSet.size,
                totalChunks,
                percentage: totalChunks > 0 ? Math.round((uploadedChunksSet.size / totalChunks) * 100) : 0,
            }));

            // 上传未完成的分片
            const chunksToUpload = chunksRef.current
                .filter(chunk => !uploadedChunksSet.has(chunk.index))
                .map(chunk => ({
                    index: chunk.index,
                    blob: fileRef.current!.slice(chunk.start, chunk.end),
                }));

            // 并行上传分片
            const uploadPromises: Promise<void>[] = [];
            const activeUploads = new Set<number>();

            for (let i = 0; i < chunksToUpload.length; i++) {
                const {index, blob} = chunksToUpload[i];

                // 等待有空闲的上传槽位
                while (activeUploads.size >= MAX_CONCURRENT_UPLOADS && !isPaused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (isPaused) break;

                activeUploads.add(index);
                const promise = uploadChunk(index, blob, currentUploadId!).finally(() => {
                    activeUploads.delete(index);
                });

                uploadPromises.push(promise);

                // 限制并发数量
                if (uploadPromises.length >= MAX_CONCURRENT_UPLOADS) {
                    await Promise.race(uploadPromises);
                }
            }

            // 等待所有上传完成
            await Promise.all(uploadPromises);

            // 是否全部上传完成
            const uploadedCountFinal = uploadedChunksSet.size + chunksToUpload.length;
            if (!isPaused && uploadedCountFinal === totalChunks) {
                // 合并分片
                await uploadService.mergeChunks({
                    uploadId: currentUploadId!,
                    fileName: fileRef.current.name,
                });

                // UI 置 100%
                uploadedBytes.current = fileRef.current.size;
                setProgress(prev => ({
                    ...prev,
                    uploadedChunks: totalChunks,
                    totalChunks,
                    percentage: 100,
                    speed: 0,
                    timeRemaining: 0,
                }));

                // 调用完成回调
                if (onUploadComplete) onUploadComplete(currentUploadId!);
            }
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                setError(error.message || "Upload failed");
                console.error("Upload error:", error);
            }
        } finally {
            setIsUploading(false);
            if (speedInterval.current) {
                clearInterval(speedInterval.current);
                speedInterval.current = null;
            }
        }
    }, [isUploading, isPaused, ensureChunksInitialized, calculateSpeed, calculateTimeRemaining, initializeUpload, uploadChunk, onUploadComplete]);

    // 暂停上传
    const pauseUpload = useCallback(() => {
        setIsPaused(true);
        abortControllers.current.forEach(controller => controller.abort());
        abortControllers.current.clear();
    }, []);

    // 继续上传
    const resumeUpload = useCallback(() => {
        if (isPaused) {
            startUpload();
        }
    }, [isPaused, startUpload]);

    // 取消上传
    const cancelUpload = useCallback(async () => {
        pauseUpload();
        if (uploadIdRef.current) {
            await uploadService.cancelUpload(uploadIdRef.current);
        }
        resetUpload();
    }, [pauseUpload]);

    // 重置上传状态
    const resetUpload = useCallback(() => {
        setFile(null);
        setProgress({
            percentage: 0,
            uploadedChunks: 0,
            totalChunks: 0,
            speed: 0,
            timeRemaining: 0,
        });
        setUploadId(null);
        setError(null);
        setChunks([]);

        fileRef.current = null;
        uploadIdRef.current = null;
        chunksRef.current = [];
        uploadedBytes.current = 0;
        uploadStartTime.current = null;

        if (speedInterval.current) {
            clearInterval(speedInterval.current);
            speedInterval.current = null;
        }

        abortControllers.current.forEach(controller => controller.abort());
        abortControllers.current.clear();
    }, []);

    // 选择文件
    const handleFileSelect = useCallback(
        (selectedFile: File) => {
            resetUpload();
            setFile(selectedFile);
            fileRef.current = selectedFile;

            const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
            setProgress(prev => ({
                ...prev,
                totalChunks,
            }));

            // 选择文件即初始化分片（更直观：UI 立刻能显示 chunk 总数）
            const nextChunks = splitFileIntoChunks(selectedFile, CHUNK_SIZE);
            chunksRef.current = nextChunks;
            setChunks(nextChunks);
        },
        [resetUpload],
    );

    // 清理函数
    useEffect(() => {
        return () => {
            if (speedInterval.current) clearInterval(speedInterval.current);
            abortControllers.current.forEach(controller => controller.abort());
        };
    }, []);

    return {
        file,
        progress,
        isUploading,
        isPaused,
        uploadId,
        error,
        chunks,
        handleFileSelect,
        startUpload,
        pauseUpload,
        resumeUpload,
        cancelUpload,
        resetUpload,
    };
};
