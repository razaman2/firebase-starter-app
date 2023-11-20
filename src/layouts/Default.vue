<script lang="jsx">
import {setup, access} from "@razaman2/reactive-vue";
import Auth from "./Auth.vue";
import CustomNavigation from "../components/CustomNavigation.vue";
import {RouterLink} from "vue-router";
import {useAuthStore} from "../stores/auth";
import {useRoute} from "vue-router";

export default {
    props: {
        ...setup,
    },

    setup() {
        const route = useRoute();

        return ($vue) => (
            <Auth
                modelName="DefaultLayout"
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <div class={{
                                "hidden": (
                                    route.matched.some((to) => to.meta.requiresAuth)
                                    && !useAuthStore().authenticated()
                                ),
                            }}>
                                {access($vue).toolbar()}

                                {access(parent).template()}
                            </div>
                        );

                        return $vue.$slots.view?.({$vue, vnode}) ?? vnode;
                    };

                    const toolbar = () => {
                        const vnode = (
                            <div class="bg-blue-200 p-4 flex justify-between items-baseline gap-x-10">
                                {access($vue).title()}

                                <div class="flex items-baseline gap-x-10">
                                    {access($vue).navigation()}

                                    <div class="flex justify-between items-center gap-x-5">
                                        {access($vue).user()}

                                        {access($vue).icon()}
                                    </div>
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
                            >Vite App</RouterLink>
                        );

                        return $vue.$slots.title?.({$vue, vnode}) ?? vnode;
                    };

                    const navigation = () => {
                        const vnode = (
                            <CustomNavigation/>
                        );

                        return $vue.$slots.navigation?.({$vue, vnode}) ?? vnode;
                    };

                    const icon = () => {
                        const vnode = (
                            <i-mdi-menu
                                class="text-2xl cursor-pointer hover:scale-90 transition duration-500"
                            />
                        );

                        return $vue.$slots.icon?.({$vue, vnode}) ?? vnode;
                    };

                    const user = () => {
                        const {firstName, lastName} = access(parent).authUser.getData();

                        const vnode = (
                            <RouterLink
                                to={`/user/${access(parent).authUser.getData("id")}`}
                                class={{
                                    "tw-hidden": !useAuthStore().authenticated(),
                                    "tw-italic": true,
                                }}
                            >{firstName} {lastName}</RouterLink>
                        );

                        return $vue.$slots.user?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, title, user, navigation, toolbar, icon};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
