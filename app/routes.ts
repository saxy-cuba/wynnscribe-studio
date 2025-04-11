import {type RouteConfig, index, layout, route} from "@react-router/dev/routes";

export default [
    layout("auth-guard.tsx", [
        layout("studio/layout.tsx", [
            index("studio/index.tsx"),
            route("projects", "studio/projects/index.tsx")
        ]),
    ]),
    route("login", "authentication/login.tsx")
] satisfies RouteConfig;
