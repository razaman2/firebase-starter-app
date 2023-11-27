<script lang="jsx">
import {Collection} from "@razaman2/firestore-proxy";
import ReactiveVue, {setup, access, getProps} from "@razaman2/reactive-vue";
import CustomButton from "../components/CustomButton.vue";
import CustomSelect from "../components/CustomSelect.vue";
import Roles from "./Roles.vue";
import {useRouter} from "vue-router";
import {inject, ref} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const router = useRouter();

        return ($vue) => (
            <ReactiveVue
                modelName="UserPage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const {firstName, lastName} = inject("app").authUser.getData();

                        const vnode = (
                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="m-0">{firstName} {lastName}</h5>

                                <Roles
                                    model={(payload) => {
                                        return Collection.proxy("roles", {payload}).setParent(inject("app").authUser);
                                    }}
                                    getDefaultDisplayComponent={{
                                        setup() {
                                            const rolesRef = ref();

                                            return ($vue) => {
                                                const list = access($vue.$attrs.list());
                                                const getAddButton = access(list).getAddButton();

                                                return (
                                                    <ReactiveVue
                                                        setup={(parent) => {
                                                            // region TEMPLATE V-NODES
                                                            const template = () => {
                                                                const vnode = (
                                                                    <div class="flex gap-x-1">
                                                                        <CustomSelect
                                                                            ref={rolesRef}
                                                                            class="rounded"
                                                                            options={inject("app").appRoles.getData()}
                                                                        />

                                                                        <getAddButton.type
                                                                            {...getProps(getAddButton.props, "onClick")}
                                                                            onClick={async () => {
                                                                                list.add(list.getDefaultComponent({
                                                                                    id: access(rolesRef).getState.getData("id"),
                                                                                }));
                                                                            }}
                                                                            disabled={!access(rolesRef).getState?.getData("id")}

                                                                            v-slots={getAddButton.children}
                                                                        >
                                                                            save
                                                                        </getAddButton.type>
                                                                    </div>
                                                                );

                                                                return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                                                            };

                                                            const vnodes = {template};
                                                            // endregion

                                                            const self = Object.assign(vnodes, {});

                                                            return {parent, self};
                                                        }}
                                                        model={(payload) => {
                                                            return Collection.proxy("roles", {payload}).setParent(inject("app").authUser);
                                                        }}
                                                    />
                                                );
                                            };
                                        },
                                    }}
                                />

                                <div class="flex gap-x-1 mt-5">
                                    <CustomButton
                                        label="logout"
                                        class="bg-red-500 disabled:bg-red-400 hover:bg-red-400"
                                        onClick={inject("app").logout}
                                    />

                                    <CustomButton
                                        label="unauthorized"
                                        class="bg-orange-500 disabled:bg-orange-400 hover:bg-orange-400"
                                        onClick={() => router.push("/unauthorized")}
                                    />
                                </div>
                            </div>
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
