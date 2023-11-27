<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import CustomButton from "../components/CustomButton.vue";
import CustomInput from "../components/CustomInput.vue";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import Swal from "sweetalert2";
import {computed, inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    modelName="LoginPage"
                    setup={(parent) => {
                        const isValid = computed(() => {
                            return (
                                access(parent).getState.getData("username", "").length
                                && (access(parent).getState.getData("password", "").length >= 6)
                            );
                        });

                        // region TEMPLATE V-NODES
                        const template = () => {
                            return (
                                <div class="h-full bg-blue-50 grid place-content-center">
                                    {inject("app").authUser.getData("id")
                                        ? access($vue).logoutForm()
                                        : access($vue).loginForm()}
                                </div>
                            );
                        };

                        const loginForm = () => {
                            const vnode = (
                                <div class="flex flex-col gap-y-3">
                                    <div class="flex flex-col gap-y-1">
                                        {access($vue).username()}

                                        {access($vue).password()}
                                    </div>

                                    {access($vue).login()}
                                </div>
                            );

                            return $vue.$slots.loginForm?.({$vue, vnode}) ?? vnode;
                        };

                        const logoutForm = () => {
                            const vnode = access($vue).logout();

                            return $vue.$slots.logoutForm?.({$vue, vnode}) ?? vnode;
                        };

                        const username = () => {
                            const vnode = (
                                <CustomInput
                                    type="email"
                                    class="rounded"
                                    debounce={import.meta.VITE_DEBOUNCE_AGGRESSIVE}
                                    placeholder="Username"
                                    state={access(parent).getState.getData("username")}
                                    onUpdate:modelState={({after}) => {
                                        access(parent).getState.setData({username: after});
                                    }}
                                />
                            );

                            return $vue.$slots.username?.({$vue, vnode}) ?? vnode;
                        };

                        const password = () => {
                            const vnode = (
                                <CustomInput
                                    type="password"
                                    class="rounded"
                                    debounce={import.meta.VITE_DEBOUNCE_AGGRESSIVE}
                                    placeholder="Password"
                                    state={access(parent).getState.getData("password")}
                                    onUpdate:modelState={({after}) => {
                                        access(parent).getState.setData({password: after});
                                    }}
                                />
                            );

                            return $vue.$slots.password?.({$vue, vnode}) ?? vnode;
                        };

                        const login = () => {
                            const vnode = (
                                <CustomButton
                                    disabled={!access($vue).isValid.value}
                                    label="login"
                                    class="bg-blue-500 disabled:bg-blue-500 hover:bg-blue-400"
                                    onClick={async () => {
                                        try {
                                            const {username, password} = access(parent).getState.getData();

                                            await signInWithEmailAndPassword(getAuth(), username, password);
                                        } catch (e) {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Login Failed!",
                                                text: e.message,
                                            });
                                        }
                                    }}
                                />
                            );

                            return $vue.$slots.login?.({$vue, vnode}) ?? vnode;
                        };

                        const logout = () => {
                            const vnode = (
                                <CustomButton
                                    label="logout"
                                    class="bg-red-500 disabled:bg-red-500 hover:bg-red-400"
                                    onClick={inject("app").logout}
                                />
                            );

                            return $vue.$slots.logout?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {
                            template,
                            username,
                            password,
                            login,
                            logout,
                            loginForm,
                            logoutForm,
                        };
                        // endregion

                        const self = Object.assign(vnodes, {isValid});

                        return $vue.setup({parent, self});
                    }}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
