"use client";

import * as React from "react";
import {ChevronsUpDown} from "lucide-react";
import {useTranslation} from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "~/components/ui/sidebar";
import type {TClass} from "~/components/app-sidebar";

interface TeamSwitcherProps {
    classes: TClass[];
    selectedClass: TClass | null;
    onClassChange: (tclass: TClass) => void;
}

export function TeamSwitcher({classes, selectedClass, onClassChange}: TeamSwitcherProps) {
    const {t} = useTranslation();
    const {isMobile} = useSidebar();

    if (!selectedClass) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div
                                className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <selectedClass.logo className="size-4"/>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{selectedClass.name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            {t('sidebar.switch_class')}
                        </DropdownMenuLabel>
                        {classes.map((team, index) => (
                            <DropdownMenuItem
                                key={team.name}
                                onClick={() => onClassChange(team)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <team.logo className="size-3.5 shrink-0"/>
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}