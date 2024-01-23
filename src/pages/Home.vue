<script lang="jsx">
import ReactiveView, { setup, access } from "@razaman2/reactive-view";
import { ref } from "vue";

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
                                                            onUpdate:propsState={({ after }, state) => state.replaceData(after)}
                                                            onUpdate:modelState={({ after }) => {
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
                                                            onUpdate:propsState={({ after }, state) => state.replaceData(after)}
                                                            onUpdate:modelState={({ after }) => {
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
                            </div>
                        );

                        return $vue.$slots.template?.({ $vue, vnode }) ?? vnode;
                    };

                    const vnodes = { template };
                    // endregion

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({ parent, self });
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
