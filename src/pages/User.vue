<script lang="jsx">
import ReactiveVue, {setup} from "@razaman2/reactive-vue";
import CustomButton from "../components/CustomButton.vue";
import {useRouter} from "vue-router";
import {inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        const router = useRouter();

        return ($vue) => (
            <ReactiveVue
                modelName="UserPage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const {firstName, lastName} = inject("app").authUser.getData();

                        const vnode = (

                            <div class="h-full p-4 bg-blue-50">
                                <h5 class="m-0">{firstName} {lastName}</h5>

                                <div class="flex gap-x-1 mt-5">
                                    <CustomButton
                                        label="logout"
                                        class="bg-red-500 disabled:bg-red-400 hover:bg-red-400"
                                        onClick={inject("app").logout}
                                    />

                                    <CustomButton
                                        label="unauthorized"
                                        class="bg-orange-500 disabled:bg-orange-400 hover:bg-orange-400"
                                        onClick={() => router.push("/unauthorized")}
                                    />
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
