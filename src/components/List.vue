<script lang="jsx">
import ReactiveVue, {setup, access, safeRequest} from "@razaman2/reactive-vue";
import {h, ref, reactive, computed} from "vue";
import {v4 as uuid} from "uuid";

export default {
    emits: ["item-before-add", "item-adding", "item-before-delete", "item-deleting"],

    props: {
        ...setup,
        onItemBeforeAdd: {
            type: Function,
        },
        onItemAdding: {
            type: Function,
        },
        onItemBeforeDelete: {
            type: Function,
        },
        onItemDeleting: {
            type: Function,
        },
        getItemSlots: {
            default: () => ({}),
            validator: (value) => {
                return /Function|Object/.test(value.constructor.name);
            },
        },
        getItemProps: {
            default: () => ({}),
            validator: (value) => {
                return /Function|Object/.test(value.constructor.name);
            },
        },
        getDisplayComponent: {
            default: ReactiveVue,
            validator: (value) => {
                return /Function|Object/.test(value.constructor.name);
            },
        },
        getDefaultDisplayComponent: {
            validator: (value) => {
                return /Function|Object/.test(value.constructor.name);
            },
        },
        isValid: {
            type: Function,
        },
        addToStart: {
            type: Boolean,
            default: true,
        },
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    modelName="List"
                    defaultData={[]}
                    setup={(parent) => {
                        const tid = ref(uuid());
                        const addButtonRef = ref();
                        const deleteButtonRef = ref();

                        const components = reactive({});

                        const isValid = computed(() => {
                            try {
                                const component = access($vue).getDefaultComponent();

                                return $vue.isValid?.({
                                    component,
                                    list: $vue,
                                }) ?? access(component).isValid.value;
                            } catch {
                                return false;
                            }
                        });

                        const isDefaultDisplayComponent = (item) => {
                            return (
                                access($vue).getItemIdentifier(item)
                                === access($vue).tid.value
                            );
                        };

                        const getItemKey = (item = {}, alternative = true) => {
                            return item.hasOwnProperty("id")
                                ? "id"
                                : (alternative ? "tid" : "id");
                        };

                        const getItemIdentifier = (item = {}) => {
                            return item[access($vue).getItemKey(item)];
                        };

                        const getDefaultComponent = (data, handler) => {
                            const id = access($vue).getItemIdentifier(data);

                            const component = (
                                access($vue).components[id]
                                ?? access($vue).components[access($vue).tid.value]
                            );

                            if (component && data) {
                                component.access().getState.replaceData(handler ? handler(access(component).getState.getData()) : data);
                            }

                            return component;
                        };

                        const finalize = (component) => {
                            delete access(component).getState.getData().tid;

                            safeRequest({
                                alternative: false,
                                try: () => {
                                    const id = access(component).getTid();

                                    if (id) {
                                        access(component).getState.getData().id = id;
                                    }
                                },
                            });

                            return component;
                        };

                        const map = (callback) => {
                            return new Promise(async (resolve) => {
                                const items = access(parent).getState.getData();

                                const promises = items.reduce((components, item) => {
                                    const id = access($vue).getItemIdentifier(item);
                                    const component = access($vue).components[id];

                                    return item.tid
                                        ? components.concat(callback({
                                            list: $vue,
                                            component: finalize(component),
                                            tid: id,
                                        })) : components;
                                }, []);

                                resolve(await Promise.all(promises));
                            });
                        };

                        /** @deprecated Please use `map` instead. **/
                        const save = (callback) => {
                            console.warn("save in List Component has been deprecated. Please use map instead.");

                            return access($vue).map(callback);
                        };

                        const find = (item, id) => {
                            const iid = (
                                id
                                ?? access($vue).getItemIdentifier(item)
                            );

                            return access(parent).getState.getData().findIndex((item) => {
                                return access($vue).getItemIdentifier(item) === iid;
                            });
                        };

                        const add = async (component) => {
                            const onItemBeforeAdd = $vue.onItemBeforeAdd ?? access(component).onItemBeforeAdd;
                            const onItemAdding = $vue.onItemAdding ?? access(component).onItemAdding;
                            const options = {tid: access($vue).tid.value, list: $vue};

                            const execute = () => {
                                return onItemBeforeAdd?.(Object.assign(options, {component: finalize(component)})) ?? true;
                            };

                            if (await onItemAdding?.(options)) {
                                if (await execute()) {
                                    await onItemAdding(Object.assign(options, {component: finalize(component)}));
                                }
                            } else {
                                if (await execute()) {
                                    access($vue).set(access(component).getState.getData());
                                }
                            }

                            access($vue).tid.value = uuid();
                        };

                        const remove = async (component) => {
                            const onItemBeforeDelete = $vue.onItemBeforeDelete ?? access(component).onItemBeforeDelete;
                            const onItemDeleting = $vue.onItemDeleting ?? access(component).onItemDeleting;
                            const options = {list: $vue};

                            const execute = () => {
                                return onItemBeforeDelete?.(Object.assign(options, {component})) ?? true;
                            };

                            if (await onItemDeleting?.(options)) {
                                if (await execute()) {
                                    await onItemDeleting(Object.assign(options, {component}));
                                }
                            } else {
                                if (await execute()) {
                                    access($vue).unset(access(component).getState.getData());
                                }
                            }
                        };

                        const set = (item) => {
                            if (find(item) !== -1) {
                                access($vue).getDefaultComponent(item);
                            } else {
                                // add new items to top or bottom of list.
                                access(parent).getState.getData()[$vue.addToStart ? "unshift" : "push"](item);
                            }
                        };

                        const unset = (item) => {
                            const target = find(item, access($vue).getItemIdentifier(item));

                            access(parent).getState.getData().splice(target, 1);
                        };

                        const size = () => {
                            return access(parent).getState.getData().length;
                        };

                        const getItemSlots = (options) => {
                            return (typeof $vue.getItemSlots === "function")
                                ? $vue.getItemSlots?.(options)
                                : $vue.getItemSlots;
                        };

                        const getItemProps = (options) => {
                            const props = (typeof $vue.getItemProps === "function")
                                ? $vue.getItemProps?.(options)
                                : $vue.getItemProps;

                            return Object.assign({
                                list: () => $vue,
                                "onUpdate:propsState": ({after}) => {
                                    safeRequest({
                                        alternative: false,
                                        try: () => {
                                            const component = access($vue).components[after.id];

                                            if (component) {
                                                access(component).getState.replaceData(after);
                                            }
                                        },
                                    });
                                },
                            }, props);
                        };

                        const getItemOptions = (options) => {
                            const state = (options.id || (options.id === 0))
                                ? options.state
                                : Object.assign(options.state, {tid: uuid()});

                            const id = access($vue).getItemIdentifier(state);

                            return {
                                state,
                                key: id,
                                ref: (component) => {
                                    if (component) {
                                        access($vue).components[id] = component;
                                    } else {
                                        delete access($vue).components[id];
                                    }
                                },
                                onClick: (event) => {
                                    safeRequest({
                                        alternative: false,
                                        try: () => {
                                            access(access($vue).components[id]).onItemClicked({
                                                event,
                                                list: $vue,
                                            });
                                        },
                                    });
                                },
                            };
                        };

                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <div>{access($vue).getItemsDisplay()}</div>
                            );

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const getDisplay = () => {
                            const vnode = (typeof $vue.getDisplayComponent === "function")
                                // ? $vue.getDisplayComponent({component: access($vue).getDefaultComponent(), list: $vue})
                                ? $vue.getDisplayComponent
                                : $vue.getDisplayComponent;

                            return $vue.$slots.getDisplayComponent?.({$vue, vnode}) ?? vnode;
                        };

                        const getDefaultDisplay = () => {
                            const vnode = ((typeof $vue.getDefaultDisplayComponent === "function")
                                // ? $vue.getDefaultDisplayComponent({component: access($vue).getDefaultComponent(), list: $vue})
                                ? $vue.getDefaultDisplayComponent
                                : $vue.getDefaultDisplayComponent) ?? access($vue).getDisplay();

                            return $vue.$slots.getDefaultDisplay?.({$vue, vnode}) ?? vnode;
                        };

                        const getActiveDisplay = (item) => {
                            return (
                                access($vue).isDefaultDisplayComponent(item)
                                    ? access($vue).getDefaultDisplay()
                                    : access($vue).getDisplay()
                            );
                        };

                        const getItemsDisplay = () => {
                            return access(parent).getState.getData().concat({tid: access($vue).tid.value}).map((item, index) => {
                                const options = {
                                    id: access($vue).getItemIdentifier(item),
                                    component: access($vue).getDefaultComponent(),
                                    state: item,
                                    list: $vue,
                                    index,
                                };

                                const vnode = (
                                    h(access($vue).getActiveDisplay(item), Object.assign(
                                        access($vue).getItemProps(options),
                                        access($vue).getItemOptions(options),
                                        {options},
                                    ), access($vue).getItemSlots(options))
                                );

                                return $vue.$slots.getItemsDisplay?.({$vue, vnode}) ?? vnode;
                            });
                        };

                        const getAddButton = () => {
                            const vnode = (
                                <button
                                    ref={addButtonRef}
                                    class="bg-green-500 text-white px-3 py-2 enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer border-0 rounded uppercase"
                                    onClick={() => {
                                        const component = access($vue).getDefaultComponent();

                                        return access($vue).add(component);
                                    }}
                                    disabled={!access($vue).isValid.value}
                                >add</button>
                            );

                            return $vue.$slots.getAddButton?.({$vue, vnode}) ?? vnode;
                        };

                        const getDeleteButton = (component) => {
                            const vnode = (
                                <button
                                    ref={deleteButtonRef}
                                    class="bg-red-500 text-white px-3 py-2 enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer border-0 rounded uppercase"
                                    onClick={() => access($vue).remove(component)}
                                    disabled={!String(access($vue).getItemIdentifier(component && access(component).getState.getData()))}
                                >delete</button>
                            );

                            return $vue.$slots.getDeleteButton?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {
                            template,
                            getDisplay,
                            getDefaultDisplay,
                            getActiveDisplay,
                            getItemsDisplay,
                            getAddButton,
                            getDeleteButton,
                            getItemOptions,
                            getItemProps,
                            getItemSlots,
                        };
                        // endregion

                        const self = Object.assign(vnodes, {
                            tid,
                            components,
                            isValid,
                            addButtonRef,
                            deleteButtonRef,
                            isDefaultDisplayComponent,
                            getItemKey,
                            getItemIdentifier,
                            getDefaultComponent,
                            finalize,
                            add,
                            remove,
                            save,
                            map,
                            set,
                            unset,
                            size,
                        });

                        return $vue.setup({parent, self});
                    }}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
