"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {Activity, Bot, FileText, School,} from "lucide-react";

import {NavMain} from "~/components/nav-main";
import {NavProjects} from "~/components/nav-projects";
import {NavUser} from "~/components/nav-user";
import {TeamSwitcher} from "~/components/team-switcher";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "~/components/ui/sidebar";
import {useAuth} from "~/contexts/AuthContext";
import {ExamService} from "~/services/exam-service";
import type {Exam} from "~/types/exam";

export type TClass = {
    name: string
    id: string
    logo: React.ElementType
}

export const data = {
    classes: [
        {
            name: "高二（7）班",
            id: "s2c7",
            logo: School,
        },
    ] as TClass[],
    navMain: [
        {
            title: "试卷处理",
            url: "#",
            icon: Activity,
            isActive: true,
            items: [
                {
                    title: "新考试",
                    url: "/new_exam",
                },
                {
                    title: "正在处理",
                    url: "/processing",
                },
            ],
        },
        {
            title: "学习小组",
            url: "#",
            icon: Bot,
            isActive: true,
            items: [
                {
                    title: "人员管理",
                    url: "/groups/manage",
                },
                {
                    title: "趋势",
                    url: "/groups/trend",
                },
                {
                    title: "AI分析",
                    url: "/groups/analysis",
                },
            ],
        },
    ],
};

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {

    const {user} = useAuth();
    const [exams, setExams] = useState<{ name: string; url: string; icon: any }[]>([]);
    const [targetClass, setTargetClass] = useState<string | null>(localStorage.getItem("selectedClassId") || user?.classes[0]!!);

    useEffect(() => {
        const fetchExams = async () => {
            if (!user || !targetClass) {
                setExams([]);
                return;
            }

            try {
                const latestExams: Exam[] = await ExamService.getLatestExams(targetClass);

                const formattedExams = latestExams.map(exam => ({
                    name: exam.name || `考试 ${exam.id}`,
                    url: `/exam/${exam.id}`,
                    icon: FileText,
                }));

                setExams(formattedExams);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
                setExams([]);
            }
        };

        fetchExams();
    }, [user, targetClass]);

    const getTClassObject = () => {
        const found = data.classes.find(tclass => tclass.id === targetClass);
        if (found) return found;
        return null;
    };

    const handleClassChange = (tclass: TClass) => {
        setTargetClass(tclass.id);
        localStorage.setItem("selectedClassId", tclass.id);
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {targetClass && <TeamSwitcher
                    classes={data.classes}
                    selectedClass={getTClassObject()}
                    onClassChange={handleClassChange}
                />}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                {user && <NavProjects projects={exams}/>}
            </SidebarContent>
            <SidebarFooter>
                {user && <NavUser user={user}/>}
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
