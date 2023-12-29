<script lang="jsx">
import {setup, access} from "@razaman2/reactive-vue";
import Auth from "@layouts/Auth.vue";
import CustomDropdown from "@components/CustomDropdown.vue";
import CustomNavigation from "@components/CustomNavigation.vue";
import {RouterLink} from "vue-router";
import {useAuthStore} from "@stores/auth";
import Swal from "sweetalert2";
import {useRoute, useRouter} from "vue-router";

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
                            <div>
                                {access($vue).toolbar()}

                                {access(parent).template()}
                            </div>
                        );

                        if (!route.meta.requiresAuth || (route.meta.requiresAuth && useAuthStore().authenticated())) {
                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        } else {
                            router.push("/login");
                        }
                    };

                    const toolbar = () => {
                        const vnode = (
                            <div class="bg-blue-200 p-4 flex justify-between items-baseline gap-x-10">
                                {access($vue).title()}

                                <div class="flex items-baseline gap-x-10">
                                    {access($vue).navigation()}

                                    <div>
                                        <div class="flex justify-between items-center gap-x-5">
                                            {access($vue).user()}

                                            {access($vue).icon()}
                                        </div>

                                        {access($vue).company()}
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
                            >{import.meta.env.VITE_APP_NAME}</RouterLink>
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
                                onClick={async () => {
                                    await Swal.fire({
                                        title: "Right sidebar 👋",
                                        html: `<div id="right-drawer">drawer</div>`,
                                        position: "top-end",
                                        grow: "column",
                                        width: 500,
                                        showConfirmButton: false,
                                        showCloseButton: true,
                                    });
                                }}
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

                    const company = () => {
                        const vnode = (
                            <CustomDropdown
                                options={access($vue).authCompanies.getData()}
                                state={access($vue).authCompany.getData()}
                                onUpdate:modelState={({before, after}) => {
                                    if ((before.id && after.id) && (before.id !== after.id)) {
                                        useAuthStore().$patch({company: after});
                                    }
                                }}
                            />
                        );

                        return $vue.$slots.company?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, title, user, company, navigation, toolbar, icon};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
