<script lang="jsx">
import {Collection, Updates} from "@razaman2/collection-proxy";
import ReactiveView, {setup, access, getProps} from "@razaman2/reactive-view";
import CustomSelect from "@components/CustomSelect.vue";
import Roles from "@components/Roles.vue";
import {ref, computed} from "vue";
import {useAuthStore} from "@stores/auth";
import {useAppStore} from "@stores/app";

const UserRole = {
    setup() {
        return ($vue) => {
            return (
                <ReactiveView
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
                                        options={useAppStore().appRoles().getData()}
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
            <ReactiveView
                modelName="UserPage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const authUser = useAuthStore().authUser();
                        const authRoles = useAuthStore().authRoles();

                        const {firstName, lastName} = authUser.getData();

                        const vnode = (
                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="font-semibold text-2xl text-slate-500">{firstName} {lastName}</h5>

                                <Roles
                                    class="mt-5 space-y-2"
                                    model={authRoles}
                                    getDefaultDisplayComponent={UserRole}
                                    getItemProps={{
                                        model: (payload) => {
                                            return Collection.proxy("roles", {
                                                payload,
                                                creator: authUser,
                                            }).setParent(authUser).onWrite({
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
