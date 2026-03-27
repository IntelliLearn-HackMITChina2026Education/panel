import React, {useCallback, useRef, useState} from "react";
import {useResumableUpload} from "~/hooks/use-resumable-upload";
import {Button} from "~/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "~/components/ui/card";
import {Badge} from "~/components/ui/badge";
import {Progress} from "~/components/ui/progress";
import {Alert, AlertDescription} from "~/components/ui/alert";
import {Separator} from "~/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {AlertCircle, CheckCircle2, FileIcon, FileText, Pause, Play, RotateCcw, Upload, X,} from "lucide-react";
import {cn} from "~/lib/utils";

// ─── 文件后缀限制配置 ───────────────────────────────────────────────────────────

export interface FileUploaderConfig {
    /** 允许的文件后缀，小写，不带点。为空则不限制。
     * @example ["pdf", "mp4", "zip", "png", "jpg"]
     */
    allowedExtensions?: string[];
    /** 最大文件大小（字节）。为 0 则不限制。
     * @example 1024 * 1024 * 500  // 500MB
     */
    maxFileSize?: number;
}

const DEFAULT_CONFIG: FileUploaderConfig = {
    allowedExtensions: [],
    maxFileSize: 0,
};

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return "--";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function getExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function validateFile(
    file: File,
    config: FileUploaderConfig
): string | null {
    const {allowedExtensions, maxFileSize} = config;

    if (allowedExtensions && allowedExtensions.length > 0) {
        const ext = getExtension(file.name);
        if (!allowedExtensions.includes(ext)) {
            return `不支持的文件类型 .${ext}，仅允许：${allowedExtensions.map((e) => `.${e}`).join("、")}`;
        }
    }

    if (maxFileSize && maxFileSize > 0 && file.size > maxFileSize) {
        return `文件过大（${formatBytes(file.size)}），最大允许 ${formatBytes(maxFileSize)}`;
    }

    return null;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface FileUploaderProps {
    config?: FileUploaderConfig;
    onUploadComplete?: (uploadId: string) => void;
    title?: string,
    description?: string;
    lockAfterFinish?: boolean;
    disableChunkState?: boolean
}

export function FileUploader({
                                 config = DEFAULT_CONFIG,
                                 onUploadComplete,
                                 title,
                                 description,
                                 lockAfterFinish = true,
                                 disableChunkState = true
                             }: FileUploaderProps) {
    const {
        file,
        progress,
        isUploading,
        isPaused,
        error,
        chunks,
        handleFileSelect,
        startUpload,
        pauseUpload,
        resumeUpload,
        cancelUpload,
        resetUpload,
    } = useResumableUpload({onUploadComplete});

    const [validationError, setValidationError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectFile = useCallback(
        (selected: File) => {
            const err = validateFile(selected, config);
            if (err) {
                setValidationError(err);
                return;
            }
            setValidationError(null);
            handleFileSelect(selected);
        },
        [config, handleFileSelect]
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) selectFile(dropped);
        },
        [selectFile]
    );

    const ext = file ? getExtension(file.name) : "";
    const completedChunks = chunks.filter((c) => c.uploaded).length;
    const isDone = progress.percentage === 100 && !isUploading;
    const displayError = error || validationError;

    // accept attribute for input
    const acceptAttr =
        config.allowedExtensions && config.allowedExtensions.length > 0
            ? config.allowedExtensions.map((e) => `.${e}`).join(",")
            : undefined;

    return (
        <TooltipProvider>
            <div className="w-full max-h-screen bg-background flex justify-center p-6">
                <div className="w-full max-w-lg space-y-4">

                    {/* Title */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">{title ? title : "文件上传"}</h2>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {/* Allowed types hint */}
                    {config.allowedExtensions && config.allowedExtensions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <FileText className="h-4 w-4"/>
                            <span className="text-xs text-muted-foreground">支持格式：</span>
                            {config.allowedExtensions.map((ext) => (
                                <Badge key={ext} variant="secondary" className="text-xs font-mono">
                                    .{ext}
                                </Badge>
                            ))}
                            {config.maxFileSize && config.maxFileSize > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                  · 最大 {formatBytes(config.maxFileSize)}
                </span>
                            )}
                        </div>
                    )}

                    {/* Drop Zone — 未选文件时，或完成后未锁定时显示 */}
                    {!file && (
                        <Card
                            className={cn(
                                "border-2 border-dashed cursor-pointer transition-colors duration-150",
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
                            )}
                            onDrop={onDrop}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => inputRef.current?.click()}
                        >
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-14">
                                <div className={cn(
                                    "rounded-full p-3 transition-colors",
                                    isDragging ? "bg-primary/10" : "bg-muted"
                                )}>
                                    <Upload className={cn(
                                        "w-6 h-6 transition-colors",
                                        isDragging ? "text-primary" : "text-muted-foreground"
                                    )}/>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        {isDragging ? "松开即可上传" : "拖拽文件到此处"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        或点击选择文件
                                    </p>
                                </div>
                            </CardContent>
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept={acceptAttr}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) selectFile(f);
                                    e.target.value = "";
                                }}
                            />
                        </Card>
                    )}

                    {/* File Card */}
                    {file && (
                        <Card className={cn(isDone && lockAfterFinish && "border-emerald-500/30")}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    {/* File icon with ext badge */}
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-10 h-12 rounded flex items-center justify-center",
                                            isDone && lockAfterFinish ? "bg-emerald-500/10" : "bg-muted"
                                        )}>
                                            <FileIcon className={cn(
                                                "w-5 h-5",
                                                isDone && lockAfterFinish ? "text-emerald-600" : "text-muted-foreground"
                                            )}/>
                                        </div>
                                        {ext && (
                                            <Badge
                                                variant="secondary"
                                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] px-1 py-0 font-mono leading-4"
                                            >
                                                {ext}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* File name + size */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-sm font-medium truncate leading-tight">
                                            {file.name.length > 5 ? file.name.substring(0, 5) + "..." : file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatBytes(file.size)}
                                            {chunks.length > 0 && (
                                                <span className="ml-2 font-mono">
                          · {chunks.length} 个分片
                        </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <div className="shrink-0">
                                        {isDone && (
                                            <Badge
                                                className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">
                                                <CheckCircle2 className="w-3 h-3 mr-1"/>
                                                完成
                                            </Badge>
                                        )}
                                        {isPaused && !isDone && (
                                            <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                                已暂停
                                            </Badge>
                                        )}
                                        {isUploading && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-500/30">
                                                上传中
                                            </Badge>
                                        )}
                                        {!isUploading && !isPaused && !isDone && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground"
                                                onClick={resetUpload}
                                            >
                                                <X className="w-4 h-4"/>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Progress section */}
                            {(isUploading || isDone || isPaused) && (
                                <>
                                    <Separator/>
                                    <CardContent className="pt-4 pb-3 space-y-3">
                                        <Progress
                                            value={progress.percentage}
                                            className={cn(
                                                "h-1.5",
                                                isDone && lockAfterFinish && "[&>div]:bg-emerald-500"
                                            )}
                                        />

                                        <div
                                            className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-3 font-mono">
                                                <span className={cn("font-medium",
                                                    isDone && lockAfterFinish ? "text-emerald-600" : "text-foreground"
                                                )}>
                                                    {progress.percentage}%
                                                </span>
                                                {chunks.length > 0 && (
                                                    <span>{completedChunks}/{chunks.length} chunks</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 font-mono">
                                                {progress.speed > 0 && !isDone && (
                                                    <span>{formatBytes(progress.speed)}/s</span>
                                                )}
                                                {progress.timeRemaining > 0 && !isDone && (
                                                    <span>剩余 {formatTime(progress.timeRemaining)}</span>
                                                )}
                                                {isDone && lockAfterFinish && (
                                                    <span className="text-emerald-600">上传成功</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chunk grid */}
                                        {!disableChunkState && chunks.length > 0 && chunks.length <= 160 && (
                                            <div className="flex flex-wrap gap-0.5 pt-1">
                                                {chunks.map((chunk) => (
                                                    <Tooltip key={chunk.index}>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={cn(
                                                                    "w-2.5 h-2.5 rounded-sm transition-all duration-200",
                                                                    chunk.uploaded
                                                                        ? isDone && lockAfterFinish
                                                                            ? "bg-emerald-500"
                                                                            : "bg-primary"
                                                                        : "bg-muted"
                                                                )}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            Chunk {chunk.index}
                                                            {chunk.uploaded ? " ✓" : ""}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </>
                            )}

                            {!disableChunkState && <Separator/>}

                            {/* Actions */}
                            <CardFooter className="gap-2">
                                {/* Start */}
                                {!isUploading && !isPaused && !isDone && (
                                    <Button className="flex-1" onClick={startUpload}>
                                        <Upload className="w-4 h-4 mr-2"/>
                                        开始上传
                                    </Button>
                                )}

                                {/* Pause */}
                                {isUploading && !isPaused && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={pauseUpload}
                                    >
                                        <Pause className="w-4 h-4 mr-2"/>
                                        暂停
                                    </Button>
                                )}

                                {/* Resume */}
                                {isPaused && !isDone && (
                                    <Button className="flex-1" onClick={resumeUpload}>
                                        <Play className="w-4 h-4 mr-2"/>
                                        继续上传
                                    </Button>
                                )}

                                {/* Cancel */}
                                {(isUploading || isPaused) && !isDone && (
                                    <Button
                                        variant="ghost"
                                        className="text-muted-foreground"
                                        onClick={cancelUpload}
                                    >
                                        <X className="w-4 h-4 mr-1.5"/>
                                        取消
                                    </Button>
                                )}

                                {/* Done — lockAfterFinish 时显示"重新上传"，否则原逻辑 */}
                                {isDone && (
                                    <Button
                                        variant={lockAfterFinish ? "ghost" : "outline"}
                                        className={cn(
                                            "flex-1",
                                            lockAfterFinish && "text-muted-foreground text-xs"
                                        )}
                                        onClick={resetUpload}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2"/>
                                        重新上传
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )}

                    {/* Error */}
                    {displayError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{displayError}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}