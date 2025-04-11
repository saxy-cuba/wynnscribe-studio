import {ScrollArea} from "~/components/ui/scroll-area";
import {DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel} from "~/components/ui/form";
import CodeMirror from "@uiw/react-codemirror";
import {miniMessageExtension} from "~/codemirror/lezer-minimessage";
import {Checkbox} from "~/components/ui/checkbox";
import {Card, CardContent} from "~/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "~/components/ui/collapsible";
import {FiChevronRight, FiPlus} from "react-icons/fi";
import {Input} from "~/components/ui/input";
import {Separator} from "~/components/ui/separator";
import {Button} from "~/components/ui/button";
import {useProjects} from "~/contexts/ProjectContext";
import {useEffect, useState} from "react";
import {type Path, useFieldArray, useForm} from "react-hook-form";
import {z} from "zod";
import {originalSchema, originalTypeValues} from "~/form/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {apiClient} from "~/apiClient";
import {toast} from "sonner";
import {getEditorTheme} from "~/studio/projects/editor";
import {useAuth} from "~/contexts/AuthContext";
import {useSearchParams} from "react-router";
import {useTranslation} from "react-i18next";
import {Label} from "~/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";

export default function AddOriginalForm({defaultProjectId, parentId, openDefault}: {defaultProjectId: number | null, parentId: number | undefined, openDefault: boolean}) {
    const {projects} = useProjects()

    const {t} = useTranslation()

    const [showProjectSelector, setShowProjectSelector] = useState(defaultProjectId == null)
    const [projectId, setProjectId] = useState(defaultProjectId)

    const form = useForm<z.infer<typeof originalSchema>>({
        resolver: zodResolver(originalSchema),
        defaultValues: {
            text: "",
            stopOnMatch: false,
            template: "",
            type: "UserInterface",
            filter: {
                type: {
                    content: "",
                    fullMatch: true,
                    withColors: true,
                },
                title: {
                    content: "",
                    fullMatch: true,
                    withColors: true,
                },
                content: {
                    content: "",
                    fullMatch: true,
                    withColors: true,
                }
            }
        }
    })

    if(parentId) {
        form.setValue("parentId", parentId)
    }

    const control = form.control


    const {fields, append, remove} = useFieldArray({
        control,
        name: "children"
    })

    const theme = getEditorTheme()

    const {isAdmin} = useAuth()

    const [isOpen, setIsOpen] = useState(openDefault)

    const [searchParams, setSearchParams] = useSearchParams()
    const defaultOriginalValues = searchParams.get("defaultOriginalValues")

    async function onSubmit(values: z.infer<typeof originalSchema>) {
        if(!projectId) {
            toast.error(t("original.add.dialog.no-project"))
            return
        }
        const response = await apiClient.POST("/api/v1/projects/{projectId}/originals", {
            params: {
                path: {
                    projectId: projectId
                },
            },
            body: values
        })
        if(response.data) {
            form.reset()
            searchParams.delete("defaultOriginalValues")
            searchParams.delete("withProject")
            setSearchParams(searchParams)
            toast.success(t("original.add.dialog.success"))
        } else {
            toast.error(t("original.add.dialog.error"))
        }
    }

    useEffect(() => {
        if(isAdmin && defaultOriginalValues) {
            setIsOpen(true)
            Object.entries(JSON.parse(defaultOriginalValues)).forEach(([k, v]: [string, any]) => {
                form.setValue((k as Path<z.infer<typeof originalSchema>>), v)
            })
        }
        if(searchParams.get("withProject") == "false") {
            setProjectId(null)
            setShowProjectSelector(true)
        }
    }, []);

    return (
        <ScrollArea className="max-h-[70vh]">
            <DialogHeader>
                <DialogTitle>{t("original.add.dialog.title")}</DialogTitle>
                <DialogDescription>{t("original.add.dialog.description")}</DialogDescription>
            </DialogHeader>
            {
                showProjectSelector && (
                    <div className="my-4 flex flex-col gap-2">
                        <Label>Project</Label>
                        <Select value={projectId?.toString()??undefined} onValueChange={(value)=>{setProjectId(Number(value))}}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("original.add.dialog.project-placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    projects.map((project) => (
                                        <SelectItem value={project.id.toString()}>{project.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                )
            }
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="text"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Text</FormLabel>
                                <FormControl>
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
                                        value={field.value}
                                        onChange={
                                            (text) => {
                                                field.onChange(text)
                                                form.setValue("template", text)
                                            }
                                        }
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="template"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Template</FormLabel>
                                <FormControl>
                                    <CodeMirror
                                        className="rounded"
                                        theme={theme}
                                        extensions={[miniMessageExtension()]}
                                        placeholder="Template"
                                        basicSetup={{
                                            lineNumbers: false,
                                            searchKeymap: false,
                                            foldKeymap: false,
                                            foldGutter: false,
                                            highlightActiveLine: false,
                                            highlightActiveLineGutter: false,
                                            crosshairCursor: false,
                                        }}
                                        value={field.value}
                                        onChange={(text)=>{field.onChange(text)}}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({field}) => (
                            <FormItem className="flex flex-row gap-2">
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            originalTypeValues.map((value) => {
                                                return (
                                                    <SelectItem value={value}>{value}</SelectItem>
                                                )
                                            })
                                        }
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}/>
                    <FormField
                        control={form.control}
                        name="stopOnMatch"
                        render={({field}) => (
                            <FormItem className="flex flex-row gap-2">
                                <FormControl>
                                    <Checkbox checked={field.value}
                                              onCheckedChange={field.onChange}/>
                                </FormControl>
                                <FormLabel>Stop On Match</FormLabel>
                            </FormItem>
                        )}/>
                    <Card className="p-3">
                        <CardContent className="p-0 pl-2 pr-2">
                            <Collapsible className="group/collapsible">
                                <CollapsibleTrigger asChild>
                                    <p className="font-semibold flex flex-row gap-1 items-center cursor-pointer">
                                        <FiChevronRight
                                            className="transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                        Filters
                                    </p>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="m-3 flex flex-col gap-6 pt-4">
                                        <div className="space-y-2">
                                            <FormField
                                                control={form.control}
                                                name="filter.type.content"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Type
                                                            e.g. Inventory Title</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="filter value" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.type.fullMatch"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>FullMatch</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.type.withColors"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>WithColors</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            <Separator/>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="filter.title.content"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Title
                                                            e.g. Item Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="filter value" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.title.fullMatch"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>FullMatch</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.title.withColors"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>WithColors</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            <Separator/>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <FormField
                                                control={form.control}
                                                name="filter.content.content"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Content
                                                            e.g. Lore</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="filter value" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.content.fullMatch"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>FullMatch</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            <FormField
                                                control={form.control}
                                                name="filter.content.withColors"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value}
                                                                      onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel>WithColors</FormLabel>
                                                    </FormItem>
                                                )}/>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </CardContent>
                    </Card>
                    {
                        !parentId && (
                            <Card className="p-3">
                                <CardContent className="p-0 pl-2 pr-2">
                                    <Collapsible className="group/collapsible">
                                        <div className="justify-between flex relative">
                                            <CollapsibleTrigger asChild>

                                                <p className="font-semibold flex flex-row gap-1 items-center cursor-pointer">
                                                    <FiChevronRight
                                                        className="transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                                    Children ({fields.length})
                                                </p>
                                            </CollapsibleTrigger>
                                            <Button type="button" onClick={() => {
                                                append({
                                                    template: "",
                                                    stopOnMatch: false,
                                                    text: "",
                                                    children: [],
                                                    type: "UserInterface",
                                                    filter: {
                                                        type: {
                                                            content: "",
                                                            fullMatch: true,
                                                            withColors: true,
                                                        },
                                                        title: {
                                                            content: "",
                                                            fullMatch: true,
                                                            withColors: true,
                                                        },
                                                        content: {
                                                            content: "",
                                                            fullMatch: true,
                                                            withColors: true,
                                                        }
                                                    }
                                                })
                                            }} variant="secondary"
                                                    className="absolute right-0 mt-auto mb-auto top-0 bottom-0" size="sm">
                                                <FiPlus/>
                                            </Button>
                                        </div>
                                        <CollapsibleContent>
                                            <div className="mt-4">
                                                {
                                                    fields.map((field, i) => {
                                                        return (
                                                            <div key={`children.${i}`} className="space-y-4">
                                                                <Separator />
                                                                <div className="flex justify-between relative">
                                                                    <p>{`${i + 1}.`}</p>
                                                                    <Button className="absolute right-0 top-0 bottom-0 mt-auto mb-auto" variant="link" onClick={()=>{remove(i)}}>Remove</Button>
                                                                </div>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`children.${i}.text` as any}
                                                                    render={({field}) => (
                                                                        <FormItem>
                                                                            <FormLabel>Text</FormLabel>
                                                                            <FormControl>
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
                                                                                    value={field.value}
                                                                                    onChange={
                                                                                        (text) => {
                                                                                            field.onChange(text)
                                                                                            form.setValue(`children.${i}.template` as any, text)
                                                                                        }
                                                                                    }
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`children.${i}.template` as any}
                                                                    render={({field}) => (
                                                                        <FormItem>
                                                                            <FormLabel>Template</FormLabel>
                                                                            <FormControl>
                                                                                <CodeMirror
                                                                                    className="rounded"
                                                                                    theme={theme}
                                                                                    extensions={[miniMessageExtension()]}
                                                                                    placeholder="Template"
                                                                                    basicSetup={{
                                                                                        lineNumbers: false,
                                                                                        searchKeymap: false,
                                                                                        foldKeymap: false,
                                                                                        foldGutter: false,
                                                                                        highlightActiveLine: false,
                                                                                        highlightActiveLineGutter: false,
                                                                                        crosshairCursor: false,
                                                                                    }}
                                                                                    value={field.value}
                                                                                    onChange={(text)=>{field.onChange(text)}}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`children.${i}.type` as any}
                                                                    render={({field}) => (
                                                                        <FormItem className="flex flex-row gap-2">
                                                                            <FormLabel>Type</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    {
                                                                                        originalTypeValues.map((value) => {
                                                                                            return (
                                                                                                <SelectItem value={value}>{value}</SelectItem>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormItem>
                                                                    )}/>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`children.${i}.stopOnMatch` as any}
                                                                    render={({field}) => (
                                                                        <FormItem className="flex flex-row gap-2">
                                                                            <FormControl>
                                                                                <Checkbox checked={field.value}
                                                                                          onCheckedChange={field.onChange}/>
                                                                            </FormControl>
                                                                            <FormLabel>Stop On Match</FormLabel>
                                                                        </FormItem>
                                                                    )}/>
                                                                <Card className="p-3">
                                                                    <CardContent className="p-0 pl-2 pr-2">
                                                                        <Collapsible className="group/collapsible">
                                                                            <CollapsibleTrigger asChild>
                                                                                <p className="font-semibold flex flex-row gap-1 items-center cursor-pointer">
                                                                                    <FiChevronRight
                                                                                        className="transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                                                                    Filters
                                                                                </p>
                                                                            </CollapsibleTrigger>
                                                                            <CollapsibleContent>
                                                                                <div className="m-3 flex flex-col gap-6 pt-4">
                                                                                    <div className="space-y-2">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.type.content` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem>
                                                                                                    <FormLabel className="font-semibold">Type
                                                                                                        e.g. Inventory Title</FormLabel>
                                                                                                    <FormControl>
                                                                                                        <Input
                                                                                                            placeholder="filter value" {...field} />
                                                                                                    </FormControl>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.type.fullMatch` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>FullMatch</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.type.withColors` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>WithColors</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <Separator/>
                                                                                    </div>
                                                                                    <div className="space-y-4">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.title.content` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem>
                                                                                                    <FormLabel className="font-semibold">Title
                                                                                                        e.g. Item Name</FormLabel>
                                                                                                    <FormControl>
                                                                                                        <Input
                                                                                                            placeholder="filter value" {...field} />
                                                                                                    </FormControl>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.title.fullMatch` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>FullMatch</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.title.withColors` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>WithColors</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <Separator/>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.content.content` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem>
                                                                                                    <FormLabel className="font-semibold">Content
                                                                                                        e.g. Lore</FormLabel>
                                                                                                    <FormControl>
                                                                                                        <Input
                                                                                                            placeholder="filter value" {...field} />
                                                                                                    </FormControl>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.content.fullMatch` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>FullMatch</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`children.${i}.filter.content.withColors` as any}
                                                                                            render={({field}) => (
                                                                                                <FormItem className="flex flex-row gap-2">
                                                                                                    <FormControl>
                                                                                                        <Checkbox checked={field.value}
                                                                                                                  onCheckedChange={field.onChange}/>
                                                                                                    </FormControl>
                                                                                                    <FormLabel>WithColors</FormLabel>
                                                                                                </FormItem>
                                                                                            )}/>
                                                                                    </div>
                                                                                </div>
                                                                            </CollapsibleContent>
                                                                        </Collapsible>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                            </Card>
                        )
                    }
                    <Button type="submit">{t("button.send")}</Button>
                </form>
            </Form>
        </ScrollArea>
    )
}