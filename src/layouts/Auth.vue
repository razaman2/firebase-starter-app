<script lang="jsx">
import "@src/firebase-init-firestore";
import {Collection} from "@razaman2/collection-proxy";
import ObjectManager from "@razaman2/object-manager";
import {setup, access} from "@razaman2/reactive-view";
import Base from "@layouts/Base.vue";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {query, where} from "firebase/firestore";
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

                    const resolveAuthCompanies = (companies) => {
                        return companies.reduce((authCompanies, authCompany) => {
                            const appCompany = useAppStore().getCompanies(authCompany.id) ?? {};

                            return appCompany.id ? authCompanies.concat(appCompany) : authCompanies;
                        }, []);
                    };

                    const loadAuthUser = (auth) => {
                        const subscriptionName = `auth.${auth.uid}`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authUser().getDocument(auth.uid);

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthCompany = (companies) => {
                        if (companies.length === 1) {
                            useAuthStore().authCompany().replaceData(companies[0]);
                        }
                    };

                    const loadAuthCompanies = (user) => {
                        const subscriptionName = `auth.${user.id}.companies`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authCompanies().getDocuments((snapshot) => {
                                const companies = snapshot.docs.map((doc) => doc.data());

                                useAuthStore().authCompanies().replaceData(resolveAuthCompanies(companies));
                                useAuthStore().$patch({settings: {user: companies}});
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthRoles = (user, company) => {
                        const subscriptionName = `auth.${user.id}.company.${company.id}.roles`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authRoles().getDocuments({
                                query: (ref) => {
                                    return query(
                                        ref,
                                        where("belongsTo", "array-contains", `${company.id} companies`),
                                    );
                                },
                                callback: (snapshot, collection) => {
                                    collection.replaceData(resolveAuthRoles(snapshot.docs.map((doc) => doc.data())));
                                },
                            });

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAuthCompanySettings = (company) => {
                        const subscriptionName = `company.${company.id}.settings`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAuthStore().authCompanySettings().setParent(Collection.proxy("companies").setDoc(company.id)).getDocument(company.id);

                            access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                        }
                    };

                    const loadAppCompanies = () => {
                        const subscriptionName = `app.companies`;

                        if (!access(parent).subscriptions.hasSubscription(subscriptionName)) {
                            const subscription = useAppStore().appCompanies().getDocuments();

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

                        // watch(() => useAppStore().appRoles().getData(), (roles) => {
                        //     if (roles.length) {
                        //         useAuthStore().authRoles().getDocuments({
                        //             realtime: false,
                        //             callback: (snapshot, collection) => {
                        //                 collection.replaceData(resolveAuthRoles(snapshot.docs.map((doc) => doc.data())));
                        //             },
                        //         });
                        //     }
                        // }, {deep: true} /*{deep: true} is required here.*/);

                        // watch(useAppStore().appCompanies().getData(), (companies) => {
                        //     if (companies.length) {
                        //         useAuthStore().authCompanies().getDocuments({
                        //             realtime: false,
                        //             callback: (snapshot) => {
                        //                 const companies = snapshot.docs.map((doc) => doc.data());
                        //
                        //                 useAuthStore().authCompanies().replaceData(resolveAuthCompanies(companies));
                        //                 useAuthStore().$patch({settings: {user: companies}});
                        //             },
                        //         });
                        //     }
                        // }, {deep: true} /*{deep: true} is required here.*/);

                        watch(() => ObjectManager.on(useAuthStore().authCompanies().getData()).clone(), (companies, companiesBefore) => {
                            if (companiesBefore.length !== companies.length) {
                                loadAuthCompany(companies);
                            }
                        });

                        watch(() => ObjectManager.on(useAuthStore().authCompany().getData()).clone(), (company, companyBefore) => {
                            // reload app when auth-company changes to allow the proper initialization of company resources
                            if ((company.id && companyBefore?.id) && (company.id !== companyBefore.id)) {
                                const {name, params, fullPath} = useNavigationStore().to();

                                (name === "company")
                                    ? router.push(fullPath.replace(params.id, company.id))
                                    : location.replace(fullPath);
                            } else if (company.id && useAuthStore().authUser().getData("id")) {
                                // load auth roles for the authenticated company
                                loadAuthRoles(useAuthStore().authUser().getData(), company);

                                // load auth settings for the authenticated company
                                useAuthStore().authSettings().replaceData(useAuthStore().getSettings(company.id));

                                // load company settings for the authenticated company
                                loadAuthCompanySettings(company);
                            }
                        }, {immediate: true});

                        watchEffect(() => {
                            const user = useAuthStore().authUser().getData();

                            if (user.id) {
                                loadAppRoles();
                                loadAppCompanies();
                                loadAppSettings();
                                loadAuthCompanies(user);
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
