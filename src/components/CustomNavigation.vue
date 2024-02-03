<script lang="jsx">
import ReactiveView, {setup} from "@razaman2/reactive-view";
import AppLink from "@components/AppLink.vue";
import {useAuthStore} from "@stores/auth";
import {getAuth} from "firebase/auth";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveView
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
                                    <AppLink to={`/user/${useAuthStore().authUser().getData("id")}`}>
                                        Auth User
                                    </AppLink>
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
                                }} onClick={() => getAuth().signOut()}>
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
