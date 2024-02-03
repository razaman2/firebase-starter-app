<script lang="jsx">
import ObjectManager from "@razaman2/object-manager";
import {setup, access, getProps} from "@razaman2/reactive-view";
import List from "@components/List.vue";
import {watch, ref, nextTick, onMounted} from "vue";

export default {
    emits: ["item-active", "item-inactive"],

    props: {
        ...setup,
        active: {
            default: 0,
            validator: (item) => {
                return /Function|Object|String|Number|Boolean/.test(item.constructor.name);
            },
        },
        activeKey: {
            type: String,
            default: "id",
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Boolean,
            default: true,
        },
        actions: {
            type: Boolean,
            default: true,
        },
        display: {
            type: Boolean,
            default: true,
        },
        getItemDisplay: {
            type: Function,
        },
        onItemActive: {
            type: Function,
        },
        onItemInactive: {
            type: Function,
        },
    },

    setup() {
        return ($vue) => {
            return (
                <List
                    modelName="ItemsList"
                    setup={(parent) => {
                        const selected = ref({tid: access(parent).tid.value});
                        const saveButtonRef = ref();

                        const setDefaultItem = (item) => {
                            selected.value = (item ?? {tid: access(parent).tid.value});
                        };

                        const getActiveItemIdentifier = () => {
                            return (
                                access(parent).getItemIdentifier(selected.value)
                                ?? access(parent).tid.value
                            );
                        };

                        const isActiveItem = (item = {}) => {
                            return (
                                access($vue).getActiveItemIdentifier()
                                === access(parent).getItemIdentifier(item)
                            );
                        };

                        const isDefaultActive = () => {
                            return (
                                access($vue).getActiveItemIdentifier()
                                === access(parent).tid.value
                            );
                        };

                        const getActiveComponent = () => {
                            return access(parent).components[access($vue).getActiveItemIdentifier()];
                        };

                        const getItemProps = (options) => {
                            const props = {
                                class: {
                                    "hidden": ($vue.display === false) || (
                                        access(parent).getItemIdentifier(options.state)
                                        !== access($vue).getActiveItemIdentifier()
                                    ),
                                },
                            };

                            const getItemProps = access(parent).getItemProps(Object.assign(options, props));

                            return {
                                ...getItemProps,
                                class: getItemProps.class ?? props.class,
                            };
                        };

                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <div>
                                    {access($vue).getItems()}

                                    {access($vue).getItemActions()}

                                    {access(parent).template()}
                                </div>
                            );

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const getItems = () => {
                            const vnode = (
                                <div class={{
                                    "hidden": !$vue.items,
                                    "flex flex-col gap-1": true,
                                }}>{access(parent).getState.getData().map((item, index) => {
                                    const vnode = access($vue).getItem({item, index});

                                    return $vue.$slots.getItems?.({$vue, vnode}) ?? vnode;
                                })}</div>
                            );

                            return $vue.$slots.getItems?.({$vue, vnode}) ?? vnode;
                        };

                        const getItem = ({item, index}) => {
                            const id = access(parent).getItemIdentifier(item);

                            const vnode = (
                                <div
                                    key={id}
                                    class={{
                                        "bg-green-500": isActiveItem(item),
                                        "bg-gray-400": !isActiveItem(item),
                                        "text-white text-base py-2 px-4 cursor-pointer": true,
                                    }}
                                    onClick={() => access($vue).setDefaultItem(item)}
                                >
                                    {
                                        // item display is set on the items-list component.
                                        $vue.getItemDisplay?.({
                                            list: $vue,
                                            component: access(parent).components[id],
                                            index,
                                            id,
                                        })
                                        // item display is set in the display component.
                                        ?? (access(access(parent).components[id]).getItemDisplay?.value
                                            || access(access(parent).components[id]).getItemDisplay)
                                    }
                                </div>
                            );

                            return $vue.$slots.getItem?.({$vue, vnode}) ?? vnode;
                        };

                        const getItemActions = () => {
                            const vnode = (
                                <div class={{
                                    "hidden": !$vue.actions,
                                    "flex justify-end gap-1 py-3": true,
                                }}>
                                    {access($vue).getAddButton()}

                                    {access($vue).getDeleteButton()}

                                    {access($vue).getSaveButton()}
                                </div>
                            );

                            return $vue.$slots.getItemActions?.({$vue, vnode}) ?? vnode;
                        };

                        const getAddButton = (data) => {
                            const getAddButton = access(parent).getAddButton(data);

                            const vnode = (
                                <getAddButton.type
                                    {...getProps(getAddButton.props, ["onclick", "disabled"])}
                                    class={{
                                        "hidden": access($vue).isDefaultActive(),
                                    }}
                                    onClick={() => access($vue).setDefaultItem()}

                                    v-slots={getAddButton.children}
                                />
                            );

                            return $vue.$slots.getAddButton?.({$vue, vnode}) ?? vnode;
                        };

                        const getSaveButton = (data) => {
                            const getAddButton = access(parent).getAddButton(data);

                            const vnode = (
                                <getAddButton.type
                                    {...getAddButton.props}
                                    ref={saveButtonRef}
                                    class={{
                                        "hidden": !access($vue).isDefaultActive(),
                                    }}

                                    v-slots={getAddButton.children}
                                >save</getAddButton.type>
                            );

                            return $vue.$slots.getSaveButton?.({$vue, vnode}) ?? vnode;
                        };

                        const getDeleteButton = (component) => {
                            const getDeleteButton = access(parent).getDeleteButton(component ?? access($vue).getActiveComponent());

                            const vnode = (
                                <getDeleteButton.type
                                    {...getDeleteButton.props}
                                    class={{
                                        "hidden": access($vue).isDefaultActive(),
                                    }}

                                    v-slots={getDeleteButton.children}
                                />
                            );

                            return $vue.$slots.getDeleteButton?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {
                            template,
                            getItem,
                            getItems,
                            getItemActions,
                            getAddButton,
                            getSaveButton,
                            getDeleteButton,
                            getActiveItemIdentifier,
                        };
                        // endregion

                        const loadSelectionHandler = () => {
                            watch(selected, (selected, unselected) => {
                                nextTick(() => {
                                    const id = access(parent).getItemIdentifier(unselected);
                                    const inactiveComponent = access(parent).components[id];
                                    const activeComponent = access($vue).getActiveComponent();

                                    const active = $vue.onItemActive ?? activeComponent?.access().onItemActive;
                                    const inactive = $vue.onItemInactive ?? inactiveComponent?.access().onItemInactive;

                                    // trigger the inactive handler for the recently active item
                                    inactive?.({list: $vue, data: unselected, component: inactiveComponent});

                                    // trigger the active handler for the selected item
                                    active?.({list: $vue, data: selected, component: activeComponent});
                                });
                            });
                        };

                        const loadActivationHandler = () => {
                            const getItem = (items, active = "") => {
                                if (/String|Object/.test(active.constructor.name)) {
                                    return items.find((item) => {
                                        return (
                                            (item[$vue.activeKey] === active[$vue.activeKey])
                                            || (item[$vue.activeKey] === active)
                                        );
                                    });
                                } else if (active.constructor.name === "Number") {
                                    return (active > -1)
                                        ? items[active]
                                        : items[items.length - Math.abs(active)];
                                }
                            };

                            watch(() => ObjectManager.on(access(parent).getState.getData()).clone(), (items, itemsBefore) => {
                                if (!itemsBefore.length) {
                                    access($vue).setDefaultItem((
                                        ($vue.active.constructor.name === "Function")
                                            ? getItem(items, $vue.active(items))
                                            : getItem(items, $vue.active)
                                    ));
                                }

                                if (itemsBefore.length !== items.length) {
                                    const item = items.find((item) => {
                                        return (
                                            access(parent).getItemIdentifier(selected.value)
                                            === access(parent).getItemIdentifier(item)
                                        );
                                    });

                                    if (!item) {
                                        // select the default item when the active item is removed
                                        access($vue).setDefaultItem({tid: access(parent).tid.value});
                                    }
                                }
                            });
                        };

                        const add = async (component) => {
                            const subscription = watch(access(parent).getState.getData(), (items) => {
                                const index = items.findIndex((item) => {
                                    return (
                                        access(parent).getItemIdentifier(item)
                                        === access(parent).getItemIdentifier(access(component).getState.getData())
                                    );
                                });

                                access($vue).setDefaultItem(access(parent).getState.getData(index));
                                subscription();
                            });

                            await access(parent).add(component);
                        };

                        const remove = async (component) => {
                            const index = access(parent).getState.getData().findIndex((item) => {
                                return (
                                    access(parent).getItemIdentifier(item)
                                    === access(parent).getItemIdentifier(access(component).getState.getData())
                                );
                            });

                            const subscription = watch(access(parent).getState.getData(), (items) => {
                                access($vue).setDefaultItem((
                                    items[index]
                                    ?? items[index + 1]
                                    ?? items[index - 1]
                                ));

                                subscription();
                            });

                            await access(parent).remove(component);
                        };

                        const self = Object.assign(vnodes, {
                            add,
                            remove,
                            isActiveItem,
                            isDefaultActive,
                            getActiveComponent,
                            getItemProps,
                            setDefaultItem,
                            loadActivationHandler,
                            loadSelectionHandler,
                            saveButtonRef,
                        });

                        onMounted(() => {
                            // turn off initial item selection when mounted.
                            if ((typeof $vue.active !== "boolean")) {
                                access($vue).loadSelectionHandler();
                            }

                            access($vue).loadActivationHandler();
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
