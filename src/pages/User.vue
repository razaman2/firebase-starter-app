<script lang="jsx">
import {Collection, Updates, getCollectionRelationship} from "@razaman2/firestore-proxy";
import ReactiveVue, {setup, access, getProps} from "@razaman2/reactive-vue";
import CustomSelect from "@components/CustomSelect.vue";
import Roles from "@components/Roles.vue";
import Role from "@components/Role.vue";
import {getFirestore, writeBatch, arrayRemove, arrayUnion} from "firebase/firestore";
import {inject, ref, computed} from "vue";

const UserRole = {
    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    setup={(parent) => {
                        const rolesRef = ref();
                        const {authUser, authCompany, appRoles} = inject("app");

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
                                        options={appRoles.getData()}
                                    />

                                    <getAddButton.type
                                        {...getProps(getAddButton.props, "onClick")}
                                        onClick={async () => {
                                            const role = await Collection.proxy("roles", {
                                                creator: authUser,
                                            }).setParent(authUser).setDoc(access(rolesRef).getState.getData("id")).init();

                                            if (role.getData("id")) {
                                                const batch = writeBatch(getFirestore());

                                                await role.update({
                                                    batch,
                                                    update: (collection) => new Updates(collection),
                                                    data: {
                                                        belongsTo: arrayUnion(getCollectionRelationship(authCompany)),
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
                        const {authCompany} = inject("app");

                        const remove = async () => {
                            const batch = writeBatch(getFirestore());

                            await access(parent).getState.update({
                                batch,
                                data: {
                                    belongsTo: arrayRemove(getCollectionRelationship(authCompany)),
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
            <ReactiveVue
                modelName="UserPage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const {authUser, authRoles, authCompany} = inject("app");
                        const {firstName, lastName} = authUser.getData();

                        const vnode = (
                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="font-semibold text-2xl text-slate-500">{firstName} {lastName}</h5>

                                <Roles
                                    class="mt-5 space-y-2"
                                    model={authRoles}
                                    getDefaultDisplayComponent={UserRole}
                                    getDisplayComponent={NewRole}
                                    getItemProps={{
                                        model: (payload) => {
                                            return Collection.proxy("roles", {
                                                payload,
                                                creator: authUser,
                                                owners: [authCompany],
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
