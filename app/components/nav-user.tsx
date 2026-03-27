import {Bell, ChevronsUpDown, LogOut} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "~/components/ui/sidebar";
import {useNavigate} from "react-router";
import type {User} from "~/types/auth";

export function NavUser({user}: { user: User }) {
    const {t} = useTranslation();
    const {isMobile} = useSidebar();
    const navigate = useNavigate();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name}/>
                                <AvatarFallback className="rounded-lg">IL</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Bell/>
                                {t('sidebar.notifications')}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <button className="w-full" onClick={() => navigate("/logout")}>
                            <DropdownMenuItem>
                                <LogOut/>
                                {t('sidebar.logout')}
                            </DropdownMenuItem>
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}