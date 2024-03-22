import {defineStore} from "pinia";
import {Collection} from "@razaman2/collection-proxy";
import {reactive} from "vue";
import {version} from "@/package.json";

type Document = {
    [p: string]: any;
    id: string | number;
};

type CacheOptions = {
    name?: string,
    collection: string | Record<string, any>;
    force?: boolean;
    timeout?: number;
    async?: boolean;
};

export const useAppStore = defineStore(`${import.meta.env.VITE_APP_NAME}-APP`, {
    state: () => {
        return {
            roles: Collection.proxy("roles", {
                payload: {
                    name: "AppRoles",
                    data: reactive<Array<Document>>([]),
                },
            }) as Collection,

            companies: Collection.proxy("companies", {
                payload: {
                    name: "AppCompanies",
                    data: reactive<Array<Document>>([]),
                },
            }) as Collection,

            settings: Collection.proxy("settings", {
                payload: {
                    name: "AppSettings",
                    data: reactive<Partial<Document>>({}),
                },
            }) as Collection,

            _cache: {} as Record<string, any>,

            modal: {type: "div"},

            version,
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {
                storage: localStorage,
                paths: ["roles", "companies", "settings", "version"],
            },
            {
                storage: sessionStorage,
                paths: ["_cache"],
            },
        ],
    },
    getters: {
        cache(state) {
            return (id: string | number, options: CacheOptions) => {
                const config = (typeof options.collection === "string")
                    ? {name: options.collection}
                    : options.collection;

                const name = options.name ?? config.name;

                if (!state._cache[name]) {state._cache[name] = {};}

                const set = (id: string | number) => {
                    if (id || (id === 0)) {
                        // @ts-ignore
                        clearTimeout(window.timeouts?.[`${import.meta.env.VITE_APP_NAME} - ${name}Timeout`]);
                        state._cache[name][id] = false;

                        const promise = new Promise((resolve) => {
                            console.log(`%cCACHE ${name.toUpperCase()}:`, "background-color: blue; color: white; padding: 2px;", id);

                            // @ts-ignore
                            if (!window.timeouts) {
                                // @ts-ignore
                                window.timeouts = {};
                            }

                            // @ts-ignore
                            window.timeouts[`${import.meta.env.VITE_APP_NAME} - ${name}Timeout`] = setTimeout(async () => {
                                const promises = Object.entries(state._cache[name]).reduce((promises: Array<any>, [id, doc = {}]: any) => {
                                    const collection = Collection.proxy(config.name, {
                                        parent: config.parent,
                                    });

                                    const _options = {
                                        realtime: config.realtime ?? false,
                                        callback: config.callback
                                            ? (...params: any) => {
                                                const data = config.callback(...params);

                                                if (data) {
                                                    state._cache[name][id] = data;
                                                }
                                            }
                                            : (snapshot: any) => {
                                                const data = snapshot.data();

                                                if (data) {
                                                    state._cache[name][id] = data;
                                                }
                                            },
                                    };

                                    return (!doc.id || options.force)
                                        ? promises.concat((
                                            config.query
                                                ? collection.getDocuments(Object.assign({query: (ref: any) => config.query(ref, id)}, _options))
                                                : collection.getDocument(id, _options)
                                        )) : promises;
                                }, []);

                                console.log(`%cFETCHING ${name.toUpperCase()}:`, "background-color: blue; color: red; padding: 2px;", promises);

                                const subscriptions = await Promise.all(promises);

                                if (config.subscription) {
                                    subscriptions.forEach((subscription) => {
                                        config.subscription(subscription);
                                    });
                                }

                                resolve(state._cache[name]);
                            }, options.timeout);
                        });

                        if (options.async) {
                            return promise;
                        }
                    }
                };

                if (options.force) {
                    return set(id);
                } else if (state._cache[name][id]) {
                    return options.async ? state._cache[name] : state._cache[name][id];
                } else {
                    return set(id);
                }
            };
        },

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
                    ? state.companies.getData().find((company: any) => company.id === id)
                    : state.companies.getData();
            };
        },
    },
    actions: {
        appRoles() {
            return this.roles;
        },
        appCompanies() {
            return this.companies;
        },
        appSettings() {
            return this.settings;
        },
        showModal(component: any) {
            this.modal = component;
        },
    },
});
