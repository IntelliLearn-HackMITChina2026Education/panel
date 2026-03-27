import * as React from "react";
import {useMemo, useState} from "react";
import {AppSidebar} from "~/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger,} from "~/components/ui/sidebar";
import {Separator} from "~/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "~/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "~/components/ui/select";
import {Badge} from "~/components/ui/badge";
import {Progress} from "~/components/ui/progress";
import {Button} from "~/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "~/components/ui/table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {ScrollArea} from "~/components/ui/scroll-area";
import {Sparkles, Users} from "lucide-react";
import type {Route} from "../../.react-router/types/app/routes/+types/_protected.groups.analysis";
import type {ExamOption, GroupAnalysis, GroupAnalysisLoaderData} from "~/types/exam";

export function clientLoader({request}: Route.ClientLoaderArgs): GroupAnalysisLoaderData {
    const url = new URL(request.url);
    const selectedExamId = url.searchParams.get("examId") ?? "exam-2026-03";

    const exams: ExamOption[] = [
        {
            id: "exam-2026-03",
            name: "2026年3月月考",
            subject: "数学",
            className: "高一（1）班",
            date: "2026-03-20",
        },
        {
            id: "exam-2026-02",
            name: "2026年2月阶段测验",
            subject: "数学",
            className: "高一（1）班",
            date: "2026-02-18",
        },
        {
            id: "exam-2026-01",
            name: "2026年1月期初检测",
            subject: "数学",
            className: "高一（1）班",
            date: "2026-01-10",
        },
    ];

    const groups: GroupAnalysis[] = [
        {
            id: 1,
            name: "启航组",
            studentCount: 6,
            avgScore: 84,
            scoreChange: 6,
            weakKnowledgePoints: [
                {name: "函数单调性", mastery: 58, weakCount: 4},
                {name: "二次函数综合", mastery: 62, weakCount: 3},
                {name: "集合运算", mastery: 73, weakCount: 2},
            ],
            strengths: ["基础计算较稳定", "选择题正确率较高"],
            suggestions: [
                "优先复习函数单调性的判定条件与常见题型。",
                "安排1名基础较强学生带领组内进行二次函数错题复盘。",
                "本周建议完成1次限时训练，重点控制中档题失分。",
            ],
            members: [
                {id: 1, name: "张三", score: 88, trend: "up"},
                {id: 2, name: "李四", score: 81, trend: "up"},
                {id: 3, name: "王五", score: 79, trend: "stable"},
                {id: 4, name: "赵六", score: 86, trend: "up"},
                {id: 5, name: "钱七", score: 83, trend: "down"},
                {id: 6, name: "孙八", score: 87, trend: "up"},
            ],
        },
        {
            id: 2,
            name: "卓越组",
            studentCount: 5,
            avgScore: 91,
            scoreChange: 3,
            weakKnowledgePoints: [
                {name: "压轴题拆解", mastery: 64, weakCount: 3},
                {name: "函数建模应用", mastery: 68, weakCount: 2},
                {name: "数形结合", mastery: 72, weakCount: 2},
            ],
            strengths: ["整体正确率高", "审题与表达能力较强"],
            suggestions: [
                "增加综合压轴题分步拆解训练，提升最后两题得分率。",
                "继续保持限时训练节奏，强化过程书写规范。",
            ],
            members: [
                {id: 7, name: "周九", score: 95, trend: "up"},
                {id: 8, name: "吴十", score: 90, trend: "stable"},
                {id: 9, name: "郑一", score: 89, trend: "up"},
                {id: 10, name: "冯二", score: 92, trend: "up"},
                {id: 11, name: "陈三", score: 89, trend: "down"},
            ],
        },
        {
            id: 3,
            name: "攻坚组",
            studentCount: 7,
            avgScore: 72,
            scoreChange: -2,
            weakKnowledgePoints: [
                {name: "基本概念辨析", mastery: 49, weakCount: 5},
                {name: "函数图像", mastery: 52, weakCount: 4},
                {name: "运算规范", mastery: 57, weakCount: 5},
            ],
            strengths: ["课堂参与度较高"],
            suggestions: [
                "先回到课本例题，分层巩固概念与基础运算。",
                "建议教师优先安排图像题专项讲解，降低理解门槛。",
                "每次训练后保留3道典型错题做二次订正。",
            ],
            members: [
                {id: 12, name: "许四", score: 75, trend: "stable"},
                {id: 13, name: "何五", score: 71, trend: "down"},
                {id: 14, name: "吕六", score: 69, trend: "down"},
                {id: 15, name: "施七", score: 76, trend: "up"},
                {id: 16, name: "孔八", score: 73, trend: "stable"},
                {id: 17, name: "曹九", score: 70, trend: "down"},
                {id: 18, name: "严十", score: 68, trend: "stable"},
            ],
        },
    ];

    return {
        exams,
        selectedExamId,
        groups,
    };
}

function TrendBadge({trend}: { trend: "up" | "down" | "stable" }) {
    const map = {
        up: {
            text: "上升",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
        },
        down: {
            text: "下降",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
        },
        stable: {
            text: "稳定",
            className:
                "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        },
    };

    const item = map[trend];
    return <Badge className={item.className}>{item.text}</Badge>;
}

export default function Analysis({loaderData}: Route.ComponentProps) {
    const {exams, selectedExamId, groups} = loaderData;
    const [currentExamId, setCurrentExamId] = useState(selectedExamId);
    const [activeGroupId, setActiveGroupId] = useState<string>(
        String(groups[0]?.id ?? "")
    );

    const selectedExam = useMemo(
        () => exams.find((exam) => exam.id === currentExamId) ?? exams[0],
        [currentExamId, exams]
    );

    const currentGroup = useMemo(
        () => groups.find((group) => String(group.id) === activeGroupId) ?? groups[0],
        [activeGroupId, groups]
    );

    const overview = useMemo(() => {
        const totalStudents = groups.reduce((sum, group) => sum + group.studentCount, 0);
        const avgScore = Math.round(
            groups.reduce((sum, group) => sum + group.avgScore, 0) / groups.length
        );
        const weakPointCount = groups.reduce(
            (sum, group) => sum + group.weakKnowledgePoints.length,
            0
        );
        const downGroups = groups.filter((group) => group.scoreChange < 0).length;

        return {
            totalStudents,
            avgScore,
            weakPointCount,
            downGroups,
        };
    }, [groups]);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>学习小组</BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbLink href="/groups/analysis">AI分析</BreadcrumbLink>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div
                        className="flex flex-col gap-4 rounded-2xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5"/>
                                <h1 className="text-2xl font-bold tracking-tight">学习小组 AI 分析</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                查看各学习小组在当前考试中的知识点掌握情况、成员表现与针对性建议。
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[320px]">
                            <label className="text-sm font-medium">选择考试</label>
                            <Select value={currentExamId} onValueChange={setCurrentExamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="请选择考试"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map((exam) => (
                                        <SelectItem key={exam.id} value={exam.id}>
                                            {exam.name} · {exam.subject} · {exam.className}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedExam ? (
                                <p className="text-xs text-muted-foreground">
                                    当前：{selectedExam.name} / {selectedExam.subject} /{" "}
                                    {selectedExam.className} / {selectedExam.date}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>覆盖学生数</CardDescription>
                                <CardTitle className="text-3xl">{overview.totalStudents}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>小组平均分</CardDescription>
                                <CardTitle className="text-3xl">{overview.avgScore}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>记录的薄弱知识点</CardDescription>
                                <CardTitle className="text-3xl">{overview.weakPointCount}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>成绩下滑小组</CardDescription>
                                <CardTitle className="text-3xl">{overview.downGroups}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Tabs value={activeGroupId} onValueChange={setActiveGroupId} className="w-full">
                        <div className="overflow-x-auto">
                            <TabsList className="h-auto min-h-11 w-max rounded-xl p-1">
                                {groups.map((group) => (
                                    <TabsTrigger
                                        key={group.id}
                                        value={String(group.id)}
                                        className="rounded-lg px-4 py-2"
                                    >
                                        {group.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {groups.map((group) => (
                            <TabsContent
                                key={group.id}
                                value={String(group.id)}
                                className="mt-6 space-y-6"
                            >
                                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5"/>
                                                {group.name} 小组概览
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-3">
                                            <div className="rounded-xl border p-4">
                                                <div className="text-sm text-muted-foreground">小组人数</div>
                                                <div className="mt-2 text-2xl font-bold">
                                                    {group.studentCount}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border p-4">
                                                <div className="text-sm text-muted-foreground">平均分</div>
                                                <div className="mt-2 text-2xl font-bold">{group.avgScore}</div>
                                            </div>
                                            <div className="rounded-xl border p-4">
                                                <div className="text-sm text-muted-foreground">相较上次</div>
                                                <div
                                                    className={`mt-2 text-2xl font-bold ${
                                                        group.scoreChange > 0
                                                            ? "text-emerald-600"
                                                            : group.scoreChange < 0
                                                                ? "text-red-600"
                                                                : ""
                                                    }`}
                                                >
                                                    {group.scoreChange > 0 ? "+" : ""}
                                                    {group.scoreChange}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>优势表现</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-2">
                                            {group.strengths.map((item) => (
                                                <Badge
                                                    key={item}
                                                    variant="secondary"
                                                    className="rounded-full px-3 py-1"
                                                >
                                                    {item}
                                                </Badge>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>薄弱知识点</CardTitle>
                                            <CardDescription>
                                                掌握度越低，越建议优先安排讲解与练习
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-5">
                                            {group.weakKnowledgePoints.map((point) => (
                                                <div key={point.name} className="space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <div className="font-medium">{point.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                薄弱学生数：{point.weakCount}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">掌握度 {point.mastery}%</Badge>
                                                    </div>
                                                    <Progress value={point.mastery}/>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>AI 学习建议</CardTitle>
                                            <CardDescription>
                                                根据小组知识点表现生成的针对性建议
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3 text-sm leading-6 text-foreground">
                                                {group.suggestions.map((item, index) => (
                                                    <li
                                                        key={item}
                                                        className="rounded-xl border bg-muted/30 p-3"
                                                    >
                                                        <span
                                                            className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                          {index + 1}
                                                        </span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="rounded-2xl">
                                    <CardHeader>
                                        <CardTitle>成员表现</CardTitle>
                                        <CardDescription>
                                            便于教师快速了解组内个体差异与变化趋势
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="w-full">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>学生</TableHead>
                                                        <TableHead>本次成绩</TableHead>
                                                        <TableHead>趋势</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.members.map((member) => (
                                                        <TableRow key={member.id}>
                                                            <TableCell className="font-medium">
                                                                {member.name}
                                                            </TableCell>
                                                            <TableCell>{member.score}</TableCell>
                                                            <TableCell>
                                                                <TrendBadge trend={member.trend}/>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <Card className="rounded-2xl">
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>小组横向对比</CardTitle>
                                <CardDescription>
                                    用于比较不同小组的平均分、变化情况与重点问题
                                </CardDescription>
                            </div>
                            <Button variant="outline">导出分析</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>小组</TableHead>
                                        <TableHead>人数</TableHead>
                                        <TableHead>平均分</TableHead>
                                        <TableHead>相较上次</TableHead>
                                        <TableHead>重点薄弱项</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.map((group) => (
                                        <TableRow key={group.id}>
                                            <TableCell className="font-medium">{group.name}</TableCell>
                                            <TableCell>{group.studentCount}</TableCell>
                                            <TableCell>{group.avgScore}</TableCell>
                                            <TableCell
                                                className={
                                                    group.scoreChange > 0
                                                        ? "text-emerald-600"
                                                        : group.scoreChange < 0
                                                            ? "text-red-600"
                                                            : ""
                                                }
                                            >
                                                {group.scoreChange > 0 ? "+" : ""}
                                                {group.scoreChange}
                                            </TableCell>
                                            <TableCell>
                                                {group.weakKnowledgePoints
                                                    .slice(0, 2)
                                                    .map((item) => item.name)
                                                    .join(" / ")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
