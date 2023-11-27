<script lang="jsx">
import {Collection, Updates} from "@razaman2/firestore-proxy";
import ReactiveVue, {access, setup, getProps} from "@razaman2/reactive-vue";
import {deleteField, writeBatch, getFirestore} from "firebase/firestore";
import {inject, computed} from "vue";

const ListItem = {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => {
            return (
                <ReactiveVue
                    logging={false}
                    setup={(parent) => {
                        // region TEMPLATE V-NODES
                        const template = () => {
                            const vnode = (
                                <div class="contents">
                                    {access($vue).getNameInput()}

                                    {access($vue).getActionButton()}
                                </div>
                            );

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const getNameInput = () => {
                            const data = access($vue).getState.getData();

                            const vnode = (
                                <CustomInput
                                    class="rounded w-full"
                                    debounce={import.meta.VITE_DEBOUNCE_AGGRESSIVE}
                                    autofocus={access($vue.$attrs.list()).isDefaultDisplayComponent(data)}
                                    state={data.name}
                                    onUpdate:modelState={({after}) => {
                                        access($vue).getState.setData({name: after});
                                    }}
                                />
                            );

                            return $vue.$slots.getNameInput?.({$vue, vnode}) ?? vnode;
                        };

                        const getActionButton = () => {
                            const vnode = access($vue.$attrs.list()).getDeleteButton($vue);

                            return $vue.$slots.getActionButton?.({$vue, vnode}) ?? vnode;
                        };

                        const onItemActive = ({data}) => {
                            console.log("internal item active:", data);
                        };

                        const onItemInactive = ({data}) => {
                            console.log("internal item inactive:", data);
                        };

                        const vnodes = {template, getNameInput, getActionButton, onItemActive, onItemInactive};
                        // endregion

                        const getTid = () => access(parent).getState.getDoc().id;

                        const self = Object.assign(vnodes, {getTid});

                        return $vue.setup({parent, self});
                    }}
                    model={(payload) => {
                        return Collection.proxy({
                            payload,
                            creator: inject("app").authUser,
                        }).onWrite({
                            handler: (collection) => new Updates(collection, {}, collection.config),
                            triggers: ["create", "update", "delete"],
                        });
                    }}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};

const AddListItem = {
    props: {
        ...setup,
    },

    setup: () => {
        return ($vue) => {
            return (
                <ListItem
                    setup={(parent) => {
                        const isValid = computed(() => {
                            return (access(parent).getState.getData("name", "").length >= 3);
                        });

                        // region TEMPLATE V-NODES
                        const getActionButton = () => {
                            const vnode = access($vue.$attrs.list()).getAddButton();

                            return $vue.$slots.getActionButton?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {getActionButton};
                        // endregion

                        const self = Object.assign(vnodes, {isValid});

                        return $vue.setup({parent, self});
                    }}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};

export default {
    setup() {
        return ($vue) => {
            return (
                <div class="flex flex-col gap-y-10 w-max mx-auto py-3">
                    <List
                        logging={false}
                        addToStart={false}
                        class="grid grid-cols-[1fr_auto] gap-2"
                        getDisplayComponent={ListItem}
                        getDefaultDisplayComponent={AddListItem}
                        onItemAdding={async ({component}) => {
                            if (component) {
                                const batch = writeBatch(getFirestore());

                                await access(component).getState.create({batch});
                                await batch.commit();
                            } else {
                                return true;
                            }
                        }}
                        onItemDeleting={async ({component}) => {
                            if (component) {
                                const batch = writeBatch(getFirestore());

                                await access(component).getState.remove({batch});
                                await batch.commit();
                            } else {
                                return true;
                            }
                        }}
                        setup={(parent) => {
                            access(parent).getState.getDocuments();

                            const template = () => {
                                const vnode = (
                                    <div class="flex flex-col gap-y-3">
                                        {access(parent).template()}

                                        {access($vue).getSaveAllButton()}
                                    </div>
                                );

                                return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                            };

                            const getSaveAllButton = () => {
                                const vnode = (
                                    <CustomButton
                                        class="bg-green-500"
                                        onClick={() => {
                                            access(parent).map(({component}) => {
                                                return access(component).getState.create();
                                            });
                                        }}
                                    >save all</CustomButton>
                                );

                                return $vue.$slots.getSaveAllButton?.({$vue, vnode}) ?? vnode;
                            };

                            const self = {template, getSaveAllButton};

                            return {parent};
                        }}
                        model={(payload) => {
                            return Collection.proxy({payload});
                        }}

                        v-slots={$vue.$slots}
                    />

                    <ItemsList
                        logging={false}
                        getDisplayComponent={AddListItem}
                        getItemProps={{
                            setup: (parent) => {
                                const getItemDisplay = computed(() => {
                                    return access(parent).getState.getData("name");
                                });

                                const template = () => {
                                    return (
                                        <div class="flex flex-col gap-y-1">
                                            {access(parent).getNameInput()}

                                            <CustomSelect
                                                class="rounded"
                                                optionProperty="id"
                                                options={[{id: "super", name: "Super"}, {id: "admin", name: "Admin"}, {id: "user", name: "User"}, {id: "sales", name: "Sales"}, {id: "tech", name: "Tech"}]}
                                                state={access(parent).getState.getData("role")}
                                                onUpdate:propsState={{
                                                    callback: ({before, after}, state) => {
                                                        if (before !== after) {
                                                            state.replaceData(after);
                                                        }
                                                    },
                                                }}
                                                onUpdate:modelState={({after}) => {
                                                    access(parent).getState.setData({role: after});
                                                }}
                                                onUpdate:modelCleared={() => {
                                                    access(parent).getState.setData({role: deleteField()});
                                                }}
                                            />
                                        </div>
                                    );
                                };

                                const self = {template, getItemDisplay};

                                return {parent, self};
                            },
                        }}
                        // onItemAdding={async ({component}) => {
                        //     if (component) {
                        //         const batch = writeBatch(getFirestore());
                        //
                        //         await access(component).getState.create({batch});
                        //         await batch.commit();
                        //     } else {
                        //         return true;
                        //     }
                        // }}
                        // onItemDeleting={async ({component}) => {
                        //     if (component) {
                        //         const batch = writeBatch(getFirestore());
                        //
                        //         await access(component).getState.remove({batch});
                        //         await batch.commit();
                        //     } else {
                        //         return true;
                        //     }
                        // }}
                        onItemActive={({data}) => {
                            console.log("item active:", {data});
                        }}
                        onItemInactive={({data}) => {
                            console.log("item inactive:", {data});
                        }}
                        setup={(parent) => {
                            access(parent).getState.getDocuments();

                            const template = () => {
                                const vnode = (
                                    <div class="flex flex-col gap-y-3">
                                        <div class="p-2 bg-slate-500 text-white font-semibold">Items List</div>

                                        {access(parent).template()}

                                        {access($vue).getSaveAllButton()}
                                    </div>
                                );

                                return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                            };

                            const getItem = (params) => {
                                const getItem = access(parent).getItem(params);

                                return (
                                    <getItem.type
                                        {...getProps(getItem.props, "class")}
                                        class={getItem.props.class.replace("bg-green-500", "bg-orange-400").replace("bg-gray-400", "bg-black").concat(" rounded")}

                                        v-slots={getItem.children}
                                    />
                                );
                            };

                            const getSaveAllButton = () => {
                                const vnode = (
                                    <CustomButton
                                        class="bg-green-500 disabled:bg-green-500 hover:bg-green-400"
                                        onClick={async () => {
                                            const batch = writeBatch(getFirestore());

                                            await access(parent).map(({component}) => {
                                                return access(component).getState.create({batch});
                                            });

                                            await batch.commit();
                                        }}
                                    >save all</CustomButton>
                                );

                                return $vue.$slots.getSaveAllButton?.({$vue, vnode}) ?? vnode;
                            };

                            const self = {template, getItem, getSaveAllButton};

                            return {parent, self};
                        }}
                        model={(payload) => {
                            return Collection.proxy({payload});
                        }}

                        v-slots={$vue.$slots}
                    />
                </div>
            );
        };
    },
};
</script>
