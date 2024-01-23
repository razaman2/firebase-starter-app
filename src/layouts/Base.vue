<script lang="jsx">
import ReactiveVue, { setup } from "@razaman2/reactive-vue";
import { RouterView, useRoute } from "vue-router";

export default {
    props: {
        ...setup,
    },

    setup() {
        const route = useRoute();

        return ($vue) => (
            <ReactiveVue
                modelName="BaseLayout"
                class="h-screen flex flex-col"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <RouterView key={route.fullPath} />
                        );

                        return $vue.$slots.template?.({ $vue, vnode }) ?? vnode;
                    };

                    const vnodes = { template };
                    // endregion

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({ parent, self });
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
