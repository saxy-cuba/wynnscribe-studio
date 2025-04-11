import {Outlet} from "react-router";
import {SidebarInset, SidebarProvider} from "~/components/ui/sidebar";
import {apiClient} from "~/apiClient";
import AppSidebar from "~/studio/sidebar/app-sidebar";
import {LanguageProvider} from "~/contexts/LanguageContext";
import Header from "~/studio/header";
import {ProjectProvider} from "~/contexts/ProjectContext";
import {useAuth} from "~/contexts/AuthContext";
import {Separator} from "~/components/ui/separator";

export default function Layout() {
    const {user} = useAuth()
    if(user === undefined) {return}
    return (
        <ProjectProvider>
            <div className="h-full w-full">
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <LanguageProvider>
                            <div className="flex flex-col h-full">
                                <Header />
                                <div className="p-4 h-full w-full">
                                    <Outlet />
                                </div>
                            </div>
                        </LanguageProvider>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </ProjectProvider>
    )
}