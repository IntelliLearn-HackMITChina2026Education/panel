import {redirect, useSearchParams} from "react-router";
import {useTranslation} from "react-i18next";
import {AppSidebar} from "~/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {ExamService} from "~/services/exam-service";
import type {Route} from "../../.react-router/types/app/routes/+types/_protected.exam.($exam)._index";
import {UnsignedInt32} from "~/types/uint32";
import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useTheme} from "~/components/theme-provider";

/* ================= 数据 ================= */
const stats = {
    avg: 78.5,
    passRate: 82,
    excellentRate: 18,
    max: 98,
    std: 12.3,
};

const scoreDistribution = [
    {range: "0-60", count: 8},
    {range: "60-70", count: 12},
    {range: "70-80", count: 20},
    {range: "80-90", count: 25},
    {range: "90-100", count: 10},
];

const scorePie = [
    {name: "不及格", value: 8},
    {name: "及格", value: 37},
    {name: "优秀", value: 18},
];

const knowledgeWeak = [
    {name: "函数极限", value: 65},
    {name: "导数应用", value: 58},
    {name: "积分计算", value: 52},
    {name: "概率分布", value: 48},
    {name: "线性代数", value: 45},
];

/* ================= 图表主题 ================= */
const chartTheme = {
    light: {
        text: "#1f2937",
        axis: "#6b7280",
        grid: "#e5e7eb",
        tooltipBg: "#ffffff",
        tooltipText: "#111827",
        bar: "#111827",
        pie: ["#3b82f6", "#10b981", "#f59e0b"],
    },
    dark: {
        text: "#e5e7eb",
        axis: "#9ca3af",
        grid: "#374151",
        tooltipBg: "#1f2937",
        tooltipText: "#f9fafb",
        bar: "#d1d5db",
        pie: ["#60a5fa", "#34d399", "#fbbf24"],
    },
};

/* ================= UI组件 ================= */
function StatCard({title, value, suffix = ""}: any) {
    return (
        <Card className="bg-background/60 backdrop-blur border-border">
            <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{title}</div>
                <div className="text-3xl font-semibold tracking-tight">
                    {value}
                    {suffix}
                </div>
            </CardContent>
        </Card>
    );
}

/* ================= Loader ================= */
export function clientLoader({params}: Route.ClientLoaderArgs) {
    const eid = params.exam;
    if (!eid) throw redirect("/dashboard");
    return ExamService.getExam(new UnsignedInt32(parseInt(eid)));
}

/* ================= 主组件 ================= */
export default function ExamDetail({loaderData}: Route.ComponentProps) {
    const exam = loaderData;
    const {t} = useTranslation();
    const theme = useTheme().effectiveTheme;
    const [colors, setColors] = useState<string[]>([]);
    const themeColors = theme === "dark" ? chartTheme.dark : chartTheme.light;
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("groupId");

    useEffect(() => {
        setColors(themeColors.pie);
    }, [theme]);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {/* ===== Header ===== */}
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">{exam.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{t('exam.overview')}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="space-y-6 p-6">
                    {/* ===== KPI ===== */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard title={t('exam.avg_score')} value={stats.avg}/>
                        <StatCard title={t('exam.pass_rate')} value={stats.passRate} suffix="%"/>
                        <StatCard title={t('exam.excellent_rate')} value={stats.excellentRate} suffix="%"/>
                        <StatCard title={t('exam.max_score')} value={stats.max}/>
                        <StatCard title={t('exam.std_dev')} value={stats.std}/>
                    </div>

                    {/* ===== 图表 ===== */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* 分数分布 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('exam.score_distribution')}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer>
                                    <BarChart data={scoreDistribution}>
                                        <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3"/>
                                        <XAxis dataKey="range" stroke={themeColors.axis}
                                               tick={{fill: themeColors.text}}/>
                                        <YAxis stroke={themeColors.axis} tick={{fill: themeColors.text}}/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: themeColors.tooltipBg,
                                                border: "none",
                                                borderRadius: "8px",
                                            }}
                                            labelStyle={{color: themeColors.tooltipText}}
                                            itemStyle={{color: themeColors.tooltipText}}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={themeColors.bar}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* 成绩占比 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('exam.score_ratio')}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={scorePie} dataKey="value" nameKey="name" outerRadius={100} label>
                                            {scorePie.map((_, i) => (
                                                <Cell key={i} fill={colors[i]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: themeColors.tooltipBg,
                                                border: "none",
                                                borderRadius: "8px",
                                            }}
                                            itemStyle={{color: themeColors.tooltipText}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ===== 知识点 ===== */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* 弱点 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('exam.weak_knowledge')}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer>
                                    <BarChart data={knowledgeWeak} layout="vertical">
                                        <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3"/>
                                        <XAxis type="number" stroke={themeColors.axis} tick={{fill: themeColors.text}}/>
                                        <YAxis dataKey="name" type="category" stroke={themeColors.axis}
                                               tick={{fill: themeColors.text}} width={80}/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: themeColors.tooltipBg,
                                                border: "none",
                                                borderRadius: "8px",
                                            }}
                                            itemStyle={{color: themeColors.tooltipText}}
                                        />
                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={themeColors.bar}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* AI分析 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('exam.ai_analysis')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-6">
                                {t('exam.ai_analysis_text')}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}