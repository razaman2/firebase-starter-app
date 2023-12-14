<script lang="jsx">
import ReactiveVue, {access, setup} from "@razaman2/reactive-vue";
import {ref, computed} from "vue";

export default {
    props: {
        ...setup,
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
            default: 0,
            validator: (debounce) => {
                return /^\d+$/.test(debounce);
            },
        },
        decimals: {
            default: 0,
            validator: (decimals) => {
                return /^\d+$/.test(decimals);
            },
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

                        const typeofTel = $vue.type === "tel";
                        const typeofNumber = $vue.type === "number";
                        const typeofNumeric = typeofTel || typeofNumber;

                        const parsed = computed(() => {
                            const value = access(parent).getState.getData();

                            if (typeofNumeric) {
                                if (isNaN(value)) {
                                    return null;
                                } else {
                                    return Intl.NumberFormat($vue.locale, {
                                        ...(typeofTel
                                            && $vue.money
                                            && {style: $vue.style, currency: $vue.currency}),
                                        minimumFractionDigits: $vue.decimals,
                                        useGrouping: typeofTel,
                                    }).format(value);
                                }
                            } else {
                                return /string|number/.test(typeof value) ? value : null;
                            }
                        });

                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (access($vue)[$vue.type] ?? access($vue).input)();

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const radio = () => {
                            const data = access(parent).getState.getData();
                            console.log("check this:", data, $vue.type, $vue.$attrs.value, $vue.$attrs.name);
                            const vnode = (
                                <input
                                    type={$vue.type}
                                    checked={(
                                        Array.isArray(data)
                                            ? data.includes($vue.$attrs.value)
                                            : (typeof data === "boolean")
                                                ? data
                                                : ((typeof data === "string") || (typeof data === "number"))
                                                    ? (data === $vue.$attrs.value)
                                                    : (access(parent).getState.getData($vue.$attrs.name) === $vue.$attrs.value)
                                    )}
                                    onInput={(e) => {
                                        const {checked, value, name} = e.target;

                                        try {
                                            if (data.constructor.name === "Object") {
                                                access(parent).getState.setData(name, value);
                                            } else if (/String|Number/.test(data.constructor.name)) {
                                                access(parent).getState.replaceData(data);
                                                console.log("log data here:", data);
                                                // access(parent).getState.replaceData(checked ? data.concat(value) : data.filter((item) => (item !== value)));
                                            } else {
                                                access(parent).getState.replaceData(checked);
                                            }
                                        } catch {
                                            access(parent).getState.replaceData(checked);
                                        }
                                    }}
                                />
                            );

                            return $vue.$slots.radio?.({$vue, vnode}) ?? vnode;
                        };

                        const checkbox = () => {
                            const data = access(parent).getState.getData($vue.$attrs.name);

                            const vnode = (
                                <input
                                    type={$vue.type}
                                    checked={(
                                        Array.isArray(data)
                                            ? data.includes($vue.$attrs.value)
                                            : (typeof data === "boolean")
                                                ? data
                                                : access(parent).getState.getData(`${$vue.$attrs.name}.${$vue.$attrs.value}`)
                                    )}
                                    onInput={(e) => {
                                        const {checked, value} = e.target;

                                        try {
                                            if (data.constructor.name === "Object") {
                                                access(parent).getState.setData(`${$vue.$attrs.name}.${$vue.$attrs.value}`, checked);
                                            } else if (data.constructor.name === "Array") {
                                                const items = (checked ? data.concat(value) : data.filter((item) => (item !== value)));

                                                if ($vue.$attrs.name) {
                                                    access(parent).getState.setData($vue.$attrs.name, items);
                                                } else {
                                                    access(parent).getState.replaceData(items);
                                                }
                                            } else {
                                                access(parent).getState.replaceData(checked);
                                            }
                                        } catch {
                                            access(parent).getState.replaceData(checked);
                                        }
                                    }}
                                />
                            );

                            return $vue.$slots.checkbox?.({$vue, vnode}) ?? vnode;
                        };

                        const textarea = () => {
                            const vnode = (
                                <textarea
                                    value={access(parent).getState.getData({alternative: ""})}
                                    onInput={(e) => {
                                        throttle(() => {
                                            access(parent).getState.setData(e.target.value);
                                        });
                                    }}
                                />
                            );

                            return $vue.$slots.textarea?.({$vue, vnode}) ?? vnode;
                        };

                        const input = () => {
                            const vnode = (
                                <input
                                    type={$vue.type}
                                    value={parsed.value}
                                    onInput={(e) => {
                                        throttle(() => {
                                            if (typeofNumeric) {
                                                const value = e.target.value.replace(/[$,]/g, "");
                                                const match = RegExp(`^(${$vue.unsigned ? "" : "-*"}\\d*\\.*\\d+)*$`).test(value);
                                                const number = parseFloat(value);

                                                if (isNaN(number) ? false : match) {
                                                    access(parent).getState.replaceData(number);
                                                } else {
                                                    access(parent).getState.replaceData(e.target.value);
                                                }
                                            } else {
                                                access(parent).getState.replaceData(e.target.value);
                                            }
                                        });
                                    }}
                                />
                            );

                            return $vue.$slots.input?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {template, input, textarea, checkbox, radio};
                        // endregion

                        const throttle = (handler) => {
                            clearTimeout(timeout.value);

                            timeout.value = setTimeout(handler, $vue.debounce);
                        };

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
