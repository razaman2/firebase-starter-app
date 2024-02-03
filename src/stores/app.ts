import {defineStore} from "pinia";
import {Collection} from "@razaman2/collection-proxy";
import {reactive} from "vue";

type Document = {
    [p: string]: any;
    id: string | number;
};

type CacheOptions = {
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

            settings: Collection.proxy("settings", {
                payload: {
                    name: "AppSettings",
                    data: reactive<Partial<Document>>({}),
                },
            }) as Collection,

            _cache: {} as Record<string, any>,
        };
    },
    persist: {
        enabled: true,
        strategies: [
            {storage: localStorage},
        ],
    },
    getters: {
        cache(state) {
            return (id: string | number, options: CacheOptions) => {
                const config = (typeof options.collection === "string")
                    ? {name: options.collection}
                    : options.collection;
                if (!state._cache.value[config.name]) {
                    state._cache.value[config.name] = {};
                }
                const collection = state._cache.value[config.name];
                const set = (id: string | number) => {
                    if (id || (id === 0)) {
                        clearTimeout(state._cache.value[`${config.name}Timeout`]);
                        collection[id] = {};
                        const promise = new Promise((resolve) => {
                            console.log(`CACHE ${config.name}:`.toUpperCase(), id);
                            state._cache.value[`${config.name}Timeout`] = setTimeout(async () => {
                                const promises = Object.entries(collection).reduce((promises: Array<any>, [id, document]: any) => {
                                    const _collection = Collection.proxy(config.name, {
                                        parent: config.parent,
                                    });
                                    const _options = {
                                        realtime: config.realtime ?? false,
                                        callback: config.callback
                                            ? (...params: any) => {
                                                return (collection[id] = config.callback(...params));
                                            }
                                            : ((snapshot: any) => {
                                                if (snapshot.exists()) {
                                                    collection[id] = snapshot.data();
                                                }
                                            }),
                                    };
                                    return (!document.id || options.force) ? promises.concat(
                                        config.query
                                            ? _collection.getDocuments(Object.assign({query: (ref: any) => config.query(ref, id)}, _options))
                                            : _collection.getDocument(id, _options),
                                    ) : promises;
                                }, []);
                                console.log(`FETCHING ${config.name}:`.toUpperCase(), promises);
                                const subscriptions = await Promise.all(promises);
                                if (config.subscription) {
                                    subscriptions.forEach((subscription) => {
                                        config.subscription(subscription);
                                    });
                                }
                                resolve(state._cache.value[config.name]);
                            }, options.timeout);
                        });
                        if (options.async) {
                            return promise;
                        }
                    }
                };
                if (options.force) {
                    return set(id);
                } else if (collection[id]) {
                    return options.async ? collection : collection[id];
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
    },
    actions: {
        appRoles() {
            return this.roles;
        },
        appSettings() {
            return this.settings;
        },
    },
});
