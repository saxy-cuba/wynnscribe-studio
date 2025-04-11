import {Button} from "~/components/ui/button";
import {useTranslation} from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {FiChevronRight, FiCircle, FiMaximize2, FiPlus} from "react-icons/fi";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {addProjectSchema} from "~/form/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "~/components/ui/form";
import {Input} from "~/components/ui/input";
import {Card, CardContent} from "~/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "~/components/ui/collapsible";
import {Checkbox} from "~/components/ui/checkbox";
import {Separator} from "~/components/ui/separator";
import {apiClient} from "~/apiClient";
import {toast} from "sonner";
import {FaAngleRight} from "react-icons/fa6";
import {ScrollArea} from "~/components/ui/scroll-area";

export default function AddProjectButton() {
    const {t} = useTranslation()
    const addProjectForm = useForm<z.infer<typeof addProjectSchema>>({
        resolver: zodResolver(addProjectSchema),
        defaultValues: {
            name: "",
            description: "",
            filter: {
                type: {
                    content: "",
                    withColors: true,
                    fullMatch: true
                },
                title: {
                    content: "",
                    withColors: true,
                    fullMatch: true
                },
                content: {
                    content: "",
                    withColors: true,
                    fullMatch: true
                }
            }
        }
    })

    async function onSubmit(values: z.infer<typeof addProjectSchema>) {
        const result = await apiClient.POST("/api/v1/projects", {
            body: values
        })
        if(!result.error) {
            toast.success("Project added")
            addProjectForm.reset()
        } else {
            toast.error("Error adding project")
        }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="secondary"><FiPlus/></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("sidebar.projects.add.dialog.title")}</DialogTitle>
                                <DialogDescription>{t("sidebar.projects.add.dialog.description")}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh]">
                                <Form {...addProjectForm}>
                                    <form onSubmit={addProjectForm.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={addProjectForm.control}
                                            name="name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="/UserInterface/Blacksmith/Sell" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}/>
                                        <FormField
                                            control={addProjectForm.control}
                                            name="description"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="This project is..." {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}/>
                                        <Card className="p-3">
                                            <CardContent className="p-0 pl-2 pr-2">
                                                <Collapsible className="group/collapsible">
                                                    <CollapsibleTrigger asChild>
                                                        <p className="font-semibold flex flex-row gap-1 items-center cursor-pointer">
                                                            <FiChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                            Filters
                                                        </p>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="m-3 flex flex-col gap-6 pt-4">
                                                            <div className="space-y-2">
                                                                <FormField
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                                                    control={addProjectForm.control}
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
                                        <Button type="submit">{t("button.send")}</Button>
                                    </form>
                                </Form>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t("sidebar.projects.add.button-label")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}