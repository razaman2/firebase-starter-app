import {defineStore} from "pinia";
import ObjectManager from "@razaman2/object-manager";

type Document = {
    [p: string]: any;
    id: string | number;
};

export const useAuthStore = defineStore("auth", {
    state: () => {
        return {
            user: {} as Document,
            company: {} as Document,
            roles: [] as Array<Document>,
            companies: [] as Array<Document>,
            settings: {
                auth: {
                    user: {},
                    company: {},
                },
                user: [],
            } as {auth: Record<string, Partial<Document>>; user: Array<Document>},
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {
                paths: ["company"],
                storage: localStorage,
            },
        ],
    },
    getters: {
        getUser(state) {
            return (key?: string | number) => {
                return key !== undefined
                    ? ObjectManager.on(state.user).get(key)
                    : state.user;
            };
        },

        getCompany(state) {
            return (key?: string | number) => {
                return key !== undefined
                    ? ObjectManager.on(state.company).get(key)
                    : state.company;
            };
        },

        getRoles(state) {
            return (id?: string) => {
                return id !== undefined
                    ? state.roles.find((role: any) => role.id === id)
                    : state.roles;
            };
        },

        getCompanies(state) {
            return (id?: string) => {
                return id !== undefined
                    ? state.companies.find((company: any) => company.id === id)
                    : state.companies;
            };
        },

        getSettings(state) {
            return (key?: string | number) => {
                return key !== undefined
                    ? ObjectManager.on(state.settings).get(key)
                    : state.settings;
            };
        },

        authenticated(state) {
            return () => {
                if (state.user && state.company) {
                    return (
                        state.user.id
                        && state.company.id
                        && state.settings.auth.user.id
                        && state.settings.auth.company.id
                        && state.roles.length
                        && !(
                            ["inactive"].includes(state.settings.auth.user.status) ||
                            ["inactive"].includes(state.settings.auth.company.status)
                        )
                    );
                } else {
                    return false;
                }
            };
        },
    },
});
