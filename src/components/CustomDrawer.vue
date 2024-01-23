<script lang="jsx">
import ReactiveVue, { setup, access } from "@razaman2/reactive-vue";
import CustomInput from "@components/CustomInput.vue";
import CustomButton from "@components/CustomButton.vue";
import AppLink from "@components/AppLink.vue";
import { inject } from "vue";

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
        const { logout } = inject("app");

        return ($vue) => (
            <ReactiveVue
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
                                        <li class="mb-3">
                                            <CustomButton
                                                class="bg-red-500 hover:bg-red-400"
                                                onClick={logout}
                                            >logout</CustomButton>
                                        </li>

                                        <li>
                                            <AppLink to="/">Home</AppLink>
                                        </li>

                                        <li>
                                            <AppLink to="/list">List</AppLink>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        );

                        return $vue.$slots.template?.({ $vue, vnode }) ?? vnode;
                    };

                    const vnodes = { template };

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({ parent, self });
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>

