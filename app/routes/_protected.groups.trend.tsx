import * as React from "react";
import {useState} from "react";
import {useNavigate} from "react-router";
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
import type {Route} from "../../.react-router/types/app/routes/+types/_protected.groups.trend";
import type {GroupTrend, GroupTrendLoaderData} from "~/types/exam";

export function clientLoader({request}: Route.ClientLoaderArgs): GroupTrendLoaderData {
    const exams = ["1月考试", "2月考试", "3月考试"];

    const groups: GroupTrend[] = [
        {
            id: 1,
            name: "启航组",
            currentAvg: 84,
            change: +6,
            trend: [
                {exam: "1月考试", avgScore: 72},
                {exam: "2月考试", avgScore: 78},
                {exam: "3月考试", avgScore: 84},
            ],
        },
        {
            id: 2,
            name: "卓越组",
            currentAvg: 91,
            change: +3,
            trend: [
                {exam: "1月考试", avgScore: 86},
                {exam: "2月考试", avgScore: 88},
                {exam: "3月考试", avgScore: 91},
            ],
        },
        {
            id: 3,
            name: "攻坚组",
            currentAvg: 72,
            change: -2,
            trend: [
                {exam: "1月考试", avgScore: 75},
                {exam: "2月考试", avgScore: 74},
                {exam: "3月考试", avgScore: 72},
            ],
        },
    ];

    return {exams, groups};
}

/* ================= 页面 ================= */

export default function GroupsTrend({loaderData}: Route.ComponentProps) {
    const navigate = useNavigate();
    const {exams, groups} = loaderData;

    const [selectedExam, setSelectedExam] = useState(exams[exams.length - 1]);

    const maxScore = 100;

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {/* header */}
                <header className="flex h-16 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger/>
                        <Separator orientation="vertical" className="h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>学习小组</BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbLink href="/groups/trend">
                                    趋势
                                </BreadcrumbLink>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* content */}
                <div className="flex flex-1 flex-col gap-6 p-6">
                    {/* 顶部 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">小组成绩趋势</h1>
                            <p className="text-sm text-muted-foreground">
                                查看不同小组成绩变化情况
                            </p>
                        </div>

                        <Select value={selectedExam} onValueChange={setSelectedExam}>
                            <SelectTrigger className="w-50">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>小组对比</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="flex items-center justify-between border rounded-lg p-3"
                                    >
                                        <div className="font-medium">{group.name}</div>

                                        <div className="flex items-center gap-4">
                                            <span>平均分：{group.currentAvg}</span>
                                            <span
                                                className={
                                                    group.change > 0
                                                        ? "text-emerald-600"
                                                        : "text-red-600"
                                                }
                                            >
                        {group.change > 0 ? "↑" : "↓"} {group.change}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Separator/>

                    <div className="grid gap-4 md:grid-cols-3">
                        {groups.map((group) => (
                            <Card key={group.id} className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {group.name}
                                        <Badge
                                            variant="outline"
                                            className={
                                                group.change > 0
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }
                                        >
                                            {group.change > 0 ? "+" : ""}
                                            {group.change}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        当前平均分：{group.currentAvg}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {group.trend.map((item) => (
                                        <div key={item.exam} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.exam}</span>
                                                <span>{item.avgScore}</span>
                                            </div>
                                            <Progress
                                                value={(item.avgScore / maxScore) * 100}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
