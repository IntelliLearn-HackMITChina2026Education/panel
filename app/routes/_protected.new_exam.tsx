import React, {useEffect, useState} from "react";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {FileUploader} from "~/components/file-uploader";
import {Upload} from "lucide-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Field, FieldError, FieldLabel} from "~/components/ui/field";
import {useNavigate} from "react-router";
import {AppSidebar} from "~/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {Separator} from "~/components/ui/separator";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList} from "~/components/ui/breadcrumb";

const subjects: { name: string; value: string; }[] = [
    {name: "语文", value: "Chinese"},
    {name: "数学", value: "Math"},
    {name: "英语", value: "English"},
    {name: "物理", value: "Physics"},
    {name: "化学", value: "Chemistry"},
    {name: "生物", value: "Biology"},
    {name: "历史", value: "History"},
    {name: "政治", value: "Politics"},
    {name: "地理", value: "Geography"},
];

export default function NewExam() {
    const [examName, setExamName] = useState("");
    const [subject, setSubject] = useState("");
    const [examPaper, setExamPaper] = useState<string | null>(null);
    const [gradeSheet, setGradeSheet] = useState<string | null>(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    const navigate = useNavigate();
    const [targetClass, setTargetClass] = useState<string | null>(null);

    useEffect(() => {
        setTargetClass(localStorage.getItem("selectedClassId"));
    }, []);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const response = await fetch(`${API_BASE_URL}/exam/new`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({examName, subject, examPaper, gradeSheet, targetClass}),
        });
        console.log(JSON.stringify({examName, subject, examPaper, gradeSheet, targetClass}));

        if (!response.ok) throw new Error("Failed to initialize exam");
        navigate(`/processing?from=${await response.json()}`, {replace: true});
    };

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    新考试
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="container mx-auto py-8 max-w-2xl">
                        <Card>
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-bold">创建新考试</CardTitle>
                                <CardDescription>
                                    填写以下信息以创建新的考试记录
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Field className="space-y-4">
                                        <Field data-invaild={!examName} className="space-y-2">
                                            <FieldLabel htmlFor="examName">考试名称</FieldLabel>
                                            <Input
                                                id="examName"
                                                type="text"
                                                placeholder="例如：2026 年期中考试"
                                                value={examName}
                                                onChange={(e) => setExamName(e.target.value)}
                                                className="w-full"
                                                aria-invalid={!examName}
                                            />
                                            {!examName ? <FieldError>请输入考试名称</FieldError> : null}
                                        </Field>
                                        <Field data-invaild={!subject} className="space-y-2">
                                            <FieldLabel htmlFor="subject">科目</FieldLabel>
                                            <Select onValueChange={(e) => setSubject(e)}>
                                                <SelectTrigger className="w-full" aria-invalid={!subject}>
                                                    <SelectValue placeholder="选择科目"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {subjects.map(subject => (
                                                            <SelectItem key={subject.value} value={subject.value}>
                                                                {subject.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {!subject ? <FieldError>请选择一个科目</FieldError> : null}
                                        </Field>
                                    </Field>

                                    <div className="space-y-4 max-h-1/2">
                                        <div className="flex border rounded-lg p-4">
                                            <FileUploader
                                                config={{
                                                    allowedExtensions: ["pdf", "docx"],
                                                }}
                                                title="试卷"
                                                description=""
                                                onUploadComplete={(id: string) => setExamPaper(id)}
                                            />
                                            <FileUploader
                                                config={{
                                                    allowedExtensions: ["xls", "xlsx"],
                                                }}
                                                title="成绩单"
                                                description=""
                                                onUploadComplete={(id: string) => setGradeSheet(id)}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" size="lg"
                                            disabled={!examName || !subject || !examPaper || !gradeSheet}>
                                        <Upload className="h-4 w-4 mr-2"/>
                                        创建考试
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
