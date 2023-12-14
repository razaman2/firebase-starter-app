import {defineStore} from "pinia";
import {Collection} from "@razaman2/firestore-proxy";
import ObjectManager from "@razaman2/object-manager";

type Document = {
    [p: string]: any;
    id: string;
};

type CacheOptions = {
    collection: string | Record<string, any>;
    force?: boolean;
    timeout?: number;
    async?: boolean;
}

export const useAppStore = defineStore("app", {
    state: () => {
        return {
            roles: [] as Array<Document>,
            companies: [] as Array<Document>,
            settings: {} as Document & {id: string | number},
            _cache: {} as {
                [key: string]: any
            },
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

                if (!state._cache[config.name]) {
                    state._cache[config.name] = {};
                }

                const collection = state._cache[config.name];

                const set = (id: string | number) => {
                    if (id || (id === 0)) {
                        clearTimeout(state._cache[`${config.name}Timeout`]);
                        collection[id] = {};

                        const promise = new Promise((resolve) => {
                            console.log(`CACHE ${config.name}:`.toUpperCase(), id);

                            state._cache[`${config.name}Timeout`] = setTimeout(async () => {
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

                                resolve(state._cache[config.name]);
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
            return (id?: string) => {
                return (id !== undefined)
                    ? state.roles.find((role: any) => (role.id === id))
                    : state.roles;
            };
        },

        getCompanies(state) {
            return (id?: string | number) => {
                return (id !== undefined)
                    ? state.companies.find((company: any) => (company.id === id))
                    : state.companies;
            };
        },

        getSettings(state) {
            return (key?: string) => {
                return (key !== undefined)
                    ? ObjectManager.on(state.settings).get(key)
                    : state.settings;
            };
        },
    },
});
