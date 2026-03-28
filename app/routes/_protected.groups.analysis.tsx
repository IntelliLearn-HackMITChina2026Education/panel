import * as React from "react";
import {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {AppSidebar} from "~/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
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
import {GroupsService} from "~/services/groups-service";

export async function clientLoader({request}: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const exams = await GroupsService.getExams();
    const selectedExamId = url.searchParams.get("examId") ?? (exams.length > 0 ? exams[exams.length - 1].id : "1");
    const groups = await GroupsService.getGroups();
    const groupsWithAnalysis = await Promise.all(
        groups.map(async (group) => {
            const analysis = await GroupsService.getGroupAnalysis(group.id, selectedExamId);
            return {...group, ...analysis};
        })
    );
    return {exams, selectedExamId, groups: groupsWithAnalysis};
}

function TrendBadge({trend}: { trend: "up" | "down" | "stable" }) {
    const {t} = useTranslation();
    const map = {
        up: {
            text: t('groups.analysis.trend_up'),
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
        },
        down: {
            text: t('groups.analysis.trend_down'),
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
        },
        stable: {
            text: t('groups.analysis.trend_stable'),
            className:
                "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        },
    };

    const item = map[trend];
    return <Badge className={item.className}>{item.text}</Badge>;
}

export default function Analysis({loaderData}: Route.ComponentProps) {
    const {t} = useTranslation();
    const {exams, selectedExamId, groups} = loaderData;
    const [currentExamId, setCurrentExamId] = useState(selectedExamId);
    const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? 1);

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
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>{t('sidebar.study_groups')}</BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbLink href="/groups/analysis">{t('sidebar.group_analysis')}</BreadcrumbLink>
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
                                <h1 className="text-2xl font-bold tracking-tight">{t('groups.analysis.title')}</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">{t('groups.analysis.description')}</p>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[320px]">
                            <label className="text-sm font-medium">{t('groups.analysis.select_exam')}</label>
                            <Select value={currentExamId} onValueChange={setCurrentExamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('groups.analysis.select_exam_placeholder')}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map((exam) => (
                                        <SelectItem key={exam.id} value={exam.id}>
                                            {exam.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>{t('groups.analysis.student_count')}</CardDescription>
                                <CardTitle className="text-3xl">{overview.totalStudents}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>{t('groups.analysis.group_avg')}</CardDescription>
                                <CardTitle className="text-3xl">{overview.avgScore}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>{t('groups.analysis.weak_points')}</CardDescription>
                                <CardTitle className="text-3xl">{overview.weakPointCount}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription>{t('groups.analysis.down_groups')}</CardDescription>
                                <CardTitle className="text-3xl">{overview.downGroups}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Tabs value={String(activeGroupId)} onValueChange={v => setActiveGroupId(Number(v))} className="w-full">
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
                            <TabsContent key={group.id} value={String(group.id)} className="mt-6 space-y-6">
                                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5"/>
                                                {t('groups.analysis.group_overview')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-3">
                                            <div className="rounded-xl border p-4">
                                                <div
                                                    className="text-sm text-muted-foreground">{t('groups.analysis.group_members')}</div>
                                                <div className="mt-2 text-2xl font-bold">{group.studentCount}</div>
                                            </div>
                                            <div className="rounded-xl border p-4">
                                                <div
                                                    className="text-sm text-muted-foreground">{t('groups.analysis.avg_score')}</div>
                                                <div className="mt-2 text-2xl font-bold">{group.avgScore}</div>
                                            </div>
                                            <div className="rounded-xl border p-4">
                                                <div
                                                    className="text-sm text-muted-foreground">{t('groups.analysis.score_change')}</div>
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
                                            <CardTitle>{t('groups.analysis.strengths')}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-2">
                                            {group.strengths.map((item) => (
                                                <Badge key={item} variant="secondary"
                                                       className="rounded-full px-3 py-1">
                                                    {item}
                                                </Badge>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>{t('groups.analysis.weak_knowledge')}</CardTitle>
                                            <CardDescription>{t('groups.analysis.weak_desc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-5">
                                            {group.weakKnowledgePoints.map((point) => (
                                                <div key={point.name} className="space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <div className="font-medium">{point.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {t('groups.analysis.weak_student_count', {count: point.weakCount})}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {t('groups.analysis.mastery', {value: point.mastery*100})}
                                                        </Badge>
                                                    </div>
                                                    <Progress value={point.mastery*100}/>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>{t('groups.analysis.ai_suggestions')}</CardTitle>
                                            <CardDescription>{t('groups.analysis.ai_suggestions_desc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3 text-sm leading-6 text-foreground">
                                                {group.suggestions.map((item, index) => (
                                                    <li key={item} className="rounded-xl border bg-muted/30 p-3">
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
                                        <CardTitle>{t('groups.analysis.member_performance')}</CardTitle>
                                        <CardDescription>{t('groups.analysis.member_performance_desc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="w-full">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>{t('groups.analysis.student')}</TableHead>
                                                        <TableHead>{t('groups.analysis.score')}</TableHead>
                                                        <TableHead>{t('groups.analysis.trend')}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.members.map((member) => (
                                                        <TableRow key={member.id}>
                                                            <TableCell className="font-medium">{member.name}</TableCell>
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
                                <CardTitle>{t('groups.analysis.group_comparison')}</CardTitle>
                                <CardDescription>{t('groups.analysis.group_comparison_desc')}</CardDescription>
                            </div>
                            <Button variant="outline">{t('groups.analysis.export')}</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('groups.analysis.group')}</TableHead>
                                        <TableHead>{t('groups.analysis.student_count_short')}</TableHead>
                                        <TableHead>{t('groups.analysis.avg_score_short')}</TableHead>
                                        <TableHead>{t('groups.analysis.score_change_short')}</TableHead>
                                        <TableHead>{t('groups.analysis.weak_items')}</TableHead>
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
                                                {group.weakKnowledgePoints.slice(0, 2)
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