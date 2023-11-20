import _super from "./super.ts";
import admin from "./admin.ts";

import {createRouter, createWebHistory} from "vue-router";
import {useNavigationStore} from "../stores/navigation.ts";
import {useAuthStore} from "../stores/auth.ts";
import Authorization from "../../helpers/Authorization.ts";
import Swal from "sweetalert2";

const Route = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("../layouts/Default.vue"),
            children: [
                {
                    path: "",
                    component: () => import("../pages/Home.vue"),
                },
                {
                    path: "user/:id",
                    component: () => import("../pages/User.vue"),
                },
            ],
            meta: {requiresAuth: true},
        },

        {
            path: "/",
            component: () => import("../layouts/Default.vue"),
            children: [
                {
                    path: "about",
                    component: () => import("../pages/About.vue"),
                },
                {
                    path: "list",
                    component: () => import("../pages/List.vue"),
                },
            ],
        },

        {
            path: "/",
            component: () => import("../layouts/Auth.vue"),
            children: [
                {
                    path: "login",
                    component: () => import("../pages/Login.vue"),
                },
            ],
        },

        {
            path: "/admin",
            component: () => import("../layouts/Default.vue"),
            children: admin,
            meta: {requiresAuth: true, rolesAllowed: ["super", "admin"]},
        },

        {
            path: "/super",
            component: () => import("../layouts/Default.vue"),
            children: _super,
            meta: {requiresAuth: true, rolesAllowed: ["super"]},
        },

        {
            path: "/:pathMatch(.*)*",
            component: () => import("../layouts/Base.vue"),
            children: [
                {
                    path: "",
                    component: () => import("../pages/Error404.vue"),
                },
            ],
        },
    ],
});

Route.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((to) => to.meta.requiresAuth);

    const cache = () => {
        if (!to.matched.some((to) => ["/login"].includes(to.path)) && (to.fullPath !== useNavigationStore().to().fullPath)) {
            useNavigationStore().$patch({
                route: {
                    path: to.path,
                    fullPath: to.fullPath,
                    requiresAuth,
                },
            });

            console.info(`%cto: ${to.fullPath} from: ${from.fullPath} cached: ${useNavigationStore().to().fullPath}`, "color: purple");
        }

        return next();
    };

    if (requiresAuth) {
        if (useAuthStore().authenticated()) {
            const roles = useAuthStore().getRoles().map((role) => role.id);
            const authorized = Authorization.app({route: to, roles});
            const user = Authorization.user({route: to, user: {id: useAuthStore().getUser("id"), roles}});

            if (authorized && user) {
                return cache();
            } else {
                Swal.fire({
                    position: "top",
                    icon: "warning",
                    title: "Not Authorized!",
                    timer: 3000,
                    timerProgressBar: true,
                    toast: true,
                });
            }
        } else {
            return cache();
        }
    } else {
        return cache();
    }
});

export default Route;
