<script lang="jsx">
import {setup, access} from "@razaman2/reactive-vue";
import Swal from "sweetalert2";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <NewRole
                modelName="Role"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="flex justify-between items-center gap-x-3 bg-black text-white rounded-r-lg rounded ring ring-black">
                                <div class="flex justify-between flex-wrap gap-x-3 w-full px-4">
                                    <p>{access(parent).getState.getData("id")}</p>
                                    <p>{access(parent).getState.getData("name")}</p>
                                </div>

                                {access($vue).deleteButton()}
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const deleteButton = () => {
                        const vnode = (
                            <CustomButton
                                class="bg-red-500 hover:bg-red-400 disabled:bg-red-400"
                                onClick={() => {
                                    const data = access(parent).getState.getData();

                                    Swal.fire({
                                        title: "Are you sure?",
                                        showDenyButton: true,
                                        confirmButtonText: "Yes",
                                        denyButtonText: "No",
                                        customClass: {
                                            denyButton: "order-1",
                                            confirmButton: "order-2",
                                        },
                                    }).then(async (result) => {
                                        if (result.isConfirmed) {
                                            await access($vue.$attrs.list()).remove(parent);

                                            Swal.fire({
                                                title: `${data.name} role deleted.`,
                                                icon: "success",
                                                timer: 2000,
                                            });
                                        }
                                    });
                                }}
                            >
                                {access($vue).deleteButtonIcon()}
                            </CustomButton>
                        );

                        return $vue.$slots.deleteButton?.({$vue, vnode}) ?? vnode;
                    };

                    const deleteButtonIcon = () => {
                        const vnode = (
                            <i-mdi-delete class="text-xl"/>
                        );

                        return $vue.$slots.deleteButtonIcon?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, deleteButton, deleteButtonIcon};
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
