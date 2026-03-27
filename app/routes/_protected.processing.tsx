import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
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
    BreadcrumbSeparator
} from "~/components/ui/breadcrumb";
import type {Route} from "../../.react-router/types/app/routes/+types/_protected.processing";
import {ExamService} from "~/services/exam-service";
import {UnsignedInt32} from "~/types/uint32";

export function clientLoader({request}: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    if (!from) {
        return null;
    }

    return ExamService.getExam(new UnsignedInt32(parseInt(from)));
}

export default function Processing({loaderData}: Route.ComponentProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get("from");
    const exam = loaderData;

    const [processing, setProcessing] = useState<{
        name: string,
        desc: string,
        status: "processing" | "pending"
    }[]>([
        {name: "test", desc: "test", status: "processing"},
        {name: "test", desc: "test", status: "pending"}
    ]);

    const [processingExam, setProcessingExam] = useState<{
        name: string,
        id: number,
        status: "processing" | "pending"
    }[]>([
        {name: "test", id: 14, status: "processing"},
        {name: "test", id: 17, status: "pending"}
    ]);

    useEffect(() => {
        if (processing.length === 0 && from) {
            navigate(`/exam/${from}`);
        }
    }, [processing, from, navigate]);

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
                                <BreadcrumbLink href="/processing">
                                    正在处理
                                </BreadcrumbLink>
                                <BreadcrumbItem className="hidden md:block">
                                    {exam != null ? <BreadcrumbSeparator/> : null}
                                </BreadcrumbItem>
                                <BreadcrumbItem className="hidden md:block">
                                    {exam != null ? `${exam.name}` : ""}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="container mx-auto py-8">
                        {exam == null ?
                            <Card>
                                <CardHeader>
                                    <CardTitle>所有正在处理的考试</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {processingExam.map(it =>
                                            <ProcessingItem key={it.name} name={it.name}
                                                            link={`/processing?from=${it.id}`}
                                                            stat={it.status}/>
                                        )}
                                    </div>
                                </CardContent>
                            </Card> : <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>{exam.name}处理进度</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {processing.map(it =>
                                            <ProcessingItem key={it.name} name={it.name}
                                                            desc={it.desc}
                                                            stat={it.status}/>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
