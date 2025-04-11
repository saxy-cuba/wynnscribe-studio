import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarSeparator,
} from "~/components/ui/sidebar";
import {useTranslation} from "react-i18next";
import {FiHome, FiMoreVertical} from "react-icons/fi";
import {useAuth} from "~/contexts/AuthContext";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import Projects from "~/studio/sidebar/projects";
import {useNavigate} from "react-router";
import {FaHouse} from "react-icons/fa6";

export default function AppSidebar() {
    const {user} = useAuth()
    const navigate = useNavigate()
    const {t} = useTranslation()
    return (
        <Sidebar variant="inset">
            <SidebarHeader className="h-16">
                <div className="flex justify-center items-center p-0 flex-row">
                    <div onClick={()=>{ navigate("/") }} className="flex justify items-end p-0 flex-row cursor-pointer select-none" >
                        <img src="/public/favicon.ico" className="h-13" />
                        <div className="anton-sc-regular text-3xl">
                            WS<span className="text-primary">/</span>Studio
                        </div>
                    </div>
                </div>
                <SidebarSeparator />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="flex flex-col gap-1.5">
                    <SidebarGroupContent>
                        <Projects />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <div className="flex flex-row justify-between w-full items-center">
                                <div className="flex flex-row gap-2">
                                    <Avatar>
                                        <AvatarImage src={user?.photoURL??""} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-sm leading-tight">
                                        <span className="font-semibold" translate="no">{user?.displayName}</span>
                                        <span className="text-xs text-muted-foreground" translate="no">{user?.email}</span>
                                    </div>
                                </div>
                                <FiMoreVertical />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}