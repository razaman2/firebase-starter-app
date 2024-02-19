<script lang="jsx">
import {Collection} from "@razaman2/collection-proxy";
import ReactiveView, {setup, access} from "@razaman2/reactive-view";
import CustomCollapse from "@components/CustomCollapse.vue";
import CustomTable from "@components/CustomTable.vue";
import CustomTableRow from "@components/CustomTableRow.vue";
import {faker} from "@faker-js/faker";
import {ref, onMounted} from "vue";

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

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="h-full bg-slate-100 p-4 items-center">
                                <h1 class="text-2xl text-slate-500 text-center border">Home Page</h1>

                                <CustomModal
                                    cancel={true}
                                    ref={modalRef}

                                    v-slots={{
                                        default: () => {
                                            return (
                                                <div class="flex flex-col gap-y-2">
                                                    <label class="flex flex-col gap-y-1">
                                                        <span>First Name</span>
                                                        <CustomInput
                                                            class="rounded"
                                                            state={access(modalRef).getState?.getData("firstName")}
                                                            onUpdate:propsState={({after}, state) => state.replaceData(after)}
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
                                                            onUpdate:propsState={({after}, state) => state.replaceData(after)}
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
                                />

                                <CustomButton
                                    onClick={() => {
                                        console.log("it's ok:", access(modalRef));
                                        access(modalRef).show();
                                    }}
                                >open modal</CustomButton>

                                <div class="pt-10 max-h-full">
                                    <CustomTable
                                        size="xs"
                                        title="Users List"
                                        class="border"
                                        pinRows={true}
                                        pagination={{rows: 5}}
                                        getDisplayComponent={CustomTableRow}
                                        getItemProps={{
                                            model: (payload) => {
                                                return Collection.proxy({payload});
                                            },
                                        }}
                                        setup={(parent) => {
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

                                            const vnodes = {getAddButton};
                                            // endregion

                                            const self = Object.assign(vnodes, {});

                                            onMounted(() => {
                                                access(parent).getState.getDocuments();
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
                                            return Collection.proxy({payload});
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
                                                                }} />
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
