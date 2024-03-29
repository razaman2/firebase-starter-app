<script lang="jsx">
import {setup, access} from "@razaman2/reactive-view";
import Auth from "@layouts/Auth.vue";
import {RouterLink} from "vue-router";
import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "@stores/auth";
import {useNavigationStore} from "@stores/navigation";

export default {
    props: {
        ...setup,
    },

    setup() {
        const route = useRoute();
        const router = useRouter();

        return ($vue) => (
            <Auth
                modelName="DefaultLayout"
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <CustomDrawer
                                state={useNavigationStore().get("drawer")}
                                onUpdate:modelState={({after}) => {
                                    useNavigationStore().set({drawer: after});
                                }}
                            >
                                {access($vue).toolbar()}
                                {access(parent).template()}
                            </CustomDrawer>
                        );

                        if (!route.meta.requiresAuth || (route.meta.requiresAuth && useAuthStore().authenticated())) {
                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        } else {
                            router.push("/login");
                        }
                    };

                    const toolbar = () => {
                        const vnode = (
                            <div class="bg-blue-200 p-4 flex flex-wrap justify-between items-center gap-x-10">
                                {access($vue).title()}

                                <div class="flex justify-between items-center gap-x-5">
                                    {access($vue).user()}
                                    {access($vue).icon()}
                                </div>
                            </div>
                        );

                        return $vue.$slots.toolbar?.({$vue, vnode}) ?? vnode;
                    };

                    const title = () => {
                        const vnode = (
                            <RouterLink
                                to="/"
                                class="font-bold"
                            >{import.meta.env.VITE_APP_NAME}</RouterLink>
                        );

                        return $vue.$slots.title?.({$vue, vnode}) ?? vnode;
                    };

                    const icon = () => {
                        const vnode = (
                            <label for="drawer-toggle">
                                <i-mdi-menu class="text-2xl cursor-pointer hover:scale-90 transition duration-500"/>
                            </label>
                        );

                        return $vue.$slots.icon?.({$vue, vnode}) ?? vnode;
                    };

                    const user = () => {
                        const {id, firstName, lastName} = useAuthStore().authUser().getData();

                        const vnode = (
                            <RouterLink
                                to={`/user/${id}`}
                                class={{
                                    "hidden": !useAuthStore().authenticated(),
                                    "italic": true,
                                }}
                            >{firstName} {lastName}</RouterLink>
                        );

                        return $vue.$slots.user?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, title, user, toolbar, icon};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
