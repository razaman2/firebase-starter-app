<script lang="jsx">
import "../firebase-init-firestore";
import {Collection} from "@razaman2/firestore-proxy";
import ObjectManager from "@razaman2/object-manager";
import {setup, access, getSubscription} from "@razaman2/reactive-vue";
import Base from "./Base.vue";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {query, where} from "firebase/firestore";
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

                    const authCompany = Collection.proxy("companies", {
                        payload: {
                            name: "AuthCompany",
                            data: reactive(useAuthStore().getCompany()),
                        },
                        parent: authUser,
                    });

                    const authCompanies = Collection.proxy("settings", {
                        payload: {
                            name: "AuthCompanies",
                            data: reactive(useAuthStore().getCompanies()),
                        },
                        parent: authUser,
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
                            data: reactive(useAuthStore().getSettings("auth.user")),
                        },
                        parent: authUser,
                    });

                    const authCompanySettings = Collection.proxy("settings", {
                        payload: {
                            name: "AuthCompanySettings",
                            data: reactive(useAuthStore().getSettings("auth.company")),
                        },
                    });

                    const appRoles = Collection.proxy("roles", {
                        payload: {
                            name: "AppRoles",
                            data: reactive(useAppStore().getRoles()),
                        },
                    });

                    const appCompanies = Collection.proxy("companies", {
                        payload: {
                            name: "AppCompanies",
                            data: reactive(useAppStore().getCompanies()),
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
                        authCompany,
                        authCompanies,
                        authRoles,
                        authSettings,
                        authCompanySettings,
                        appRoles,
                        appCompanies,
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

                    const loadAuthCompanies = (user) => {
                        const subscriptionName = `auth.${user.id}.companies`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authCompanies.getDocuments((snapshot) => {
                                useAuthStore().$patch([1].reduce((auth) => {
                                    auth.settings.user.forEach((settings) => {
                                        auth.companies = auth.companies.concat(useAppStore().getCompanies(settings.id));
                                    });

                                    return auth;
                                }, {companies: [], settings: {user: snapshot.docs.map((doc) => doc.data())}}));
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthRoles = (user, company) => {
                        const subscriptionName = `auth.${user.id}.company.${company.id}.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authRoles.getDocuments({
                                query: (ref) => {
                                    return query(
                                        ref,
                                        where("belongsTo", "array-contains", `${company.id} companies`),
                                    );
                                },
                                callback: (snapshot) => {
                                    if (!snapshot.empty) {
                                        const roles = snapshot.docs.reduce((authRoles, authRole) => {
                                            const appRole = useAppStore().getRoles(authRole.id);

                                            return appRole ? authRoles.concat({
                                                ...authRole.data(),
                                                name: appRole.name,
                                            }) : authRoles;
                                        }, []);

                                        useAuthStore().$patch({roles});
                                    }
                                },
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthCompany = (companies) => {
                        // select auth company when user only has one.
                        if (companies.length === 1) {
                            useAuthStore().$patch({company: useAppStore().getCompanies(useAuthStore().getSettings("user.0.id"))});
                        } else if (useAuthStore().getCompany("id") && authCompany.getData("id")) {
                            authCompany.replaceData(useAppStore().getCompanies(useAuthStore().getCompany("id")));
                        }
                    };

                    const loadAuthCompanySettings = (company) => {
                        const _company = Collection.proxy("companies").setDoc(company.id);
                        const subscriptionName = `company.${_company.getDoc().id}.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).authCompanySettings.setParent(_company).getDocument(_company.getDoc().id, (snapshot) => {
                                useAuthStore().$patch({
                                    settings: {
                                        auth: {
                                            company: snapshot.data(),
                                            user: useAuthStore().getSettings("user").find((settings) => {
                                                return settings.id === snapshot.id;
                                            }) ?? {},
                                        },
                                    },
                                });
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

                    const loadAppCompanies = () => {
                        const subscriptionName = `app.companies`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = access($vue).appCompanies.getDocuments((snapshot) => {
                                useAppStore().$patch({companies: snapshot.docs.map((doc) => doc.data())});
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
                            access($vue).authCompany.replaceData();
                            access(parent).subscriptions.removeSubscriptions();
                        }
                    });

                    onMounted(() => {
                        watch(() => useNavigationStore().to(), async (to, toBefore) => {
                            if (useAuthStore().authenticated()) {
                                await router.push(to.fullPath
                                    ?? useAuthStore().getSettings("auth.user.path")
                                    ?? "/");
                            } else if (to.requiresAuth || toBefore?.requiresAuth) {
                                await router.push("/login");
                            }
                        }, {immediate: true, deep: true});

                        watch(() => useAuthStore().authenticated(), async (authenticated) => {
                            if (authenticated) {
                                await router.push(useNavigationStore().to().fullPath
                                    ?? useAuthStore().getSettings("auth.user.path")
                                    ?? "/");
                            } else if (useNavigationStore().to().requiresAuth) {
                                await router.push("/login");
                            }
                        }, {immediate: true});

                        watch(appCompanies.getData(), () => {
                            loadAuthCompanies(authUser.getData());

                            useAuthStore().$patch({
                                companies: useAuthStore().getCompanies().reduce((companies, company) => {
                                    return company
                                        ? companies.concat(useAppStore().getCompanies(company.id))
                                        : companies;
                                }, []),
                            });
                        });

                        watch(authCompanies.getData(), (companies) => {
                            loadAuthCompany(companies);
                        });

                        watch(authUser.getData(), (user) => {
                            if (user.id) {
                                loadAppRoles();
                                loadAppCompanies();
                                loadAppSettings();
                            }
                        });

                        watch(() => {
                            return [ObjectManager.on(authCompany.getData()).clone(), authUser.getData()];
                        }, ([company, user], [companyBefore]) => {
                            // reload app when auth-company changes to allow the proper initialization of company resources
                            if (company.id && companyBefore?.id && (company.id !== companyBefore.id)) {
                                location.replace(`${useNavigationStore().to().fullPath}`);
                            } else if (company.id && user.id) {
                                // load company settings for the auth-company
                                loadAuthCompanySettings(company);

                                // load auth-roles for auth-company
                                loadAuthRoles(user, company);
                            }
                        });

                        useAppStore().$subscribe((mutation) => {
                            if (mutation.payload?.companies) {
                                appCompanies.replaceData(mutation.payload.companies);
                            }

                            if (mutation.payload?.settings) {
                                appSettings.replaceData(mutation.payload.settings);
                            }

                            if (mutation.payload?.roles) {
                                appRoles.replaceData(mutation.payload.roles);
                            }
                        });

                        useAuthStore().$subscribe((mutation, state) => {
                            if (mutation.payload?.user) {
                                authUser.replaceData(mutation.payload.user);
                            }

                            if (mutation.payload?.company) {
                                authCompany.replaceData(mutation.payload.company);
                            }

                            if (mutation.payload?.companies) {
                                authCompanies.replaceData(mutation.payload.companies);
                            }

                            if (mutation.payload?.roles) {
                                authRoles.replaceData(mutation.payload.roles);
                            }

                            if (mutation.payload?.settings?.auth?.user) {
                                authSettings.replaceData(mutation.payload.settings.auth.user);
                            }

                            if (mutation.payload?.settings?.auth?.company) {
                                authCompanySettings.replaceData(mutation.payload.settings.auth.company);
                            }

                            if (mutation.payload?.settings?.user) {
                                // update users auth setting whenever a user setting changes
                                const settings = mutation.payload.settings.user.find((settings) => {
                                    return settings.id === state.company.id;
                                });

                                if (settings && state.settings.auth.user.id) {
                                    useAuthStore().$patch({
                                        settings: {
                                            auth: {user: settings},
                                        },
                                    });
                                }
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
