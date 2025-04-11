import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {Button} from "~/components/ui/button";
import {FiChevronDown, FiPlusSquare, FiSidebar} from "react-icons/fi";
import {useTranslation} from "react-i18next";
import {apiClient} from "~/apiClient";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "~/components/ui/form";
import {Input} from "~/components/ui/input";
import {useLanguage} from "~/contexts/LanguageContext";
import {useSidebar} from "~/components/ui/sidebar";
import {useAuth} from "~/contexts/AuthContext";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {addLanguageSchema} from "~/form/schemas";
import {useProjects} from "~/contexts/ProjectContext";


export default function Header() {
    const {t} = useTranslation()
    const {projects, selectedProjectId} = useProjects()
    const pathname = window.location.pathname
    const project = projects.find((project) => project.id == selectedProjectId)
    const {language, setLanguageId, languages} = useLanguage()
    const {isAdmin} = useAuth()
    const addLanguageForm = useForm<z.infer<typeof addLanguageSchema>>({
        resolver: zodResolver(addLanguageSchema),
        defaultValues: {
            id: "",
            name: "",
            englishName: "",
            emoji: "",
            color: ""
        }
    })

    async function addLanguage(values: z.infer<typeof addLanguageSchema>) {
        await apiClient.POST("/api/v1/languages", {
            body: values
        })
        window.location.reload()
    }

    const sidebar = useSidebar()

    if(languages === undefined || language === undefined) {return}

    return (
        <header className="flex flex-row h-16 p-4">
            <div className="flex flex-row gap-2 items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost"
                                    onClick={() => {
                                        sidebar.toggleSidebar()
                                    }}>
                                <FiSidebar/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t("sidebar.close.toggle-label")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <h1 className="text-2xl font-semibold">
                    {
                        project && pathname.startsWith("/projects") && project.name
                    }
                </h1>
            </div>
            <div className="ml-auto">
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-72 h-10 flex justify-between" variant="outline">
                                <div className="flex flex-row justify-between w-full items-center">
                                    <div
                                        className="emoji flex flex-row items-center">{language?.emoji ?? "🌍️"} {language?.englishName ?? t("admin.languages.not-selected")}</div>
                                    <span className="text-secondary-foreground/50">{language?.name ?? ""}</span></div>
                                <FiChevronDown/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72">
                            {
                                languages.map((language) => {
                                    return (
                                        <DropdownMenuItem key={language.id} onClick={() => {
                                            setLanguageId(language.id)
                                        }}>
                                            <div className="flex flex-row justify-between w-full">
                                                <div
                                                    className="emoji flex flex-row items-center">{language.emoji} {language.englishName}</div>
                                                <span className="text-secondary-foreground/50">{language.name}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    )
                                })
                            }
                            {
                                isAdmin && (
                                    <>
                                        <DropdownMenuSeparator/>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem><FiPlusSquare/>{t("admin.languages.add.button-label")}
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                    </>
                                )
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("admin.languages.add.dialog.title")}</DialogTitle>
                            <DialogDescription>{t("admin.languages.add.dialog.description")}</DialogDescription>
                        </DialogHeader>
                        <Form {...addLanguageForm}>
                            <form onSubmit={addLanguageForm.handleSubmit(addLanguage)}>
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        control={addLanguageForm.control}
                                        name="id"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="japanese" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addLanguageForm.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="日本語" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    /><FormField
                                    control={addLanguageForm.control}
                                    name="englishName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>English Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Japanese" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                    <FormField
                                        control={addLanguageForm.control}
                                        name="emoji"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Emoji</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="🇯🇵" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addLanguageForm.control}
                                        name="color"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Color</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="#FF0000" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">{t("button.send")}</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    )
}