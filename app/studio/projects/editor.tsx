import type {components} from "~/lib/api/v1";
import {useTranslationStore} from "~/studio/projects/translation-store";
import {TableCell, TableRow} from "~/components/ui/table";
import CodeMirror from "@uiw/react-codemirror";
import {miniMessageExtension, miniMessageTagStyles} from "~/codemirror/lezer-minimessage";
import {githubDarkInit, githubLightInit} from "@uiw/codemirror-theme-github";
import {debounce} from "es-toolkit";
import {FiChevronRight} from "react-icons/fi";
import {Badge} from "~/components/ui/badge";
import {useTranslation} from "react-i18next";
import {useTheme} from "next-themes";
import {FaCircleExclamation, FaRegCircleCheck, FaRegHourglassHalf, FaStop} from "react-icons/fa6";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {useAuth} from "~/contexts/AuthContext";
import {FaRegStopCircle} from "react-icons/fa";

export function getEditorTheme() {
    const theme = useTheme()
    return theme.resolvedTheme == "light" ? githubLightInit({styles: miniMessageTagStyles,}) : githubDarkInit({styles: miniMessageTagStyles,})
}

export default function Editor({data, index, setHasChanges, onClick}: {data: components["schemas"]["OriginalDetails"], index: number, setHasChanges: React.Dispatch<React.SetStateAction<boolean>>, onClick: () => void}) {
    const defaultValue = data.bestTranslation?.text ?? data.template ?? data.text
    const theme = getEditorTheme()
    const {t} = useTranslation()
    const {isAdmin} = useAuth()
    const storedValue = useTranslationStore(state => state.changes[data.id])
    return (
        <TableRow key={`originals.${index}`} onClick={onClick} className="cursor-pointer">
            <TableCell>{index + 1}</TableCell>
            <TableCell>
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
                    value={data.template ?? data.text}
                    editable={false}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            </TableCell>
            <TableCell>
                <div className="relative">
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
                        value={storedValue ?? defaultValue}
                        onChange={debounce((value: string)=>{
                            if(value == defaultValue) {
                                useTranslationStore.getState().removeChange(data.id)
                            } else {
                                useTranslationStore.getState().setChange(data.id, value)
                            }
                            setHasChanges(useTranslationStore.getState().hasChanges())
                        }, 200)}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    />
                    <div className="absolute top-0 right-0 flex flex-row gap-1">
                        {
                            data?.parentId && (
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
                            data.bestTranslation?.status == "NeedsReview" && (
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
                            data.bestTranslation?.status == "Pending" && (
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
                            data.bestTranslation?.status == "Accepted" && (
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
            </TableCell>
            <TableCell className="hover:bg-muted hover:cursor-pointer w-10">
                <FiChevronRight />
            </TableCell>
        </TableRow>
    )
}