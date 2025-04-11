import {onAuthStateChanged, type User} from "@firebase/auth";
import React, {createContext, type ReactNode, useContext, useEffect} from "react";
import {auth} from "~/lib/firebase.client";
import type {components} from "~/lib/api/v1";
import {apiClient} from "~/apiClient";
import {useNavigate, useSearchParams} from "react-router";

export type Project = components["schemas"]["Project"]

export type ProjectMap = { [key: string]: TreeEntry }

export type TreeEntry = Project | ProjectMap;

function stringsToNestedObject(paths: string[], projects: Project[]): TreeEntry {
    const result: TreeEntry = {};

    for (const path of paths) {
        const parts = path.slice(1).split("/");
        let current: TreeEntry = result;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (i === parts.length - 1) {
                const project = projects.find((project) => project.name === path);
                if (project == null) { continue }
                (current as { [key: string]: TreeEntry })[part] = project;
            } else {
                if (!(current as { [key: string]: TreeEntry })[part]) {
                    (current as { [key: string]: TreeEntry })[part] = {};
                }
                current = (current as { [key: string]: TreeEntry })[part];
            }
        }
    }

    return result;
}

type ProjectContextProps = {
    projectTree: TreeEntry | undefined,
    selectedProjectId: number | null,
    setSelectedProjectId: (id: number) => void
    projects: Project[]
}

const ProjectContext = createContext<ProjectContextProps>({projectTree: undefined, selectedProjectId: null, projects: [], setSelectedProjectId: ()=>{}})

export const ProjectProvider = ({children}: {children: ReactNode}) => {
    const [projectTree, setProjectTree] = React.useState<TreeEntry | undefined>(undefined)
    const [projects, setProjects] = React.useState<Project[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(searchParams.get("id") == null ? null : Number(searchParams.get("id")))
    const pathname = window.location.pathname
    const navigate = useNavigate()
    useEffect(() => {
        apiClient.GET("/api/v1/projects").then((result) => {
            if(!result.error) {
                const projects = result.data
                setProjectTree(stringsToNestedObject(projects.map((p)=>p.name), projects))
                setProjects(projects)
            }
        })
    }, []);
    const selectProject = (id: number) => {
        setSelectedProjectId(id)
        if(!id) { return }
        if(pathname != "/projects") {
            navigate(`/projects?id=${id}`)
        } else {
            searchParams.set("id", id?.toString()??"null")
            setSearchParams(searchParams)
        }
    }
    return <ProjectContext.Provider value={{projectTree: projectTree, selectedProjectId: selectedProjectId, projects: projects, setSelectedProjectId: selectProject}}>{children}</ProjectContext.Provider>
}

export const useProjects = () => useContext(ProjectContext)