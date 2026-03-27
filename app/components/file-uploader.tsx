import React, {useCallback, useRef, useState} from "react";
import {useResumableUpload} from "~/hooks/use-resumable-upload";
import {Button} from "~/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "~/components/ui/card";
import {Badge} from "~/components/ui/badge";
import {Progress} from "~/components/ui/progress";
import {Alert, AlertDescription} from "~/components/ui/alert";
import {Separator} from "~/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "~/components/ui/tooltip";
import {AlertCircle, CheckCircle2, FileIcon, FileText, Pause, Play, RotateCcw, Upload, X,} from "lucide-react";
import {cn} from "~/lib/utils";
import {useTranslation} from "react-i18next";

// ─── 文件后缀限制配置 ───────────────────────────────────────────────────────────

export interface FileUploaderConfig {
    allowedExtensions?: string[];
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

function validateFile(file: File, config: FileUploaderConfig): string | null {
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
    title?: string;
    description?: string;
    lockAfterFinish?: boolean;
    disableChunkState?: boolean;
}

export function FileUploader({
                                 config = DEFAULT_CONFIG,
                                 onUploadComplete,
                                 title,
                                 description,
                                 lockAfterFinish = true,
                                 disableChunkState = true,
                             }: FileUploaderProps) {
    const {t} = useTranslation();
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
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {title ? title : t('file_uploader.title')}
                        </h2>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>

                    {/* Allowed types hint */}
                    {config.allowedExtensions && config.allowedExtensions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <FileText className="h-4 w-4"/>
                            <span
                                className="text-xs text-muted-foreground">{t('file_uploader.supported_formats')}</span>
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

                    {/* Drop Zone */}
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
                                <div
                                    className={cn(
                                        "rounded-full p-3 transition-colors",
                                        isDragging ? "bg-primary/10" : "bg-muted"
                                    )}
                                >
                                    <Upload
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            isDragging ? "text-primary" : "text-muted-foreground"
                                        )}
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        {isDragging ? t('file_uploader.drop_here') : t('file_uploader.drag_drop')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('file_uploader.click_to_select')}
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
                                    <div className="relative shrink-0">
                                        <div
                                            className={cn(
                                                "w-10 h-12 rounded flex items-center justify-center",
                                                isDone && lockAfterFinish ? "bg-emerald-500/10" : "bg-muted"
                                            )}
                                        >
                                            <FileIcon
                                                className={cn(
                                                    "w-5 h-5",
                                                    isDone && lockAfterFinish ? "text-emerald-600" : "text-muted-foreground"
                                                )}
                                            />
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

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-sm font-medium truncate leading-tight">
                                            {file.name.length > 5 ? file.name.substring(0, 5) + "..." : file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatBytes(file.size)}
                                            {chunks.length > 0 && (
                                                <span className="ml-2 font-mono">· {chunks.length} 个分片</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        {isDone && (
                                            <Badge
                                                className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">
                                                <CheckCircle2 className="w-3 h-3 mr-1"/>
                                                {t('file_uploader.complete')}
                                            </Badge>
                                        )}
                                        {isPaused && !isDone && (
                                            <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                                {t('file_uploader.paused')}
                                            </Badge>
                                        )}
                                        {isUploading && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-500/30">
                                                {t('file_uploader.uploading')}
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
                        <span
                            className={cn(
                                "font-medium",
                                isDone && lockAfterFinish ? "text-emerald-600" : "text-foreground"
                            )}
                        >
                          {progress.percentage}%
                        </span>
                                                {chunks.length > 0 && (
                                                    <span>
                            {completedChunks}/{chunks.length} chunks
                          </span>
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
                                                    <span
                                                        className="text-emerald-600">{t('file_uploader.upload_success')}</span>
                                                )}
                                            </div>
                                        </div>

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

                            <CardFooter className="gap-2">
                                {!isUploading && !isPaused && !isDone && (
                                    <Button className="flex-1" onClick={startUpload}>
                                        <Upload className="w-4 h-4 mr-2"/>
                                        {t('file_uploader.start')}
                                    </Button>
                                )}

                                {isUploading && !isPaused && (
                                    <Button variant="outline" className="flex-1" onClick={pauseUpload}>
                                        <Pause className="w-4 h-4 mr-2"/>
                                        {t('file_uploader.pause')}
                                    </Button>
                                )}

                                {isPaused && !isDone && (
                                    <Button className="flex-1" onClick={resumeUpload}>
                                        <Play className="w-4 h-4 mr-2"/>
                                        {t('file_uploader.resume')}
                                    </Button>
                                )}

                                {(isUploading || isPaused) && !isDone && (
                                    <Button variant="ghost" className="text-muted-foreground" onClick={cancelUpload}>
                                        <X className="w-4 h-4 mr-1.5"/>
                                        {t('file_uploader.cancel')}
                                    </Button>
                                )}

                                {isDone && (
                                    <Button
                                        variant={lockAfterFinish ? "ghost" : "outline"}
                                        className={cn("flex-1", lockAfterFinish && "text-muted-foreground text-xs")}
                                        onClick={resetUpload}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2"/>
                                        {t('file_uploader.reupload')}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )}

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