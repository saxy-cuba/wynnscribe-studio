import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub
} from "~/components/ui/sidebar"
import { useAuth } from "~/contexts/AuthContext"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import {FiAlignLeft, FiChevronRight, FiFolder, FiSearch} from "react-icons/fi"
import { useEffect, useState } from "react"
import { useLoaderData, useNavigate } from "react-router"
import type {components} from "~/lib/api/v1";
import {type Project, type ProjectMap, type TreeEntry, useProjects} from "~/contexts/ProjectContext";
import {cn} from "~/lib/utils";
import AddProjectButton from "~/studio/sidebar/add-project-button";
import {useTranslation} from "react-i18next";
import {FaRegFile, FaRegFileLines, FaRegFolder} from "react-icons/fa6";

export default function Projects() {
    const { projectTree, selectedProjectId, projects, setSelectedProjectId } = useProjects();
    const [openFolders, setOpenFolders_] = useState<Set<string>>(new Set());
    const navigate = useNavigate()
    const {isAdmin} = useAuth()
    const {t} = useTranslation()
    const pathname = window.location.pathname
    const project = projects.find((project) => project.id == selectedProjectId)
    const [filter, setFilter] = useState<string>("")

    useEffect(() => {
        setOpenFolders_(new Set(JSON.parse(sessionStorage.getItem("openFolders") ?? "[]")))
    }, [])

    function setOpenFolders(newOpenFolders: Set<string>) {
        sessionStorage.setItem("openFolders", JSON.stringify(Array.from(newOpenFolders)))
        setOpenFolders_(newOpenFolders)
    }

    function toggleFolder(path: string) {
        const newOpenFolders = new Set(openFolders);
        if (newOpenFolders.has(path)) {
            newOpenFolders.delete(path);
        } else {
            newOpenFolders.add(path);
        }
        setOpenFolders(newOpenFolders);
    }

    function ProjectTree({ projectTree, filter }: { projectTree: TreeEntry, filter: string }) {
        if (projectTree as Project && projectTree.name != undefined) {
            return (Tree({ path: "", name: "", tree: projectTree, filter: filter }))
        } else {
            const projectMap = projectTree as ProjectMap
            return (
                projectMap && Object.keys(projectMap)
                .sort((a, b) => {
                    const entryA = projectMap[a]
                    const entryB = projectMap[b]
                    const isAFile = typeof (entryA as Project)?.id === 'number';
                    const isBFile = typeof (entryB as Project)?.id === 'number';
                    if(!isAFile && isBFile) {
                        return -1 // a(dir)をb(file)より前に
                    } else if(isAFile && !isBFile) {
                        return 1 //a(file)をb(dir)より後に
                    } else {
                        return a.localeCompare(b) // 名前で並び替え
                    }
                })
                .map((key, index) => (
                    <Tree filter={filter} path="" key={index} name={key} tree={projectMap[key]} />))
            )
        }
    }

    function Tree({ path, name, tree, filter }: { path: string, name: string, tree: TreeEntry, filter: string }) {
        if (tree as Project && tree.id != undefined && tree.id as number) {
            if(filter && filter.length > 0 && !(tree.name as string).toLowerCase().includes(filter.toLowerCase())) {
                return (<></>)
            }
            return (
                <SidebarMenuButton isActive={tree.id == selectedProjectId && pathname.startsWith("/projects")} onClick={() => {
                    setSelectedProjectId(tree.id as number)
                }}>
                    <FaRegFile />
                    <span translate="no">{tree.name.toString().split("/").pop()}</span>
                </SidebarMenuButton>
            )
        } else if (tree as ProjectMap) {
            if (name == "") {
                return (<></>)
            }
            const projectMap = tree as ProjectMap
            if(filter && filter.length > 0) {
                const filtered = projects.filter((p) => p.name.startsWith(`${path}/${name}`)).filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
                if(filtered.length <= 0) {return (<></>)}
            }
            return (
                <SidebarMenuItem>
                    <Collapsible
                        open={(openFolders.has(`${path}/${name}`) || (filter && filter.length > 0) || (project && project.name.startsWith(`${path}/${name}`))) as boolean}
                        onOpenChange={() => toggleFolder(`${path}/${name}`)}
                        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                    >
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                <FiChevronRight className="transition-transform" />
                                <FaRegFolder />
                                <span translate="no">{name}</span>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub className={cn("pr-0 mr-0")}>
                                {projectMap && Object.keys(projectMap)
                                .sort((a, b) => {
                                    const entryA = projectMap[a]
                                    const entryB = projectMap[b]
                                    console.log(entryA)
                                    const isAFile = typeof (entryA as Project)?.id === 'number';
                                    const isBFile = typeof (entryB as Project)?.id === 'number';
                                    if(!isAFile && isBFile) {
                                        return -1 // a(dir)をb(file)より前に
                                    } else if(isAFile && !isBFile) {
                                        return 1 //a(file)をb(dir)より後に
                                    } else {
                                        return a.localeCompare(b) // 名前で並び替え
                                    }
                                })
                                .map((key, index) => (
                                    <Tree filter={filter} path={path + `/${name}`} key={index} name={key} tree={projectMap[key]} />))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuItem>
            )
        } else {
            return (<></>)
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex flex-row items-center gap-1">
                <div className="relative">
                    <SidebarInput value={filter} onChange={(d)=>{setFilter(d.target.value)}} className="pl-8" placeholder={t("sidebar.projects.search-placeholder")} />
                    <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                </div>
                {
                    isAdmin && (
                        <AddProjectButton />
                    )
                }
            </div>
            <SidebarMenu>
                {
                    projectTree && <ProjectTree filter={filter} projectTree={projectTree} />
                }
            </SidebarMenu>
        </div>
    )
}