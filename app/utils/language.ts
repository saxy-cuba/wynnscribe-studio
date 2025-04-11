import {languageCookie} from "~/cookies";

export async function setLanguageCookie(id: string) {
    document.cookie = await languageCookie.serialize(id)
}

export async function getLanguageFromCookie(): Promise<string | null> {
    return await languageCookie.parse(document.cookie) as string || null
}