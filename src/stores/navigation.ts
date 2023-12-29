import {defineStore} from "pinia";

export const useNavigationStore = defineStore("navigation", {
    state: () => {
        return {
            navigation: {} as {[p: string]: any},
            route: {} as {[p: string]: any},
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
            return (key: string) => {
                return state.navigation[key];
            };
        },

        to(state) {
            return () => state.route;
        },
    },
    actions: {
        set(value: Record<string, any>) {
            Object.entries(value).forEach(([key, value]) => {
                this.navigation[key] = value;
            });
        },
    },
});
