<script lang="jsx">
import ReactiveVue, {setup} from "@razaman2/reactive-vue";
import {RouterLink} from "vue-router";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    modelName="AppLink"
                    setup={(parent) => {
                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <RouterLink
                                    exactActiveClass="text-blue-500"
                                    class="hover:text-blue-700 transition duration-200"
                                >
                                    {$vue.$slots.default()}
                                </RouterLink>
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
        };
    },
};
</script>
