<script lang="jsx">
import {Collection, Updates} from "@razaman2/firestore-proxy";
import ReactiveVue, {setup, access, getProps} from "@razaman2/reactive-vue";
import CustomSelect from "../components/CustomSelect.vue";
import Roles from "../components/Roles.vue";
import {inject, ref, computed} from "vue";

const UserRole = {
    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    setup={(parent) => {
                        const rolesRef = ref();

                        const isValid = computed(() => {
                            return access(rolesRef).getState?.getData("id");
                        });

                        // region TEMPLATE V-NODES
                        const template = () => {
                            const list = access($vue.$attrs.list());
                            const getAddButton = access(list).getAddButton();

                            const vnode = (
                                <div class="flex gap-x-1">
                                    <CustomSelect
                                        ref={rolesRef}
                                        class="rounded"
                                        placeholder="Add Role"
                                        options={inject("app").appRoles.getData()}
                                    />

                                    <getAddButton.type
                                        {...getProps(getAddButton.props, "onClick")}
                                        onClick={async () => {
                                            list.add(list.getDefaultComponent({
                                                id: access(rolesRef).getState.getData("id"),
                                            }));
                                        }}

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

                        const self = Object.assign(vnodes, {isValid});

                        return {parent, self};
                    }}
                />
            );
        };
    },
};

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="UserPage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const {firstName, lastName} = inject("app").authUser.getData();

                        const vnode = (
                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="font-semibold text-2xl text-slate-500">{firstName} {lastName}</h5>

                                <Roles
                                    class="mt-5 space-y-2"
                                    model={inject("app").authRoles}
                                    getDefaultDisplayComponent={UserRole}
                                    getItemProps={{
                                        model: (payload) => {
                                            return Collection.proxy("roles", {
                                                payload,
                                                creator: inject("app").authUser,
                                            }).setParent(inject("app").authUser).onWrite({
                                                handler: (collection) => new Updates(collection),
                                                triggers: ["create", "update", "delete"],
                                            });
                                        },
                                    }}
                                />
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
