<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import {computed} from "vue";

export default {
    props: {
        ...setup,
        options: {
            type: Array,
            default: () => [],
        },
        optionLabel: {
            type: String,
            default: "name",
        },
        optionValue: {
            type: String,
            default: "id",
        },
        optionProperty: {
            type: String,
        },
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="CustomSelect"
                setup={(parent) => {
                    const _default = computed(() => {
                        return [
                            {
                                [$vue.optionLabel]: $vue.$attrs.placeholder ?? "None",
                                [$vue.optionValue]: "${cleared}",
                            },
                        ];
                    });

                    const getName = (option) => option?.[$vue.optionLabel] ?? option;

                    const getValue = (option) => option?.[$vue.optionValue] ?? option;

                    const getProperty = (option) => {
                        try {
                            return /Object/.test(option.constructor.name)
                                ? $vue.optionProperty
                                    ? option[$vue.optionProperty]
                                    : option
                                : option;
                        } catch {
                            return option;
                        }
                    };

                    const getSelected = (option) => {
                        const data = access(parent).getState.getData();

                        return (
                            access($vue).getValue(option) === access($vue).getValue(data) ||
                            option === data
                        );
                    };

                    const findOption = (target) => {
                        return $vue.options.find((option) => {
                            return (
                                access($vue).getValue(option) ===
                                access($vue).getValue(target) || option === target
                            );
                        });
                    };

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <select
                                class="w-full"
                                onInput={(e) => {
                                    if (e.target.value === "${cleared}") {
                                        access(parent).getState.replaceData(undefined);
                                    } else {
                                        const option = access($vue).findOption(e.target.value);

                                        if (option) {
                                            access(parent).getState.replaceData(getProperty(option));
                                        } else {
                                            access(parent).getState.replaceData(undefined);
                                        }
                                    }
                                }}
                            >{access($vue)._default.value.concat($vue.options).map((option) => {
                                return access($vue).option(option);
                            })}</select>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const option = (option) => {
                        const vnode = (
                            <option
                                label={access($vue).getName(option)}
                                value={access($vue).getValue(option)}
                                selected={access($vue).getSelected(option)}
                                class="checked:bg-blue-300 checked:text-white"
                            />
                        );

                        return $vue.$slots.option?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, option};
                    // endregion

                    const self = Object.assign(vnodes, {
                        getName,
                        getValue,
                        getProperty,
                        getSelected,
                        findOption,
                        _default,
                    });

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
