import createClient, {type Middleware} from "openapi-fetch";
import type {paths} from "~/lib/api/v1";
import {auth} from "~/lib/firebase.client";

const middleware: Middleware = {
    async onRequest({request}) {
        const idToken = await auth.currentUser?.getIdToken()
        if(idToken !== undefined) {
            request.headers.set("Authorization", `Bearer ${idToken}`)
        }
        return request
    }
}


export const apiClient = createClient<paths>({ baseUrl: "http://192.168.0.7:8080" }) // TODO check production or development
apiClient.use(middleware)