<script lang="jsx">
import {Collection, Updates} from "@razaman2/firestore-proxy";
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import {computed, inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="NewRole"
                setup={(parent) => {
                    const isValid = computed(() => {
                        return (
                            access(parent).getState.getData("name", "").length
                            && access(parent).getState.getData("id", "").length
                        );
                    });

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="flex flex-col gap-1">
                                {access($vue).roleName()}

                                {access($vue).roleIdentifier()}

                                {access($vue).saveButton()}
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const roleName = () => {
                        const vnode = (
                            <CustomInput
                                class="rounded"
                                placeholder="Role Name"
                                debounce={500}
                                state={access(parent).getState.getData("name")}
                                onUpdate:modelState={({after}) => {
                                    access(parent).getState.setData("name", after, false);
                                }}
                            />
                        );

                        return $vue.$slots.roleName?.({$vue, vnode}) ?? vnode;
                    };

                    const roleIdentifier = () => {
                        const vnode = (
                            <CustomInput
                                class="rounded"
                                placeholder="Role Identifier"
                                debounce={500}
                                state={access(parent).getState.getData("id")}
                                onUpdate:modelState={({after}) => {
                                    access(parent).getState.setData("id", after, false);
                                }}
                            />
                        );

                        return $vue.$slots.roleIdentifier?.({$vue, vnode}) ?? vnode;
                    };

                    const saveButton = () => {
                        const vnode = (
                            <CustomButton
                                class="bg-green-500 disabled:bg-green-500 hover:bg-green-400 mt-2"
                                disabled={!access($vue).isValid.value}
                                onClick={() => {
                                    access($vue.$attrs.list()).add($vue);
                                }}
                            >save</CustomButton>
                        );

                        return $vue.$slots.saveButton?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, roleName, roleIdentifier, saveButton};
                    // endregion

                    const self = Object.assign(vnodes, {isValid});

                    return $vue.setup({parent, self});
                }}
                model={(payload) => {
                    return Collection.proxy("roles", {
                        payload,
                        creator: inject("app").authUser,
                    }).onWrite({
                        handler: (collection) => new Updates(collection),
                        triggers: ["update", "delete"],
                    });
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
