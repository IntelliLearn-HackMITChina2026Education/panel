import { Bell, ChevronsUpDown, Globe, LogOut, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "~/components/ui/sidebar";
import { useNavigate } from "react-router";
import type { User } from "~/types/auth";

// 语言选项配置
const languageOptions = [
    {
        code: "zh_CN",
        nativeLabel: "简体中文",
    },
    {
        code: "zh_TW",
        nativeLabel: "繁體中文",
    },
    {
        code: "en_GB",
        nativeLabel: "English (UK)",
    },
    {
        code: "en_US",
        nativeLabel: "English (US)",
    },
];

export function NavUser({ user }: { user: User }) {
    const { t, i18n } = useTranslation();
    const { isMobile } = useSidebar();
    const navigate = useNavigate();

    const currentLanguage = i18n.language;

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

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
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">IL</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">IL</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Bell />
                                {t('sidebar.notifications')}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />

                        {/* 语言子菜单 */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Globe className="mr-2 h-4 w-4" />
                                <span>{t('sidebar.language')}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {languageOptions.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className="cursor-pointer"
                                    >
                                        <span className="flex-1">{lang.nativeLabel}</span>
                                        {currentLanguage === lang.code && (
                                            <Check className="ml-2 h-4 w-4" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <button className="w-full" onClick={() => navigate("/logout")}>
                            <DropdownMenuItem>
                                <LogOut />
                                {t('sidebar.logout')}
                            </DropdownMenuItem>
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}