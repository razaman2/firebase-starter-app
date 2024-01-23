<script lang="jsx">
import ObjectManager from "@razaman2/object-manager";
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import CustomButton from "@components/CustomButton.vue";
import {ref, computed, onMounted, Teleport} from "vue";

export default {
    emits: ["ok", "cancel"],

    props: {
        ...setup,
        title: {
            type: String,
            default: "Modal Title",
        },
        persistent: {
            type: Boolean,
            default: false,
        },
        header: {
            type: Boolean,
            default: true,
        },
        ok: {
            type: Boolean,
            default: true,
        },
        cancel: {
            type: Boolean,
            default: false,
        },
        show: {
            type: Boolean,
            default: false,
        },
        close: {
            type: Boolean,
            default: true,
        },
        onOk: {
            type: Function,
            default: () => {},
        },
        onCancel: {
            type: Function,
            default: () => {},
        },
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="CustomDialog"
                setup={(parent) => {
                    const modalRef = ref();

                    const isValid = computed(() => true);

                    const template = () => {
                        const vnode = (
                            <Teleport to="body">
                                <dialog ref={modalRef} class="modal">
                                    {access($vue).modalBox()}

                                    {access($vue).modalBackdrop()}
                                </dialog>
                            </Teleport>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const modalBox = () => {
                        const vnode = (
                            <div class="modal-box p-0">
                                {access($vue).header()}

                                {access($vue).modalContent()}

                                {access($vue).modalActions()}
                            </div>
                        );

                        return $vue.$slots.modalBox?.({$vue, vnode}) ?? vnode;
                    };

                    const modalContent = () => {
                        const vnode = (
                            <div class="px-4">{$vue.$slots.default?.() ?? "No Content"}</div>
                        );

                        return $vue.$slots.modalContent?.({$vue, vnode}) ?? vnode;
                    };

                    const modalBackdrop = () => {
                        if (!$vue.persistent) {
                            const vnode = (
                                <div class="modal-backdrop" onClick={access($vue).hide}/>
                            );

                            return $vue.$slots.modalBackdrop?.({$vue, vnode}) ?? vnode;
                        }
                    };

                    const modalActions = () => {
                        const vnode = (
                            <div class="modal-action flex-wrap m-0 p-4">
                                {access($vue).ok()}

                                {access($vue).cancel()}
                            </div>
                        );

                        return $vue.$slots.modalActions?.({$vue, vnode}) ?? vnode;
                    };

                    const header = () => {
                        const vnode = (
                            <div class={{
                                hidden: !$vue.header,
                                "flex justify-between bg-blue-50 px-4 py-3": true,
                            }}>
                                {access($vue).title()}

                                {access($vue).close()}
                            </div>
                        );

                        return $vue.$slots.header?.({$vue, vnode}) ?? vnode;
                    };

                    const close = () => {
                        if ($vue.close) {
                            const vnode = (
                                <i-mdi-close
                                    class="text-xl cursor-pointer hover:scale-90 transition duration-500"
                                    onClick={access($vue).hide}
                                />
                            );

                            return $vue.$slots.close?.({$vue, vnode}) ?? vnode;
                        }
                    };

                    const ok = () => {
                        const vnode = (
                            <CustomButton
                                class={{
                                    hidden: !$vue.ok,
                                    "btn-success btn-sm": true,
                                }}
                                onClick={async () => {
                                    await $vue.onOk(ObjectManager.on(access(parent).getState.getData()).clone());

                                    access($vue).hide();
                                }}
                                disabled={!access($vue).isValid.value}
                            >ok</CustomButton>
                        );

                        return $vue.$slots.ok?.({$vue, vnode}) ?? vnode;
                    };

                    const cancel = () => {
                        const vnode = (
                            <CustomButton
                                class={{
                                    hidden: !$vue.cancel,
                                    "btn-error btn-sm": true,
                                }}
                                onClick={async () => {
                                    await $vue.onCancel();

                                    access($vue).hide();
                                }}
                            >cancel</CustomButton>
                        );

                        return $vue.$slots.cancel?.({$vue, vnode}) ?? vnode;
                    };

                    const title = () => {
                        const vnode = (
                            <h3 class="font-bold">{$vue.title}</h3>
                        );

                        return $vue.$slots.title?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, modalBox, modalContent, modalBackdrop, modalActions, title, header, close, ok, cancel};

                    const show = () => {
                        modalRef.value.showModal();
                    };

                    const hide = () => {
                        modalRef.value.close();
                    };

                    const showing = () => {
                        return modalRef.value.open;
                    };

                    const self = Object.assign(vnodes, {show, hide, showing, modalRef, isValid});

                    onMounted(() => {
                        modalRef.value.addEventListener("close", () => {
                            access(parent).getState.replaceData();
                        });

                        if ($vue.show) {
                            access($vue).show();
                        }
                    });

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>

