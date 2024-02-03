<script lang="jsx">
import {Collection} from "@razaman2/collection-proxy";
import ReactiveView, {setup, access} from "@razaman2/reactive-view";
import List from "@components/List.vue";
import {onMounted, onBeforeUnmount} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <List
                modelName="Users"
                class="flex flex-col gap-y-1 m-4"
                getDefaultDisplayComponent={false}
                getDisplayComponent={{
                    setup() {
                        return ($vue) => {
                            return (
                                <ReactiveView
                                    setup={(parent) => {
                                        const {firstName, lastName} = access(parent).getState.getData();

                                        // region TEMPLATE V-NODES
                                        const template = () => {
                                            const vnode = (
                                                <div class="bg-slate-500 text-white p-4">{firstName} {lastName}</div>
                                            );

                                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                                        };

                                        const vnodes = {template};
                                        // endregion

                                        const self = Object.assign(vnodes, {});

                                        return {parent, self};
                                    }}
                                />
                            );
                        };
                    },
                }}
                setup={(parent) => {
                    // region TEMPLATE V-NODES

                    const vnodes = {};
                    // endregion

                    const self = Object.assign(vnodes, {});

                    onMounted(() => {
                        const subscriptionName = "app-users";
                        const subscription = access(parent).getState.getDocuments();

                        access(parent).subscriptions.addSubscription(subscriptionName, subscription);
                    });

                    onBeforeUnmount(() => {
                        access(parent).subscriptions.removeSubscriptions();
                    });

                    return $vue.setup({parent, self});
                }}
                model={(payload) => {
                    return Collection.proxy("users", {payload});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
