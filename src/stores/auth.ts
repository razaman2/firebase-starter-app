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
            roles: [] as Array<Document>,
            settings: {} as Document,
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {storage: sessionStorage},
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

        getRoles(state) {
            return (id?: string) => {
                return id !== undefined
                    ? state.roles.find((role: any) => (role.id === id))
                    : state.roles;
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
                if (state.user) {
                    return (
                        state.user.id
                        && state.settings.id
                        && state.roles.length
                        && !["inactive"].includes(state.settings.status)
                    );
                } else {
                    return false;
                }
            };
        },
    },
});
