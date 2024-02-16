import "@src/firebase-init-firestore";
import {defineStore} from "pinia";
import Authorization from "@helpers/Authorization";
import {Collection} from "@razaman2/collection-proxy";
import {useAppStore} from "@stores/app";
import {reactive} from "vue";

type Document = {
    [p: string]: any;
    id: string | number;
};

export const useAuthStore = defineStore(`${import.meta.env.VITE_APP_NAME}-AUTH`, {
    state: () => {
        return {
            user: Collection.proxy("users", {
                payload: {
                    name: "AuthUser",
                    data: reactive<Partial<Document>>({}),
                },
            }) as Collection,

            roles: Collection.proxy("roles", {
                payload: {
                    name: "AuthRoles",
                    data: reactive<Partial<Document>>([]),
                },
            }) as Collection,

            settings: {
                auth: {
                    user: Collection.proxy("settings", {
                        payload: {
                            name: "AuthSettings",
                            data: reactive<Partial<Document>>({}),
                        },
                    }),

                    company: Collection.proxy("settings", {
                        payload: {
                            name: "AuthCompanySettings",
                            data: reactive<Partial<Document>>({}),
                        },
                    }),
                },
                user: [],
            } as {auth: Record<string, Collection>; user: Array<Document>;},

            company: Collection.proxy("companies", {
                payload: {
                    name: "AuthCompany",
                    data: reactive<Partial<Document>>({}),
                },
            }) as Collection,

            companies: Collection.proxy("settings", {
                payload: {
                    name: "AuthCompanies",
                    data: reactive<Partial<Document>>([]),
                },
            }) as Collection,
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {storage: sessionStorage},
        ],
    },
    getters: {
        getRoles(state) {
            return (id?: string | number) => {
                return (id !== undefined)
                    ? state.roles.getData().find((role: Document) => role.id === id)
                    : state.roles.getData();
            };
        },

        getCompanies(state) {
            return (id?: string | number) => {
                return (id !== undefined)
                    ? state.companies.getData().find((company: Document) => company.id === id)
                    : state.companies.getData();
            };
        },

        getSettings(state) {
            return (id?: string | number) => {
                return (id !== undefined)
                    ? state.settings.user.find((settings: Document) => settings.id === id)
                    : state.settings.user;
            };
        },

        authenticated(state) {
            return () => {
                try {
                    return (
                        state.user.getData("id")
                        && state.company.getData("id")
                        && state.settings.auth.user.getData("id")
                        && state.settings.auth.company.getData("id")
                        && !(
                            ["inactive"].includes(state.settings.auth.user.getData("status"))
                            || ["inactive"].includes(state.settings.auth.company.getData("status"))
                        )
                        && useAppStore().appSettings().getData("id")
                    );
                } catch {
                    return false;
                }
            };
        },

        authorized(state) {
            return (route: any) => {
                const roles: Array<string> = state.roles.getData().map((role: Document) => role.id);

                return (
                    Authorization.app({route, roles})
                    && Authorization.user({route, roles, user: state.user.getData()})
                );
            };
        },

        isUserHaveRoles(state) {
            return (roles: string | Array<string>) => {
                const user = {roles: Array.isArray(roles) ? roles : [roles]};

                return Boolean(state.roles.getData().find((role: Document) => {
                    return user.roles.some((id) => role.id === id);
                }));
            };
        },
    },
    actions: {
        authUser() {
            return this.user;
        },
        authCompany() {
            return this.company;
        },
        authRoles() {
            return this.roles.setParent(this.user as Collection);
        },
        authCompanies() {
            return this.companies.setParent(this.user as Collection);
        },
        authSettings() {
            return this.settings.auth.user.setParent(this.user as Collection);
        },
        authCompanySettings() {
            return this.settings.auth.company.setParent(this.company as Collection);
        },
    },
});
