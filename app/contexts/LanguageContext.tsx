import React, {createContext, type ReactNode, useContext, useEffect} from "react";
import {getLanguageFromCookie, setLanguageCookie} from "~/utils/language";
import {apiClient} from "~/apiClient";
import type {components} from "~/lib/api/v1";

type AuthContextProps = {
    languageId: string | null,
    setLanguageId: (id: string) => void,
    language: components["schemas"]["Language"] | undefined | null
    languages: components["schemas"]["Language"][] | undefined
}

const LanguageContext = createContext<AuthContextProps>({languageId: null, setLanguageId: () => {}, languages: undefined, language: undefined})

export const LanguageProvider = ({children}: {children: ReactNode}) => {
    const [languageId, setLanguageId_] = React.useState<string | null>(null)
    const [language, setLanguage] = React.useState<components["schemas"]["Language"] | undefined | null>(undefined)
    const [languages, setLanguages] = React.useState<components["schemas"]["Language"][] | undefined>(undefined)
    useEffect(() => {
        let languages: components["schemas"]["Language"][] | undefined = undefined
        apiClient.GET("/api/v1/languages").then((resp) => {
            languages = resp.data
            getLanguageFromCookie().then((languageId) => {
                setLanguageId_(languageId)
                setLanguages(languages)
                setLanguage(languages?.find((language) => language.id === languageId)??null)
            })
        })

    }, []);
    const setLanguageId = (id: string)=>{
        if(!languages){ return }
        setLanguageCookie(id)
        setLanguage(languages.find((language) => language.id === id))
        setLanguageId_(id)
    }
    return <LanguageContext.Provider value={{languageId: languageId, setLanguageId: setLanguageId, languages: languages, language: language}}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)