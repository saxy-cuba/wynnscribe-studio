import {useTranslation} from "react-i18next";
import {miniMessageExtension} from "~/codemirror/lezer-minimessage";
import CodeMirror from "@uiw/react-codemirror";
import type {Detail} from "~/studio/projects/index";
import {Button} from "~/components/ui/button";
import {
    FiArrowRight,
    FiCheckCircle,
    FiFlag,
    FiMoreVertical,
    FiThumbsDown,
    FiThumbsUp,
    FiTrash,
    FiXOctagon
} from "react-icons/fi";
import type {components} from "~/lib/api/v1";
import {apiClient} from "~/apiClient";
import {useEffect, useState} from "react";
import {useLanguage} from "~/contexts/LanguageContext";
import {Separator} from "~/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {toast} from "sonner";
import {useAuth} from "~/contexts/AuthContext";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import {Badge} from "~/components/ui/badge";
import {getEditorTheme} from "~/studio/projects/editor";
import {FaRegStopCircle, FaRegThumbsUp} from "react-icons/fa";
import {
    FaCircleExclamation,
    FaRegCircleCheck, FaRegCircleUser, FaRegCircleXmark,
    FaRegHourglassHalf,
    FaRegThumbsDown,
    FaThumbsDown,
    FaThumbsUp
} from "react-icons/fa6";

type TranslationDetail = components["schemas"]["TranslationDetails"]

async function getData(projectId: number, originalId: number, languageId: string): Promise<TranslationDetail[] | undefined> {
    const result = await apiClient.GET("/api/v1/projects/{projectId}/originals/{originalId}/translations/details", {
        params: {
            path: {
                originalId: originalId,
                projectId: projectId
            },
            query: {
                lang: languageId
            }
        }
    })
    return result.data
}

function sumVote(votes: components["schemas"]["VoteDetails"][]): number {
    return votes.reduce((acc, vote) => {
        return acc + (vote.type === "Up" ? 1 : (vote.type === "Down" ? -1 : 0))
    }, 0)
}

export default function Sidebar({original, setOriginal}: {
    original: Detail | null,
    setOriginal: (detail: Detail | null) => void
}) {
    const {t} = useTranslation()
    const theme = getEditorTheme()
    const [data, setData] = useState<TranslationDetail[] | null>(null)
    const {user, isAdmin} = useAuth()
    const {languageId} = useLanguage()
    const [isSendingVote, setIsSendingVote] = useState(false)
    const [isSendingStatus, setIsSendingStatus] = useState(false)
    const [clientVotes, setClientVotes] = useState<{ [key: number]: "Up" | "Down" }>({})
    const [clientStatuses, setClientStatuses] = useState<{
        [key: number]: "Rejected" | "NeedsReview" | "Accepted" | "Pending"
    }>({})
    const [deletedList, setDeletedList] = useState<number[]>([])

    function reload() {
        if (original && languageId) {
            getData(original.projectId, original.id, languageId).then((result) => {
                if (result) {
                    setData(result)
                }
            })
        }
    }

    useEffect(() => {
        reload()
    }, [original]);

    async function vote(projectId: number, originalId: number, translationId: number, type: "Up" | "Down") {
        setIsSendingVote(true)
        const result = await apiClient.POST("/api/v1/projects/{projectId}/originals/{originalId}/translations/{translationId}/votes", {
            params: {
                path: {
                    projectId: projectId,
                    originalId: originalId,
                    translationId: translationId
                }
            },
            body: {
                type: type
            }
        })
        setIsSendingVote(false)
        if (!result.error) {
            setClientVotes({...clientVotes, [translationId]: type})
            toast.success(t("editor.sidebar.translations.vote.success"))
        } else {
            toast.error(t("editor.sidebar.translations.vote.failed"))
        }
    }

    async function deleteTranslation(projectId: number, originalId: number, translationId: number) {
        const result = await apiClient.DELETE("/api/v1/projects/{projectId}/originals/{originalId}/translations/{translationId}", {
            params: {
                path: {
                    projectId: projectId,
                    originalId: originalId,
                    translationId: translationId
                }
            }
        })
        if (!result.error) {
            setDeletedList([...deletedList, translationId])
            toast.success(t("editor.sidebar.translations.delete.success"))
        } else {
            toast.error(t("editor.sidebar.translations.delete.failed"))
        }
    }

    async function updateStatus(projectId: number, originalId: number, translationId: number, status: "Rejected" | "NeedsReview" | "Accepted" | "Pending") {
        setIsSendingStatus(true)
        const result = await apiClient.PATCH("/api/v1/projects/{projectId}/originals/{originalId}/translations/{translationId}/status", {
            params: {
                path: {
                    projectId: projectId,
                    originalId: originalId,
                    translationId: translationId
                }
            },
            body: {
                status: status
            }
        })
        setIsSendingStatus(false)
        if (!result.error) {
            setClientStatuses({...clientStatuses, [translationId]: status})
            toast.success(t("editor.sidebar.translations.delete.success"))
        } else {
            toast.error(t("editor.sidebar.translations.delete.failed"))
        }
    }

    if (!original) {
        return
    }
    return (
        <div className="flex flex-col m-3 gap-3">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div></div>
                    <Button onClick={() => {
                        setOriginal(null)
                    }} variant="ghost" size="icon"><FiArrowRight/></Button>
                </div>
                <div className="font-bold text-xl flex flex-row gap-2">
                    {t("editor.sidebar.translations.original")}
                    {
                        original?.parentId && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="text-pink-400"><FaRegCircleCheck/>{t("editor.sidebar.translations.child.label")}</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("editor.sidebar.translations.child.description")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    }
                    {
                        isAdmin && original?.stopOnMatch == true && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="text-orange-300"><FaRegStopCircle/>StopOnMatch</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>StopOnMatch</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    }
                </div>
                <CodeMirror
                    className="rounded"
                    theme={theme}
                    extensions={[miniMessageExtension()]}
                    placeholder="Text"
                    basicSetup={{
                        lineNumbers: false,
                        searchKeymap: false,
                        foldKeymap: false,
                        foldGutter: false,
                        highlightActiveLine: false,
                        highlightActiveLineGutter: false,
                        crosshairCursor: false,
                    }}
                    value={original.template ?? original.text}
                    editable={false}
                />
            </div>
            <div className="flex flex-col gap-2">
                {
                    data && (
                        <>
                            <h1 className="font-bold text-xl">{t("editor.sidebar.translations.translations")}</h1>
                            {
                                // TODO レーティング順でソート
                                data.map((details, index) => {
                                    if (deletedList.includes(details.id)) {
                                        return
                                    }
                                    let votes = sumVote(details.votes)
                                    let voted = details.votes.find((t) => t.userId == (user?.uid ?? "no logged"))?.type
                                    const clientVote = clientVotes[details.id]
                                    if (clientVote) {
                                        if (voted) {
                                            votes -= voted == "Up" ? 1 : (voted == "Down" ? -1 : 0)
                                        }
                                        voted = clientVote
                                        votes += clientVote == "Up" ? 1 : (clientVote == "Down" ? -1 : 0)
                                    }
                                    let status = details.status
                                    let clientStatus = clientStatuses[details.id]
                                    if (clientStatus) {
                                        status = clientStatus
                                    }
                                    return (
                                        <div className="pt-[0.5rem] px-[0.85rem] border rounded-xl" key={index}>
                                            <div className="relative">
                                                <CodeMirror
                                                    theme={theme}
                                                    extensions={[miniMessageExtension()]}
                                                    placeholder="Text"
                                                    basicSetup={{
                                                        lineNumbers: false,
                                                        searchKeymap: false,
                                                        foldKeymap: false,
                                                        foldGutter: false,
                                                        highlightActiveLine: false,
                                                        highlightActiveLineGutter: false,
                                                        crosshairCursor: false,
                                                    }}
                                                    value={details.text}
                                                    editable={false}
                                                />
                                                <div className="absolute top-0 right-0 flex flex-row gap-1">
                                                    {
                                                        status == "Rejected" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="secondary" className="text-red-400"><FaRegCircleXmark/>{t("editor.sidebar.translations.status.rejected.label")}</Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t("editor.sidebar.translations.status.rejected.description")}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    }
                                                    {
                                                        status == "NeedsReview" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="secondary" className="text-orange-400"><FaCircleExclamation/>{t("editor.sidebar.translations.status.needsReview.label")}</Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t("editor.sidebar.translations.status.needsReview.description")}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    }
                                                    {
                                                        status == "Pending" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="secondary" className="text-yellow-400"><FaRegHourglassHalf/>{t("editor.sidebar.translations.status.pending.label")}</Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t("editor.sidebar.translations.status.pending.description")}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    }
                                                    {
                                                        status == "Accepted" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="secondary" className="text-green-400"><FaRegCircleCheck/>{t("editor.sidebar.translations.status.accepted.label")}</Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t("editor.sidebar.translations.status.accepted.description")}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <Separator/>
                                            <div className="flex flex-row gap-1 justify-between my-1">
                                                <div className="flex flex-row gap-1 items-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                {
                                                                    voted == "Up" ? (
                                                                        <Button size="sm" variant="secondary"><FaThumbsUp/></Button>
                                                                    ) : (
                                                                        <Button onClick={() => {
                                                                            vote(original.projectId, original.id, details.id, "Up")
                                                                        }} disabled={isSendingVote}
                                                                                size="sm"
                                                                                variant="ghost"><FaRegThumbsUp/></Button>
                                                                    )
                                                                }

                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{t("editor.sidebar.translations.upvote.label")}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                {
                                                                    voted == "Down" ? (
                                                                        <Button size="sm" variant="secondary"><FaThumbsDown/></Button>
                                                                    ) : (
                                                                        <Button onClick={() => {
                                                                            vote(original.projectId, original.id, details.id, "Down")
                                                                        }} disabled={isSendingVote}
                                                                                size="sm"
                                                                                variant="ghost"><FaRegThumbsDown/></Button>
                                                                    )
                                                                }
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{t("editor.sidebar.translations.downvote.label")}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <div className="text-muted-foreground text-xs">
                                                        {t("editor.sidebar.translations.rating")}: {votes >= 0 ? (
                                                        <span>{votes}</span>) : (
                                                        <span className="text-red-600">{votes}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row gap-1 items-center">
                                                    {
                                                        isAdmin && (
                                                            <>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                disabled={isSendingStatus || status == "Accepted"}
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    updateStatus(original.projectId, original.id, details.id, "Accepted")
                                                                                }}
                                                                            >
                                                                                <FiCheckCircle/>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{t("editor.sidebar.translations.approve.label")}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                disabled={isSendingStatus || status == "Rejected"}
                                                                                size="sm" variant="destructive"
                                                                                onClick={() => {
                                                                                    updateStatus(original.projectId, original.id, details.id, "Rejected")
                                                                                }}
                                                                            >
                                                                                <FiXOctagon/>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{t("editor.sidebar.translations.reject.label")}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </>
                                                        )
                                                    }
                                                    <AlertDialog>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <Button size="sm" variant="ghost"><FiMoreVertical/></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem>
                                                                    <FiFlag/>{t("editor.sidebar.translations.report.label")}
                                                                </DropdownMenuItem>
                                                                {
                                                                    (details.userId === (user?.uid ?? "no logged") || isAdmin) && (
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem variant="destructive">
                                                                                <FiTrash/>{t("editor.sidebar.translations.delete.label")}
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                    )
                                                                }
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t("editor.sidebar.translations.delete.title")}</AlertDialogTitle>
                                                                <AlertDialogDescription>{t("editor.sidebar.translations.delete.description")}</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogCancel>{t("editor.sidebar.translations.delete.cancel")}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => {
                                                                    deleteTranslation(original.projectId, original.id, details.id)
                                                                }}
                                                            >
                                                                {t("editor.sidebar.translations.delete.run")}
                                                            </AlertDialogAction>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}