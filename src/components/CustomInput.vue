<script lang="jsx">
import ReactiveVue, {access, setup} from "@razaman2/reactive-vue";
import {ref, computed} from "vue";

export default {
    props: {
        ...setup,
        state: {},
        type: {
            type: String,
            default: "text",
        },
        currency: {
            type: String,
            default: "USD",
        },
        style: {
            type: String,
            default: "currency",
        },
        debounce: {
            type: Number,
            default: 0,
        },
        decimals: {
            type: Number,
            default: 0,
        },
        locale: {
            type: String,
            default: "en-US",
        },
        unsigned: {
            type: Boolean,
            default: false,
        },
        money: {
            type: Boolean,
            default: false,
        },
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    modelName="CustomInput"
                    setup={(parent) => {
                        const timeout = ref();
                        const inputRef = ref();

                        const typeofTel = $vue.type === "tel";
                        const typeofNumber = $vue.type === "number";
                        const typeofNumeric = typeofTel || typeofNumber;

                        const state = computed(() => {
                            return (value = $vue.state) => {
                                if (typeofNumeric) {
                                    if (!isNaN(value)) {
                                        return Intl.NumberFormat($vue.locale, {
                                            ...(typeofTel &&
                                                $vue.money && {
                                                    style: $vue.style,
                                                    currency: $vue.currency,
                                                }),
                                            minimumFractionDigits: $vue.decimals,
                                            useGrouping: typeofTel,
                                        }).format(value);
                                    }
                                } else {
                                    return value;
                                }
                            };
                        });

                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode =
                                // ($vue.type === "textarea")
                                //     ? access($vue).textarea()
                                //     : access($vue).input()
                                (access($vue)[$vue.type] ?? access($vue).input)();

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const textarea = () => {
                            const vnode = (
                                <textarea
                                    value={state.value()}
                                    onInput={(e) => {
                                        throttle(() => {
                                            access(parent).getState.setData(e.target.value);
                                        });
                                    }}
                                />
                            );

                            return $vue.$slots.textarea?.({$vue, vnode}) ?? vnode;
                        };

                        const radio = () => {
                            const vnode = access($vue).checkbox();

                            return $vue.$slots.radio?.({$vue, vnode}) ?? vnode;
                        };

                        const checkbox = () => {
                            const vnode = (
                                <input
                                    ref={inputRef}
                                    type={$vue.type}
                                    checked={access(parent).getState.getData(inputRef.value?.value)}
                                    onInput={(e) => {
                                        const {checked, value} = e.target;
                                        const data = access(parent).getState.getData(value);

                                        if (Array.isArray(data)) {
                                            checked
                                                ? access(parent).getState.replaceData(
                                                    access(parent).getState.getData(value).concat(value),
                                                )
                                                : access(parent).getState.replaceData(
                                                    access(parent).getState.getData(value).filter((item) => item !== value),
                                                );
                                        } else if (data?.hasOwnProperty("")) {
                                            access(parent).getState.setData(checked);
                                        } else {
                                            access(parent).getState.setData(value, checked);
                                        }
                                    }}
                                />
                            );

                            return $vue.$slots.checkbox?.({$vue, vnode}) ?? vnode;
                        };

                        const input = () => {
                            const vnode = (
                                <input
                                    ref={inputRef}
                                    type={$vue.type}
                                    value={state.value()}
                                    onInput={(e) => {
                                        throttle(() => {
                                            if (typeofNumeric) {
                                                const value = e.target.value.replace(/[$,]/g, "");
                                                const match = RegExp(`^(${$vue.unsigned ? "" : "-*"}\\d*\\.*\\d+)*$`).test(value);
                                                const number = parseFloat(value);

                                                if (isNaN(number) ? false : match) {
                                                    access(parent).getState.setData(number);
                                                } else {
                                                    const data = access(parent).getState.getData();

                                                    data.hasOwnProperty("")
                                                        ? (inputRef.value.value = state.value(data))
                                                        : (inputRef.value.value = state.value(data) ?? null);
                                                }
                                            } else {
                                                access(parent).getState.setData(e.target.value);
                                            }
                                        });
                                    }}
                                />
                            );

                            return $vue.$slots.input?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {template, input, textarea, checkbox, radio};
                        // endregion

                        // const $transform = ({before, after}) => {
                        //     return {
                        //         after,
                        //         before: (typeof before === "object") ? undefined : before,
                        //     };
                        // };
                        //
                        // const self = Object.assign(vnodes, {$transform, inputRef});

                        const throttle = (handler) => {
                            clearTimeout(timeout.value);

                            timeout.value = setTimeout(handler, $vue.debounce);
                        };

                        const self = Object.assign(vnodes, {inputRef});

                        return $vue.setup({parent, self});
                    }}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
