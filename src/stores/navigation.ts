import {defineStore} from "pinia";
import ObjectManager from "@razaman2/object-manager";

export const useNavigationStore = defineStore(`${import.meta.env.VITE_APP_NAME}-NAVIGATION`, {
    state: () => {
        return {
            navigation: {admin: true, super: true} as Record<string, any>,
            route: {meta: {}} as Record<string, any>,
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {storage: localStorage},
        ],
    },
    getters: {
        get(state) {
            return (key: string | number) => {
                return ObjectManager.on(state.navigation).get(key);
            };
        },

        to(state) {
            return () => state.route;
        },
    },
    actions: {
        set(paths: Record<string | number, any>) {
            return ObjectManager.on(this.navigation).set(paths);
        },
    },
});
