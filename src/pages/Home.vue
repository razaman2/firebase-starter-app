<script lang="jsx">
import ReactiveVue, {setup} from "@razaman2/reactive-vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="HomePage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="h-full bg-slate-50 p-4 items-center">
                                <h1 class="text-2xl text-slate-500 text-center border">Home Page</h1>
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
