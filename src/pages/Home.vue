<script lang="jsx">
import FileManager from "@helpers/FileManager";
import {getStorage} from "firebase/storage";
import {query, count, startAfter, endBefore, limit, limitToLast, orderBy, getAggregateFromServer} from "firebase/firestore";
import {Collection, Pagination} from "@razaman2/collection-proxy";
import ReactiveView, {setup, access, getProps} from "@razaman2/reactive-view";
import CustomCollapse from "@components/CustomCollapse.vue";
import CustomTable from "@components/CustomTable.vue";
import CustomTableRow from "@components/CustomTableRow.vue";
import CustomUploader from "@components/CustomUploader.vue";
import CustomButton from "@components/CustomButton.vue";
import ItemsList from "@components/ItemsList.vue";
import CustomTablePagination from "@components/CustomTablePagination.vue";
import {useAppStore} from "@stores/app";
import {ref, inject, onMounted} from "vue";
import {faker} from "@faker-js/faker";

const FirestoreTablePagination = {
    props: {
        ...setup,
    },

    setup() {
        const list = inject("list");

        return ($vue) => (
            <CustomTablePagination
                modelName="Pagination"
                setup={(parent) => {
                    const next = () => {
                        const next = access(parent).next();

                        return (
                            <next.type
                                {...next.props}
                                onClick={() => {
                                    access(list).getState.next();
                                }}

                                v-slots={next.children}
                            />
                        );
                    };

                    const prev = () => {
                        const prev = access(parent).prev();

                        return (
                            <prev.type
                                {...prev.props}
                                onClick={() => {
                                    access(list).getState.prev();
                                }}

                                v-slots={prev.children}
                            />
                        );
                    };

                    const rows = () => {
                        const rows = access(parent).rows();

                        return (
                            <rows.type
                                {...rows.props}
                                onUpdate:modelState={({after}) => {
                                    // access(list).getState.get(after);
                                    access(parent).getState.setData({
                                        // ...access(parent).getState.getData(),
                                        rows: parseInt(after),
                                    });

                                    console.log("log data:", access(parent).getState);
                                }}

                                v-slots={rows.children}
                            />
                        );
                    };

                    const vnodes = {next, prev, rows};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}
                model={(payload) => {
                    return Collection.setConfig({getAggregateFromServer}, {payload});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};

const Attachment = {
    setup() {
        return ($vue) => {
            return (
                <ReactiveView
                    setup={(parent) => {
                        // region TEMPLATE V-NODES
                        const template = () => {
                            const getDeleteButton = access($vue.$attrs.list()).getDeleteButton($vue);

                            const vnode = (
                                <div class="flex justify-between items-center">
                                    <img
                                        src={access(parent).getState?.getData("url")}
                                        width="85px"
                                    />

                                    <getDeleteButton.type
                                        {...getProps(getDeleteButton.props, "class")}
                                        class={getDeleteButton.props.class.replace("hidden", "")}

                                        v-slots={getDeleteButton.children}
                                    />
                                </div>
                            );

                            return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                        };

                        const vnodes = {template};
                        // endregion

                        const onItemBeforeDelete = async () => {
                            try {
                                return await new FileManager(getStorage()).deleteFile(access(parent).getState.getData()) ?? true;
                            } catch (e) {
                                return ["storage/object-not-found"].includes(e.code);
                            }
                        };

                        const self = Object.assign(vnodes, {onItemBeforeDelete});

                        return {parent, self};
                    }}
                />
            );
        };
    },
};

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveView
                modelName="HomePage"
                setup={(parent) => {
                    const modalRef = ref();
                    const attachmentsRef = ref();

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="grow bg-yellow-50 p-4">
                                <h1 class="text-2xl text-slate-500 text-center border">Home Page</h1>

                                <CustomCollapse
                                    class="my-3 rounded-none"
                                    titleClass="bg-slate-500 text-white font-semibold"
                                    contentClass="px-4"
                                >
                                    <h1 class="font-semibold mb-3">File Upload</h1>

                                    <ItemsList
                                        show={true}
                                        actions={false}
                                        ref={attachmentsRef}
                                        // getDisplayComponent={({state}) => {
                                        //     return (
                                        //         <ReactiveView class="flex justify-between items-center">
                                        //             <img
                                        //                 src={state.url}
                                        //                 width="100px"
                                        //             />
                                        //
                                        //             <CustomButton
                                        //                 label="delete"
                                        //                 class="bg-red-500 hover:bg-red-400 btn-sm"
                                        //                 onClick={() => {
                                        //                     access(attachmentsRef).getState.setDoc(state.id).delete();
                                        //                 }}
                                        //             />
                                        //         </ReactiveView>
                                        //     );
                                        // }}
                                        getDisplayComponent={Attachment}
                                        getDefaultDisplayComponent={false}
                                        getItemProps={{
                                            model: (payload) => {
                                                return Collection.proxy("tests", {payload});
                                            },
                                        }}
                                        onItemAdding={({component}) => {
                                            if (component) {
                                                access(component).getState.create();
                                            } else {
                                                return true;
                                            }
                                        }}
                                        onItemDeleting={({component}) => {
                                            if (component) {
                                                access(component).getState.delete();
                                            } else {
                                                return true;
                                            }
                                        }}
                                        setup={(parent) => {
                                            onMounted(() => {
                                                access(attachmentsRef).getState.getDocuments();
                                            });

                                            return {parent};
                                        }}
                                        model={(payload) => {
                                            return Collection.proxy("tests", {payload});
                                        }}

                                        v-slots={{
                                            getItems: ({$vue: $list}) => {
                                                return (
                                                    <CustomUploader
                                                        id="123"
                                                        name="users"
                                                        multiple={true}
                                                        onUpdate:modelState={async ({after}) => {
                                                            for (const item of after) {
                                                                await access($list).add(access($list).getDefaultComponent(item));
                                                            }
                                                        }}
                                                    />
                                                );
                                            },

                                            getItemsDisplay: ({vnode}) => {
                                                return (
                                                    <vnode.type
                                                        {...vnode.props}
                                                        class="flex my-1 pr-2 border"

                                                        v-slots={vnode.children}
                                                    />
                                                );
                                            },
                                        }}
                                    />

                                    <CustomButton
                                        label="save"
                                        class={{
                                            "hidden": !access(attachmentsRef).size?.(),
                                            "bg-green-500 hover:bg-green-400 btn-sm mt-3": true,
                                        }}
                                        onClick={() => {
                                            access(attachmentsRef).map(({component}) => {
                                                return access(component).getState.create();
                                            });
                                        }}
                                    />
                                </CustomCollapse>

                                <CustomButton
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        useAppStore().showModal(
                                            <CustomModal
                                                cancel={true}
                                                position="middle"
                                                ref={modalRef}
                                                setup={(parent) => {
                                                    const modalHeader = () => {
                                                        const modalHeader = access(parent).modalHeader();

                                                        const vnode = (
                                                            <modalHeader.type
                                                                {...modalHeader.props}
                                                            >
                                                                {modalHeader.children}
                                                            </modalHeader.type>
                                                        );

                                                        return $vue.$slots.modalHeader?.({$vue, vnode}) ?? vnode;
                                                    };

                                                    const vnodes = {modalHeader};

                                                    const self = Object.assign(vnodes, {});

                                                    return {parent, self};
                                                }}

                                                v-slots={{
                                                    default: () => {
                                                        return (
                                                            <div class="flex flex-col gap-y-2">
                                                                <label class="flex flex-col gap-y-1">
                                                                    <span>First Name</span>
                                                                    <CustomInput
                                                                        class="rounded"
                                                                        state={access(modalRef).getState?.getData("firstName")}
                                                                        onUpdate:modelState={({after}) => {
                                                                            access(modalRef).getState.setData("firstName", after);
                                                                        }}
                                                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                                                    />
                                                                </label>

                                                                <label class="flex flex-col gap-y-1">
                                                                    <span>Last Name</span>
                                                                    <CustomInput
                                                                        class="rounded"
                                                                        state={access(modalRef).getState?.getData("lastName")}
                                                                        onUpdate:modelState={({after}) => {
                                                                            access(modalRef).getState.setData("lastName", after);
                                                                        }}
                                                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                                                    />
                                                                </label>
                                                            </div>
                                                        );
                                                    },
                                                }}
                                            />,
                                        );
                                    }}
                                >open modal</CustomButton>

                                <div class="pt-10 max-h-full">
                                    <CustomTable
                                        size="xs"
                                        title="Users List"
                                        class="border"
                                        pinRows={true}
                                        striped={true}
                                        pagination={{rows: 3}}
                                        getDisplayComponent={CustomTableRow}
                                        getItemProps={{
                                            model: (payload) => {
                                                return Collection.proxy({payload});
                                            },
                                        }}
                                        setup={(parent) => {
                                            const tablePaginationRef = ref();

                                            // region TEMPLATE V-NODES
                                            const getAddButton = () => {
                                                const getAddButton = access(parent.parent.parent).getAddButton({
                                                    firstName: faker.person.firstName(),
                                                    lastName: faker.person.lastName(),
                                                });

                                                const vnode = (
                                                    <i-mdi-add
                                                        class="cursor-pointer text-2xl hover:scale-105"
                                                        onClick={getAddButton.props.onClick}
                                                    />
                                                );

                                                return $vue.$slots.getAddButton?.({$vue, vnode}) ?? vnode;
                                            };

                                            const pagination = () => {
                                                const pagination = access(parent).pagination();

                                                return (
                                                    <FirestoreTablePagination
                                                        {...pagination.props}
                                                        ref={tablePaginationRef}

                                                        v-slots={pagination.children}
                                                    />
                                                );
                                            };

                                            const vnodes = {getAddButton, pagination};
                                            // endregion

                                            const self = Object.assign(vnodes, {});

                                            onMounted(async () => {
                                                const pagination = await access(tablePaginationRef).getState.getCollectionAggregate({
                                                    count: count(),
                                                });

                                                access(parent).getState.getDocuments(new Pagination(pagination.getData("rows"), {
                                                    query: (ref) => {
                                                        return query(
                                                            ref,
                                                            orderBy("createdAt"),
                                                        );
                                                    },
                                                }));
                                            });

                                            return {parent, self};
                                        }}
                                        onItemAdding={({component}) => {
                                            if (component) {
                                                access(component).getState.create();
                                            } else {
                                                return true;
                                            }
                                        }}
                                        onItemDeleting={({component}) => {
                                            if (component) {
                                                access(component).getState.delete();
                                            } else {
                                                return true;
                                            }
                                        }}
                                        model={(payload) => {
                                            return Collection.setConfig({query, limit, limitToLast, startAfter, endBefore}, {payload});
                                        }}

                                        v-slots={{
                                            tableTop: ({vnode, $vue}) => {
                                                return (
                                                    <vnode.type
                                                        {...vnode.props}
                                                        class="flex justify-between items-center !p-2"
                                                    >
                                                        {vnode.children}
                                                        {access($vue).getAddButton()}
                                                    </vnode.type>
                                                );
                                            },

                                            tableHead: ({vnode, $vue}) => {
                                                return (
                                                    <vnode.type {...vnode.props}>
                                                        {...(vnode?.children ?? []).map((vnode) => vnode?.children[0]?.map((vnode) => vnode.children ? vnode :
                                                            <th class="w-0">
                                                                <i-mdi-add class="text-2xl text-center text-black/80 hover:scale-105 cursor-pointer" onClick={() => {
                                                                    access($vue).getAddButton({
                                                                        firstName: faker.person.firstName(),
                                                                        lastName: faker.person.lastName(),
                                                                    }).props.onClick();
                                                                }}/>
                                                            </th>))}
                                                    </vnode.type>
                                                );
                                            },
                                        }}
                                    />
                                </div>

                                <div class="join pt-10 w-full">
                                    <CustomCollapse
                                        icon="arrow"
                                        title="Action Buttons"
                                        class="border join-item"
                                        titleClass="bg-slate-200"
                                        contentClass="p-4"
                                        name="group1"
                                        accordion={true}
                                    >
                                        <CustomButton
                                            label="save"
                                            class="bg-primary hover:bg-primary/80"
                                            setup={(parent) => {
                                                console.log("button mounted:", parent);
                                                return {parent};
                                            }}
                                        />
                                    </CustomCollapse>

                                    <CustomCollapse
                                        icon="arrow"
                                        title="Menu Buttons"
                                        class="border join-item"
                                        titleClass="bg-slate-200"
                                        contentClass="p-4"
                                        name="group1"
                                        accordion={true}
                                    >
                                        <CustomButton
                                            label="menu"
                                            class="bg-primary hover:bg-primary/80"
                                            setup={(parent) => {
                                                console.log("button mounted:", parent);
                                                return {parent};
                                            }}
                                        />
                                    </CustomCollapse>
                                </div>
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
