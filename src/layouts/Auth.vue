<script lang="jsx">
import "../firebase-init-firestore";
import {Collection} from "@razaman2/firestore-proxy";
import {setup, access, getSubscription} from "@razaman2/reactive-vue";
import Base from "./Base.vue";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {useAuthStore} from "../stores/auth";
import {useAppStore} from "../stores/app";
import {useNavigationStore} from "../stores/navigation";
import {useRouter} from "vue-router";
import {reactive, provide, watch, onMounted} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const subscriptions = getSubscription();
        const router = useRouter();

        return ($vue) => (
            <Base
                modelName="AuthLayout"
                subscriptions={subscriptions}
                setup={(parent) => {
                    // region COLLECTIONS
                    const authUser = Collection.proxy("users", {
                        payload: {
                            name: "AuthUser",
                            data: reactive(useAuthStore().getUser()),
                        },
                    });

                    const authRoles = Collection.proxy("roles", {
                        payload: {
                            name: "AuthRoles",
                            data: reactive(useAuthStore().getRoles()),
                        },
                        parent: authUser,
                    });

                    const authSettings = Collection.proxy("settings", {
                        payload: {
                            name: "AuthSettings",
                            data: reactive(useAuthStore().getSettings()),
                        },
                        parent: authUser,
                    });

                    const appRoles = Collection.proxy("roles", {
                        payload: {
                            name: "AppRoles",
                            data: reactive(useAppStore().getRoles()),
                        },
                    });

                    const appSettings = Collection.proxy("settings", {
                        payload: {
                            name: "AppSettings",
                            data: reactive(useAppStore().getSettings()),
                        },
                    });

                    const collections = {
                        authUser,
                        authRoles,
                        authSettings,
                        appRoles,
                        appSettings,
                    };
                    // endregion

                    const logout = () => {
                        access(parent).subscriptions.removeSubscriptions();

                        useAppStore().$reset();
                        useAuthStore().$reset();
                        useNavigationStore().$reset();

                        signOut(getAuth());
                    };

                    const loadAuthUser = (auth) => {
                        const subscriptionName = `auth.${auth.uid}`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authUser.getDocument(auth.uid, (snapshot) => {
                                if (snapshot.exists()) {
                                    useAuthStore().$patch({user: snapshot.data()});
                                }
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthRoles = (user) => {
                        const subscriptionName = `auth.${user.id}.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authRoles.getDocuments({
                                callback: (snapshot) => {
                                    const roles = snapshot.docs.reduce((authRoles, authRole) => {
                                        const appRole = useAppStore().getRoles(authRole.id);

                                        return appRole ? authRoles.concat({
                                            ...authRole.data(),
                                            name: appRole.name,
                                        }) : authRoles;
                                    }, []);

                                    useAuthStore().$patch({roles});
                                },
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthSettings = (user) => {
                        const subscriptionName = `auth.${user.id}.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authSettings.getDocument(user.id, (snapshot) => {
                                if (snapshot.exists()) {
                                    useAuthStore().$patch({settings: snapshot.data()});
                                }
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAppRoles = () => {
                        const subscriptionName = `app.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).appRoles.getDocuments((snapshot) => {
                                useAppStore().$patch({roles: snapshot.docs.map((doc) => doc.data())});
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAppSettings = () => {
                        const subscriptionName = `app.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).appSettings.getDocument(1, (snapshot) => {
                                useAppStore().$patch({settings: snapshot.data()});
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const isUserHaveRoles = (roles) => {
                        const user = {roles: Array.isArray(roles) ? roles : [roles]};

                        return Boolean(useAuthStore().getRoles().find((role) => {
                            return user.roles.some((id) => (role.id === id));
                        }));
                    };

                    const self = Object.assign(collections, {logout, isUserHaveRoles});

                    provide("app", Object.assign(collections, {logout, isUserHaveRoles}));

                    onAuthStateChanged(getAuth(), (auth) => {
                        if (auth) {
                            loadAuthUser(auth);
                        } else {
                            access($vue).authUser.replaceData();
                            access(parent).subscriptions.removeSubscriptions();
                        }
                    });

                    onMounted(() => {
                        watch(() => useNavigationStore().to(), async (to, toBefore) => {
                            if (useAuthStore().authenticated()) {
                                await router.push(to.fullPath ?? useAuthStore().getSettings("path") ?? "/");
                            } else if (to.requiresAuth || toBefore?.requiresAuth) {
                                await router.push("/login");
                            }
                        }, {immediate: true, deep: true});

                        watch(() => useAuthStore().authenticated(), async (authenticated) => {
                            if (authenticated) {
                                if (useAppStore().getRoles("super")) {
                                    await router.push(useNavigationStore().to().fullPath ?? useAuthStore().getSettings("path") ?? "/");
                                } else {
                                    await router.push("/super/roles");
                                }
                            } else if (useNavigationStore().to().requiresAuth) {
                                await router.push("/login");
                            }
                        }, {immediate: true});

                        watch(authRoles.getData(), async () => {
                            if (!useAuthStore().authorized(router.currentRoute.value)) {
                                await router.push(`/user/${useAuthStore().getUser("id")}`);
                            }
                        });

                        watch(authUser.getData(), (user) => {
                            if (user.id) {
                                loadAppRoles();
                                loadAppSettings();
                                loadAuthRoles(user);
                                loadAuthSettings(user);
                            }
                        });

                        useAppStore().$subscribe((mutation) => {
                            if (mutation.payload?.settings) {
                                appSettings.replaceData(mutation.payload.settings);
                            }

                            if (mutation.payload?.roles) {
                                appRoles.replaceData(mutation.payload.roles);

                                useAuthStore().$patch({
                                    roles: useAuthStore().getRoles().reduce((authRoles, authRole) => {
                                        const appRole = useAppStore().getRoles(authRole.id);

                                        return appRole ? authRoles.concat({
                                            ...authRole,
                                            name: appRole.name,
                                        }) : authRoles;
                                    }, []),
                                });
                            }
                        });

                        useAuthStore().$subscribe((mutation) => {
                            if (mutation.payload?.user) {
                                authUser.replaceData(mutation.payload.user);
                            }

                            if (mutation.payload?.roles) {
                                authRoles.replaceData(mutation.payload.roles);
                            }

                            if (mutation.payload?.settings) {
                                authSettings.replaceData(mutation.payload.settings);
                            }
                        });
                    });

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
