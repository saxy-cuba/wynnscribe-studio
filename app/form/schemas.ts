import {z} from "zod";

export const originalTypeValues = ["UserInterface", "GameItem", "Chat", "Conversation"] as const

export const addLanguageSchema = z.object({
    id: z.string().min(2),
    name: z.string().min(2),
    englishName: z.string().min(2),
    emoji: z.string(),
    color: z.string()
})

export const filterContentSchema = z.object({
    content: z.string(),
    withColors: z.boolean(),
    fullMatch: z.boolean()
})

export const filterSchema = z.object({
    type: filterContentSchema,
    title: filterContentSchema,
    content: filterContentSchema
})

export const addProjectSchema = z.object({
    name: z.string().min(2).startsWith("/"),
    description: z.string(),
    filter: filterSchema
})

export const baseOriginalChildSchema = z.object({
    text: z.string().min(2),
    stopOnMatch: z.boolean(),
    template: z.string().optional(),
    filter: filterSchema,
    type: z.enum(originalTypeValues),
    parentId: z.number().optional()
})

export type Child = z.infer<typeof baseOriginalChildSchema> & {
    children: Child[]
}

export const originalSchema: z.ZodType<Child> = baseOriginalChildSchema.extend({
    children: z.lazy(()=>originalSchema.array())
})