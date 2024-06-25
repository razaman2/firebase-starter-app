<script lang="jsx">
import ReactiveView, {setup} from "@razaman2/reactive-view";
import {RouterView, useRoute} from "vue-router";
import {useAppStore} from "@stores/app";
import {ref, onMounted} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const route = useRoute();

        return ($vue) => (
            <ReactiveView
                modelName="BaseLayout"
                class="h-screen flex flex-col"
                setup={(parent) => {
                    const modalRef = ref({type: "div"});

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div>
                                <RouterView key={route.fullPath}/>

                                <modalRef.value.type
                                    {...modalRef.value.props}
                                    onDismiss={() => modalRef.value = {type: "div"}}

                                    v-slots={modalRef.value.children}
                                />
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template};
                    // endregion

                    const self = Object.assign(vnodes, {});

                    onMounted(() => {
                        useAppStore().$patch({modal: modalRef});
                    });

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
