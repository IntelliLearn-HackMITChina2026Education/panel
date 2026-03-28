import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import ProcessingItem from "~/components/item-processing";
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
import type {Route} from "../../.react-router/types/app/routes/+types/_protected.processing";
import {ExamService} from "~/services/exam-service";
import {UnsignedInt32} from "~/types/uint32";
import {TasksService} from "~/services/tasks-service";
import type {ActiveExam, ExamTask} from "~/types/tasks";

export function clientLoader({request}: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    if (!from) {
        return null;
    }
    return ExamService.getExam(new UnsignedInt32(parseInt(from)));
}

export default function Processing({loaderData}: Route.ComponentProps) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get("from");
    const exam = loaderData;

    const [activeExams, setActiveExams] = useState<ActiveExam[]>([]);
    const [examTasks, setExamTasks] = useState<ExamTask[]>([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // 获取所有活跃的考试
    useEffect(() => {
        TasksService.getActiveExams()
            .then(setActiveExams)
            .catch(console.error)
            .finally(() => setLoadingExams(false));
    }, []);

    // 当选中某个考试时，获取其任务列表
    useEffect(() => {
        if (from) {
            const examId = parseInt(from);
            setLoadingTasks(true);
            TasksService.getExamTasks(examId)
                .then(setExamTasks)
                .catch(console.error)
                .finally(() => setLoadingTasks(false));
        } else {
            setExamTasks([]);
        }
    }, [from]);

    // 当某个考试的所有任务都完成（status 不是 processing/pending）时，自动跳转
    useEffect(() => {
        if (examTasks.length > 0 && from && !loadingTasks) {
            const allFinished = examTasks.every(task => task.status === "completed" || task.status === "failed");
            if (allFinished) {
                navigate(`/exam/${from}`);
            }
        }
    }, [examTasks, from, navigate, loadingTasks]);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbLink href="/processing">{t('processing.title')}</BreadcrumbLink>
                                <BreadcrumbItem className="hidden md:block">
                                    {exam != null && <BreadcrumbSeparator/>}
                                </BreadcrumbItem>
                                <BreadcrumbItem className="hidden md:block">
                                    {exam != null && `${exam.name}`}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="container mx-auto py-8">
                        {exam == null ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('processing.all_processing')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingExams ? (
                                        <p>加载中...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeExams.map((it) => (
                                                <ProcessingItem
                                                    key={it.id}
                                                    name={it.name}
                                                    link={`/processing?from=${it.id}`}
                                                    stat={it.status}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>
                                        {exam.name} {t('processing.progress_title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingTasks ? (
                                        <p>加载中...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {examTasks.map((it, idx) => (
                                                <ProcessingItem
                                                    key={idx}
                                                    name={it.name}
                                                    desc={it.desc}
                                                    stat={it.status}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}