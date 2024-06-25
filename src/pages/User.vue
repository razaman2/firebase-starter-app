<script lang="jsx">
import {Collection, Update} from "@razaman2/collection-proxy";
import ReactiveView, {setup, access, getProps} from "@razaman2/reactive-view";
import CustomSelect from "@components/CustomSelect.vue";
import Roles from "@components/Roles.vue";
import Role from "@components/Role.vue";
import {ref, computed} from "vue";
import {useAuthStore} from "@stores/auth";
import {useAppStore} from "@stores/app";
import {getFirestore, writeBatch, arrayRemove, arrayUnion} from "firebase/firestore";

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
                                            const role = await Collection.proxy("roles", {
                                                creator: useAuthStore().authUser(),
                                            }).setParent(useAuthStore().authUser()).setDoc(access(rolesRef).getState.getData("id")).init();

                                            if (role.getData("id")) {
                                                const batch = writeBatch(getFirestore());

                                                await role.update({
                                                    batch,
                                                    update: (collection) => new Update(collection),
                                                    data: {
                                                        belongsTo: arrayUnion(useAuthStore().authCompany().getDoc().path),
                                                    },
                                                });

                                                await batch.commit();
                                            } else {
                                                list.add(list.getDefaultComponent({
                                                    id: access(rolesRef).getState.getData("id"),
                                                }));
                                            }
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

const NewRole = {
    setup() {
        return ($vue) => {
            return (
                <Role
                    setup={(parent) => {
                        const remove = async () => {
                            const batch = writeBatch(getFirestore());

                            await access(parent).getState.update({
                                batch,
                                data: {
                                    belongsTo: arrayRemove(useAuthStore().authCompany().getDoc().path),
                                },
                            });

                            await batch.commit();
                        };

                        const self = {remove};

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
                        const {firstName, lastName} = useAuthStore().authUser().getData();

                        const vnode = (
                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="font-semibold text-2xl text-slate-500">{firstName} {lastName}</h5>

                                <Roles
                                    class="mt-5 space-y-2"
                                    model={useAuthStore().authRoles()}
                                    getDefaultDisplayComponent={UserRole}
                                    getDisplayComponent={NewRole}
                                    getItemProps={{
                                        model: (payload) => {
                                            return Collection.proxy("roles", {
                                                payload,
                                                creator: useAuthStore().authUser(),
                                                owners: [useAuthStore().authCompany()],
                                            }).setParent(useAuthStore().authUser()).onWrite({
                                                handler: (collection) => new Update(collection),
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
