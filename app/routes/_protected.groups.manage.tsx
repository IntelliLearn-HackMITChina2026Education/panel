import {useNavigate, useSearchParams} from "react-router";
import {useEffect, useState} from "react";

import {AppSidebar} from "~/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "~/components/ui/breadcrumb";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "~/components/ui/dialog";

import type {Route} from "../../.react-router/types/app/routes/+types/_protected.groups.manage";
import {ExamService} from "~/services/exam-service";
import type {Group, Student} from "~/types/exam";

export function clientLoader({request}: Route.ClientLoaderArgs) {
    return [
        {id: 1, name: "第一组", students: [101, 102]},
        {id: 2, name: "第二组", students: [103]}
    ] as Group[];
}

export default function GroupsManage({loaderData}: Route.ComponentProps) {
    const navigate = useNavigate();
    const groups = loaderData;

    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("groupId");

    const [groupState, setGroupState] = useState<Group[]>(groups);
    const [studentMap, setStudentMap] = useState<Map<string, Student>>(new Map());

    const currentGroup = groupState.find((g) => String(g.id) === groupId);

    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<Student[]>([]);

    // 搜索学生
    useEffect(() => {
        const timer = setTimeout(() => {
            ExamService.searchStudents(keyword).then(setResults);
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    // 批量获取学生
    useEffect(() => {
        if (!currentGroup?.students?.length) return;

        ExamService.fetchStudentsByIds(currentGroup.students).then((data) => {
            const map = new Map<string, Student>();
            data.forEach((s) => map.set(s.id.toString(), s));
            setStudentMap(map);
        });
    }, [currentGroup]);

    const handleAdd = (student: Student) => {
        if (!currentGroup) return;

        // 防重复
        if (currentGroup.students?.includes(student.id)) return;

        setGroupState((prev) =>
            prev.map((g) =>
                String(g.id) === groupId
                    ? {...g, students: [...(g.students || []), student.id]}
                    : g
            )
        );

        setOpen(false);
        setKeyword("");
        setResults([]);
    };

    const handleRemove = (id: number) => {
        if (!currentGroup) return;

        setGroupState((prev) =>
            prev.map((g) =>
                String(g.id) === groupId
                    ? {...g, students: g.students.filter((s) => s !== id)}
                    : g
            )
        );
    };

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>学习小组</BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbLink href="/groups/manage">人员管理</BreadcrumbLink>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-1 p-4">
                    <div className="grid grid-cols-12 gap-6 w-full">
                        {/* 小组列表 */}
                        <div className="col-span-3 border rounded-xl p-4">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold mb-4">学习小组</h2>
                                <button className="px-4 py-2 bg-black text-white rounded-lg">
                                    + 添加小组
                                </button>
                            </div>
                            {groupState.map((g) => (
                                <div
                                    key={g.id}
                                    onClick={() => navigate(`/groups/manage?groupId=${g.id}`)}
                                    className={`cursor-pointer px-3 py-2 rounded-lg ${
                                        String(g.id) === groupId ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                >
                                    {g.name}
                                </div>
                            ))}
                        </div>

                        {/* 成员管理 */}
                        <div className="col-span-9 border rounded-xl p-4">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold">成员管理</h2>

                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <button className="px-4 py-2 bg-black text-white rounded-lg">
                                            + 添加成员
                                        </button>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>添加成员</DialogTitle>
                                        </DialogHeader>

                                        <input
                                            placeholder="搜索姓名"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />

                                        <div className="max-h-40 overflow-y-auto border rounded-lg mt-2">
                                            {results.map((stu) => (
                                                <div
                                                    key={stu.id}
                                                    onClick={() => handleAdd(stu)}
                                                    className="px-3 py-2 hover:bg-muted cursor-pointer flex justify-between"
                                                >
                                                    <span>{stu.name}</span>
                                                    <span className="text-muted-foreground">{stu.id}</span>
                                                </div>
                                            ))}

                                            {!results.length && keyword && (
                                                <div className="text-center text-muted-foreground py-3">
                                                    无结果
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* 成员表格 */}
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b">
                                    <th className="py-2">姓名</th>
                                    <th className="py-2">操作</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentGroup?.students?.map((id) => {
                                    const student = studentMap.get(id.toString());
                                    return (
                                        <tr key={id} className="border-b text-center">
                                            <td className="py-2">{student?.name || "加载中..."}</td>
                                            <td className="py-2">
                                                <button
                                                    onClick={() => handleRemove(id)}
                                                    className="text-destructive hover:underline"
                                                >
                                                    移除
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>

                            {!currentGroup?.students?.length && (
                                <div
                                    className="text-center text-muted-foreground py-10">
                                    {currentGroup !== void (0) ? "暂无成员" : "请在左侧选择一个组别"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
