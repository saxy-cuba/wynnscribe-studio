import {createCookie} from "react-router";

export const languageCookie = createCookie("language", {
    maxAge: 2147483647,
})