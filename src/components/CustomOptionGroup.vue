<script lang="jsx">
import {setup, access, getProps} from "@razaman2/reactive-vue";
import CustomSelect from "@components/CustomSelect.vue";
import CustomInput from "@components/CustomInput.vue";
import {ref, computed} from "vue";

export default {
    props: {
        ...setup,
        type: {
            type: String,
            default: "checkbox",
            validator: (type) => {
                return ["checkbox", "radio"].includes(type);
            },
        },
        name: {
            type: String,
        },
    },

    setup() {
        const selectRef = ref();

        return ($vue) => (
            <CustomSelect
                ref={selectRef}
                modelName="CustomOptionGroup"
                setup={(parent) => {
                    const _default = computed(() => {
                        return selectRef.value?.options.length
                            ? []
                            : access(parent)._default.value;
                    });

                    const template = () => {
                        const template = access(parent).template();

                        const vnode = (
                            <div
                                {...getProps(template.props, "oninput")}
                            >{template.children}</div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const option = (option) => {
                        const vnode = (
                            <div class="flex items-center gap-x-2">
                                {access($vue).name(option)}

                                {access($vue).input(option)}
                            </div>
                        );

                        return $vue.$slots.option?.({$vue, vnode}) ?? vnode;
                    };

                    const name = (option) => {
                        const vnode = (
                            <div>{access(parent).getName(option)}</div>
                        );

                        return $vue.$slots.name?.({$vue, vnode}) ?? vnode;
                    };

                    const input = (option) => {
                        const vnode = (
                            <CustomInput
                                type={$vue.type}
                                name={$vue.name}
                                value={access(parent).getValue(option)}
                                model={access(parent).getState}
                            />
                        );

                        return $vue.$slots.input?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, option, name, input};

                    const $transform = ({before, after}) => {
                        if (/checkbox|toggle/i.test(`${$vue.type}`)) {
                            const {added, removed, from, to} = selectRef.value.options.reduce((options, option) => {
                                if (after.includes(option[selectRef.value.optionValue]
                                    ?? option) && !before?.includes(option[selectRef.value.optionValue] ?? option)) {
                                    options.added.push(option);
                                } else if (before?.includes(option[selectRef.value.optionValue]
                                    ?? option) && !after.includes(option[selectRef.value.optionValue] ?? option)) {
                                    options.removed.push(option);
                                }

                                if (after.includes(option[selectRef.value.optionValue] ?? option)) {
                                    options.to.push(option);
                                }

                                if (before?.includes(option[selectRef.value.optionValue] ?? option)) {
                                    options.from.push(option);
                                }

                                return options;
                            }, {added: [], removed: [], from: [], to: []});

                            return {before: from, after: to, added, removed};
                        } else {
                            return {
                                before: selectRef.value.options.find((item) => {
                                    return before === (item[selectRef.value.optionValue] ?? item);
                                }),
                                after: selectRef.value.options.find((item) => {
                                    return after === (item[selectRef.value.optionValue] ?? item);
                                }),
                            };
                        }
                    };

                    const self = Object.assign(vnodes, {_default, $transform});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
