"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {Activity, Bot, FileText, School} from "lucide-react";
import {useTranslation} from "react-i18next";

import {NavMain} from "~/components/nav-main";
import {NavProjects} from "~/components/nav-projects";
import {NavUser} from "~/components/nav-user";
import {TeamSwitcher} from "~/components/team-switcher";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "~/components/ui/sidebar";
import {useAuth} from "~/contexts/AuthContext";
import {ExamService} from "~/services/exam-service";
import type {Exam} from "~/types/exam";

export type TClass = {
    name: string;
    id: string;
    logo: React.ElementType;
};

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
            title: "paper_processing",
            url: "#",
            icon: Activity,
            isActive: true,
            items: [
                {title: "new_exam", url: "/new_exam"},
                {title: "processing", url: "/processing"},
            ],
        },
        {
            title: "study_groups",
            url: "#",
            icon: Bot,
            isActive: true,
            items: [
                {title: "group_manage", url: "/groups/manage"},
                {title: "group_trend", url: "/groups/trend"},
                {title: "group_analysis", url: "/groups/analysis"},
            ],
        },
    ],
};

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {t} = useTranslation();
    const {user} = useAuth();
    const [exams, setExams] = useState<{ name: string; url: string; icon: any }[]>([]);
    const [targetClass, setTargetClass] = useState<string | null>(
        localStorage.getItem("selectedClassId") || user?.classes[0]!!
    );

    useEffect(() => {
        const fetchExams = async () => {
            if (!user || !targetClass) {
                setExams([]);
                return;
            }

            try {
                const latestExams: Exam[] = await ExamService.getLatestExams(targetClass);
                const formattedExams = latestExams.map((exam) => ({
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
        const found = data.classes.find((tclass) => tclass.id === targetClass);
        return found || null;
    };

    const handleClassChange = (tclass: TClass) => {
        setTargetClass(tclass.id);
        localStorage.setItem("selectedClassId", tclass.id);
    };

    // 本地化 navMain 的标题
    const localizedNavMain = data.navMain.map((item) => ({
        ...item,
        title: t(`sidebar.${item.title}`),
        items: item.items.map((sub) => ({
            ...sub,
            title: t(`sidebar.${sub.title}`),
        })),
    }));

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {targetClass && (
                    <TeamSwitcher
                        classes={data.classes}
                        selectedClass={getTClassObject()}
                        onClassChange={handleClassChange}
                    />
                )}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={localizedNavMain}/>
                {user && <NavProjects projects={exams}/>}
            </SidebarContent>
            <SidebarFooter>
                {user && <NavUser user={user}/>}
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}