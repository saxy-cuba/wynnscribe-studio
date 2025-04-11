import {useProjects} from "~/contexts/ProjectContext";
import {useEffect, useMemo, useState} from "react";
import {Input} from "~/components/ui/input";
import {FiInfo, FiSearch} from "react-icons/fi";
import {type Route} from "../../../.react-router/types/app/studio/projects/+types";
import {apiClient} from "~/apiClient";
import type {components} from "~/lib/api/v1";
import {useLanguage} from "~/contexts/LanguageContext";
import AddProjectButton from "~/studio/projects/add-original-button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {useTranslation} from "react-i18next";
import "../editor.css"
import {Table, TableBody, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "~/components/ui/resizable";
import Sidebar from "~/studio/projects/sidebar";
import Editor from "~/studio/projects/editor";
import {Button} from "~/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {useTranslationStore} from "~/studio/projects/translation-store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import {toast} from "sonner";
import {ScrollArea, ScrollBar} from "~/components/ui/scroll-area";
import {FaAngleLeft, FaAngleRight, FaRegPaperPlane, FaRegTrashCan, FaSpinner} from "react-icons/fa6";
import {useNavigate} from "react-router";

export type Detail = components["schemas"]["OriginalDetails"]

const limit = 20

async function getData(page: number, projectId: number, language: string) {
    try {
        const response = await apiClient.GET("/api/v1/projects/{projectId}/originals/details", {
            params: {
                path: {
                    projectId: projectId
                },
                query: {
                    limit: limit,
                    offset: (page - 1) * 20,
                    lang: language
                }
            }
        })
        if (!response.error) {
            return response.data
        }
        return null
    } catch {
        return null
    }
}

function save() {
    const changes = useTranslationStore(state => state.changes)
}

export default function Project() {
    const {selectedProjectId} = useProjects()
    const {t} = useTranslation()
    const [page, setPage] = useState(1)
    const {languageId} = useLanguage()
    const [data, setData] = useState<Detail[] | null>(null)
    const [hasChanges, setHasChanges] = useState<boolean>(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(false)
    const [selected, setSelected] = useState<Detail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    useEffect(()=>{
        setPage(1)
    }, [selectedProjectId])
    const editorComponents = useMemo(()=>{
        return data?.map((data, index) => <Editor data={data} index={index}
                                                  key={`editor-${index}`}
                                                  setHasChanges={setHasChanges}
                                                  onClick={() => {
                                                      setSelected(data)
                                                  }}/>)
    }, [data])
    async function reload() {
        setError(false)
        if(selectedProjectId && languageId) {
            const timeoutId = setTimeout(()=>{
                setIsLoading(true)
            }, 50)
            getData(page, selectedProjectId, languageId).then((result) => {
                if(result == null) {
                    setError(true)
                }
                clearTimeout(timeoutId)
                setData(result)
                setIsLoading(false)
            })
        }
    }

    if (!selectedProjectId) {
        return window.location.href = "/"
    }

    useEffect(() => {
        reload()
    }, [page, selectedProjectId, languageId])

    if (!languageId) {
        return (
            <div className="flex h-full flex-row items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-1"><FiInfo />{t("original.errors.no-language.card.title")}</CardTitle>
                        <CardDescription>{t("original.errors.no-language.card.description")}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    async function sendChanges() {
        if (!useTranslationStore.getState().hasChanges() || !selectedProjectId || !languageId) {
            return
        }
        setSending(true)
        const body: components["schemas"]["TranslationCreateMany"][] = Object.entries(useTranslationStore.getState().changes).map(([key, value]) => {
            return {
                originalId: Number(key),
                text: value
            }
        })
        apiClient.POST("/api/v1/projects/{projectId}/originals/translations", {
            params: {
                path: {
                    projectId: selectedProjectId
                },
                query: {
                    lang: languageId
                }
            },
            body
        }).then((result) => {
            setSending(false)
            if (!result.error) {
                window.location.reload()
            } else {
                toast.error(t("editor.save.error.description"))
            }
        })
    }

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={70} className="overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-none flex flex-row gap-3 items-center justify-between mb-3">
                        <div className="flex flex-row gap-3">
                            <div className="relative">
                                <Input className="max-w-[40em] pl-8" placeholder="Search"/>
                                <FiSearch
                                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"/>
                            </div>
                            <AddProjectButton/>
                        </div>
                        <div className="flex flex-row gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                >
                                                    <FaRegTrashCan/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t("editor.revert.title")}</AlertDialogTitle>
                                                    <AlertDialogDescription>{t("editor.revert.description")}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogCancel>{t("editor.revert.cancel")}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => {
                                                    useTranslationStore.getState().clearChanges();
                                                    setHasChanges(false)
                                                }}>{t("editor.revert.run")}</AlertDialogAction>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("editor.revert.label")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button disabled={!hasChanges || sending} type="button"
                                    onClick={sendChanges}><FaRegPaperPlane/>{sending ? t("editor.save.sending") : t("editor.save.label")}
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0">
                                <ScrollArea className="h-full w-full">
                                    <ScrollBar orientation={"horizontal"}/>
                                    <div className="border rounded-lg flex flex-col">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead></TableHead>
                                                    <TableHead>{t("editor.original")}</TableHead>
                                                    <TableHead>{t("editor.translated")}</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    (data?.length??0) > 0 ? (
                                                        editorComponents
                                                    ) : (
                                                        t("editor.nothing")
                                                    )
                                                }
                                            </TableBody>
                                        </Table>
                                        <div className="flex flex-row m-5 items-center justify-between gap-3">
                                            <Button onClick={()=>{setPage(page - 1)}} disabled={page <= 1} variant="secondary"><FaAngleLeft />{t("editor.back")}</Button>
                                            <Button onClick={()=>{setPage(page + 1)}} disabled={(data?.length??0) < limit} variant="secondary">{t("editor.next")}<FaAngleRight /></Button>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                            {
                                isLoading && <div className="absolute w-full h-full flex flex-col items-center justify-center bg-background opacity-90">
                                    <FaSpinner className="text-3xl animate-spin" />
                                </div>
                            }
                            {
                                error && (
                                    <div className="absolute w-full h-full flex flex-col items-center justify-center bg-background opacity-95">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>⚠️{t("editor.sidebar.translations.error.title")}</CardTitle>
                                                <CardDescription><div className="whitespace-pre-wrap">{t("editor.sidebar.translations.error.description")}</div></CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-end">
                                                    <Button onClick={()=>{reload()}}>{t("editor.sidebar.translations.error.refresh")}</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </ResizablePanel>
            {data && selected && (
                <>
                    <ResizableHandle className="m-2"/>
                    <ResizablePanel defaultSize={30}>
                        <Sidebar setOriginal={setSelected} original={selected}/>
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    )
}