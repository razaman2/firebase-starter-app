<script lang="jsx">
import {setup, access} from "@razaman2/reactive-view";
import Auth from "@layouts/Auth.vue";
import CustomDropdown from "@components/CustomDropdown.vue";
import CustomModal from "@components/CustomModal.vue";
import CustomInput from "@components/CustomInput.vue";
import {RouterLink} from "vue-router";
import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "@stores/auth";
import {useAppStore} from "@stores/app";
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
                                // onClick={() => {
                                //     useAppStore().showModal(
                                //         <CustomModal
                                //             defaultData={{firstName: "Jane", lastName: "Doe"}}
                                //             setup={(parent) => {
                                //                 // region TEMPLATE V-NODES
                                //                 const modalContent = () => {
                                //                     const vnode = (
                                //                         <div class="flex flex-col gap-y-1 px-4 py-2">
                                //                             <CustomInput placeholder="First Name" class="rounded" state={access(parent).getState.getData("firstName")} onUpdate:modelState={({after}) => {
                                //                                 access(parent).getState.setData("firstName", after);
                                //                             }}/>
                                //                             <CustomInput placeholder="Last Name" class="rounded" state={access(parent).getState.getData("lastName")} onUpdate:modelState={({after}) => {
                                //                                 access(parent).getState.setData("lastName", after);
                                //                             }}/>
                                //                         </div>
                                //                     );
                                //
                                //                     return $vue.$slots.modalContent?.({$vue, vnode}) ?? vnode;
                                //                 };
                                //
                                //                 const modalTitle = () => {
                                //                     const vnode = (
                                //                         <div class="font-extrabold font-mono">User Input</div>
                                //                     );
                                //
                                //                     return $vue.$slots.modalTitle?.({$vue, vnode}) ?? vnode;
                                //                 };
                                //
                                //                 const vnodes = {modalContent, modalTitle};
                                //                 // endregion
                                //
                                //                 const self = Object.assign(vnodes, {});
                                //
                                //                 return {parent, self};
                                //             }}
                                //         />,
                                //     );
                                // }}
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
                            <div class="bg-blue-200 p-4 flex justify-between items-baseline gap-x-10">
                                {access($vue).title()}

                                <div class="flex items-baseline gap-x-10">
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

                    const company = () => {
                        const vnode = (
                            <CustomDropdown
                                options={useAuthStore().authCompanies().getData()}
                                state={useAuthStore().authCompany().getData()}
                                onUpdate:modelState={({before, after}) => {
                                    if ((before.id && after.id) && (before.id !== after.id)) {
                                        useAuthStore().authCompany().replaceData(after);
                                    }
                                }}
                            />
                        );

                        return $vue.$slots.company?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, title, user, company, toolbar, icon};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
