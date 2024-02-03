<script lang="jsx">
import {setup, access} from "@razaman2/reactive-view";
import Base from "@layouts/Base.vue";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useAuthStore} from "@stores/auth";
import {useAppStore} from "@stores/app";
import {useNavigationStore} from "@stores/navigation";
import {useRouter} from "vue-router";
import {watch, watchEffect, onMounted} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const router = useRouter();

        return ($vue) => (
            <Base
                modelName="AuthLayout"
                setup={(parent) => {
                    const resolveAuthRoles = (roles) => {
                        return roles.reduce((authRoles, authRole) => {
                            const appRole = useAppStore().getRoles(authRole.id);

                            return appRole ? authRoles.concat({
                                ...authRole,
                                name: appRole.name,
                            }) : authRoles;
                        }, []);
                    };

                    const loadAuthUser = (auth) => {
                        const subscriptionName = `auth.${auth.uid}`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authUser().getDocument(auth.uid);

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthRoles = (user) => {
                        const subscriptionName = `auth.${user.id}.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authRoles().getDocuments((snapshot, collection) => {
                                collection.replaceData(resolveAuthRoles(snapshot.docs.map((doc) => doc.data())));
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthSettings = (user) => {
                        const subscriptionName = `auth.${user.id}.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authSettings().getDocument(user.id);

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAppRoles = () => {
                        const subscriptionName = `app.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAppStore().appRoles().getDocuments();

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAppSettings = () => {
                        const subscriptionName = `app.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAppStore().appSettings().getDocument(import.meta.env.VITE_APP_SETTINGS);

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    onAuthStateChanged(getAuth(), (auth) => {
                        if (auth) {
                            loadAuthUser(auth);
                        } else if (useAuthStore().authUser().getData("id")) {
                            access(parent).subscriptions.removeSubscriptions();

                            useAppStore().$reset();
                            useAuthStore().$reset();
                            useNavigationStore().$reset();
                        }
                    });

                    onMounted(() => {
                        watch(() => useNavigationStore().to(), (to, toBefore) => {
                            if (useAuthStore().authenticated()) {
                                router.push(to.fullPath ?? useAuthStore().authSettings().getData("path") ?? "/");
                            } else if (to.meta.requiresAuth || toBefore?.meta.requiresAuth) {
                                router.push("/login");
                            }
                        });

                        watch(() => useAuthStore().authenticated(), (authenticated) => {
                            if (authenticated) {
                                if (useAppStore().getRoles("super")) {
                                    router.push(useNavigationStore().to().fullPath ?? useAuthStore().authSettings().getData("path") ?? "/");
                                } else {
                                    router.push("/super/roles");
                                }
                            } else if (useNavigationStore().to().meta.requiresAuth) {
                                router.push("/login");
                            }
                        });

                        watch(useAuthStore().authRoles().getData(), () => {
                            if (!useAuthStore().authorized(router.currentRoute.value)) {
                                router.push(`/user/${useAuthStore().authUser().getData("id")}`);
                            }
                        });

                        watch(() => useAppStore().appRoles().getData(), (roles) => {
                            if (roles.length) {
                                useAuthStore().authRoles().getDocuments({
                                    realtime: false,
                                    callback: (snapshot, collection) => {
                                        collection.replaceData(resolveAuthRoles(snapshot.docs.map((doc) => doc.data())));
                                    },
                                });
                            }
                        }, {deep: true} /*{deep: true} is required here.*/);

                        watchEffect(() => {
                            const user = useAuthStore().authUser().getData();

                            if (user.id) {
                                loadAppRoles();
                                loadAppSettings();
                                loadAuthRoles(user);
                                loadAuthSettings(user);
                            }
                        });
                    });

                    return $vue.setup({parent});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
