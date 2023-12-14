<script lang="jsx">
import ReactiveVue, {setup} from "@razaman2/reactive-vue";
import AppLink from "./AppLink.vue";
import {useAuthStore} from "../stores/auth";
import {inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <ul class="hidden sm:flex sm:gap-4 font-semibold">
                                <li>
                                    <AppLink to="/super/roles">App Roles</AppLink>
                                </li>

                                <li>
                                    <AppLink to="/users">App Users</AppLink>
                                </li>

                                <li class={{"hidden": !useAuthStore().authenticated()}}>
                                    <AppLink to={`/user/${inject("app").authUser.getData("id")}`}>Auth User</AppLink>
                                </li>

                                <li>
                                    <AppLink to="/about">About</AppLink>
                                </li>

                                <li>
                                    <AppLink to="/list">List</AppLink>
                                </li>

                                <li class={{"hidden": useAuthStore().authenticated()}}>
                                    <AppLink to="/login">Login</AppLink>
                                </li>

                                <li class={{
                                    "hidden": !useAuthStore().authenticated(),
                                    "cursor-pointer text-red-500 hover:text-red-700 transition duration-200": true,
                                }} onClick={inject("app").logout}>
                                    Logout
                                </li>
                            </ul>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template};
                    // endregion

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
