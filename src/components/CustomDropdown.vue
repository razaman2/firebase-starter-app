<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";

export default {
    props: {
        ...setup,
        options: {
            type: Array,
            default: () => [],
        },
        optionName: {
            type: String,
            default: "name",
        },
        optionValue: {
            type: String,
            default: "id",
        },
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="dropdown dropdown-hover">
                                {access($vue).label()}

                                {access($vue).list()}
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const label = () => {
                        const vnode = (
                            <label
                                class="text-xl font-semibold cursor-pointer"
                                tabindex={0}
                            >
                                {access($vue).getState.getData($vue.optionName)}
                            </label>
                        );

                        return $vue.$slots.label?.({$vue, vnode}) ?? vnode;
                    };

                    const list = () => {
                        const vnode = (
                            <ul
                                class="menu rounded dropdown-content bg-slate-400/95 text-white z-50"
                                tabindex={0}
                            >
                                {$vue.options.map((item, index) => {
                                    return access($vue).item({item, index});
                                })}
                            </ul>
                        );

                        return $vue.$slots.list?.({$vue, vnode}) ?? vnode;
                    };

                    const item = ({item, index}) => {
                        const vnode = (
                            <li
                                key={index}
                                class={{
                                    "text-blue-500 font-bold": item.id === access($vue).getState.getData($vue.optionValue),
                                }}
                                onClick={() => {
                                    access($vue).getState.replaceData(item);
                                }}
                            >
                                <a>{item[$vue.optionName]}</a>
                            </li>
                        );

                        return $vue.$slots.item?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, label, list, item};
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
