<script lang="jsx">
import ReactiveVue, {setup} from "@razaman2/reactive-vue";

export default {
    props: {
        ...setup,
        label: {
            validator: (label) => {
                return /String|Number/.test(label.constructor.name);
            },
        },
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    modelName="CustomButton"
                    setup={(parent) => {
                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <button class="btn text-white disabled:text-white disabled:opacity-60 uppercase">
                                    {$vue.$slots.default?.() ?? $vue.label}
                                </button>
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
