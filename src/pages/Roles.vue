<script lang="jsx">
import {setup, access, getSubscription} from "@razaman2/reactive-vue";
import NewRole from "../components/NewRole.vue";
import Role from "../components/Role.vue";
import {ref, inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const rolesRef = ref();
        const subscriptions = getSubscription();

        return ($vue) => {
            return (
                <List
                    ref={rolesRef}
                    subscriptions={subscriptions}
                    modelName="AppRoles"
                    class="p-4 space-y-2"
                    getDisplayComponent={Role}
                    getDefaultDisplayComponent={NewRole}
                    // getItemProps={{
                    //     setup: (parent) => {
                    //         const template = () => {
                    //             const template = access(parent).template();
                    //
                    //             const vnode = (
                    //                 rolesRef.value?.access().isDefaultComponent(parent) ?
                    //                     <NewRole/> : template
                    //             );
                    //
                    //             return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    //         };
                    //
                    //         const self = {template};
                    //
                    //         return {parent, self};
                    //     },
                    // }}
                    onItemAdding={({component}) => {
                        if (component) {
                            access(component).getState.create();
                        } else {
                            return true;
                        }
                    }}
                    onItemDeleting={({component}) => {
                        if (component) {
                            access(component).getState.remove();
                        } else {
                            return true;
                        }
                    }}
                    model={inject("app").appRoles}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
