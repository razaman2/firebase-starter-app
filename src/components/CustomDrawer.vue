<script lang="jsx">
import ReactiveView, {setup, access} from "@razaman2/reactive-view";
import CustomInput from "@components/CustomInput.vue";
import CustomButton from "@components/CustomButton.vue";
import AppLink from "@components/AppLink.vue";
import CustomCollapse from "@components/CustomCollapse.vue";
import {getAuth} from "firebase/auth";
import {useNavigationStore} from "@stores/navigation";
import {useAuthStore} from "@stores/auth";

export default {
    props: {
        ...setup,
        side: {
            type: String,
            default: "right",
            validator: (side) => {
                return ["left", "right"].includes(side);
            },
        },
    },

    setup() {
        return ($vue) => (
            <ReactiveView
                modelName="Drawer"
                defaultData={false}
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <div class={{
                                "drawer": true,
                                "drawer-end": ($vue.side === "right"),
                            }}>
                                <CustomInput
                                    id="drawer-toggle"
                                    type="checkbox"
                                    class="drawer-toggle"
                                    state={access(parent).getState.getData()}
                                />

                                <div class="drawer-content h-full flex flex-col">
                                    {$vue.$slots.default?.() ?? "No Content"}
                                </div>

                                <div class="drawer-side">
                                    <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay" />

                                    <ul class="menu w-80 min-h-full bg-base-200/90 text-base-content">
                                        <CustomButton
                                            class="bg-red-500 hover:bg-red-400 mb-3"
                                            onClick={() => getAuth().signOut()}
                                        >logout</CustomButton>

                                        <li>
                                            <AppLink to="/">Home</AppLink>
                                        </li>

                                        <li>
                                            <AppLink to={`/user/${useAuthStore().authUser().getData("id")}`}>User</AppLink>
                                        </li>

                                        <li>
                                            <AppLink to="/list">List</AppLink>
                                        </li>

                                        <li>
                                            <CustomCollapse
                                                title="Admin"
                                                class="hover:bg-transparent"
                                                contentClass="px-4 pb-4"
                                                opened={useNavigationStore().get("admin")}
                                                onUpdate:modelState={({after}) => {
                                                    useNavigationStore().set({admin: after.open});
                                                }}
                                            >
                                                <li>
                                                    <AppLink to="/users">Users</AppLink>
                                                </li>
                                                <li>
                                                    <AppLink to="/admin/accounts">Accounts</AppLink>
                                                </li>
                                                <li>
                                                    <AppLink to="/admin/products">Products</AppLink>
                                                </li>
                                            </CustomCollapse>
                                        </li>

                                        <li>
                                            <CustomCollapse
                                                title="Super"
                                                class="hover:bg-transparent"
                                                contentClass="px-4 pb-4"
                                                opened={useNavigationStore().get("super")}
                                                onUpdate:modelState={({after}) => {
                                                    useNavigationStore().set({super: after.open});
                                                }}
                                            >
                                                <li>
                                                    <AppLink to="/development">Development</AppLink>
                                                </li>
                                                <li>
                                                    <AppLink to="/super/roles">Roles</AppLink>
                                                </li>
                                            </CustomCollapse>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>

