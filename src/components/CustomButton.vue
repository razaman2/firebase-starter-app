<script lang="jsx">
import ReactiveView, { setup } from "@razaman2/reactive-view";

export default {
    props: {
        ...setup,
        label: {
            validator: (label) => {
                return /String|Number/.test(label.constructor.name);
            },
        },
        tag: {
            type: String,
            default: "button",
        },
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveView
                    modelName="CustomButton"
                    setup={(parent) => {
                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <$vue.tag class="btn text-white disabled:text-white disabled:opacity-60 uppercase">
                                    {$vue.$slots.default?.() ?? $vue.label}
                                </$vue.tag>
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
        };
    },
};
</script>
