<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import {inject} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="HomePage"
                setup={(parent) => {
                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="h-full bg-blue-50 p-4">
                                <h1 class="m-0">{inject("app").authCompany.getData("name")}</h1>

                                <h1 class="bg-slate-500 text-white text-base font-semibold px-2 py-3 rounded">
                                    {access(parent).getState.getData("name", "None")}
                                </h1>

                                <div class="mt-3 flex flex-wrap gap-1">
                                    <CustomInput
                                        class="max-w-full grow rounded"
                                        placeholder="Enter your name..."
                                        state={access(parent).getState.getData("name")}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("name", after);
                                        }}
                                    />

                                    <CustomButton
                                        class="bg-yellow-500 disabled:bg-yellow-400 hover:bg-yellow-400"
                                        onClick={() => {
                                            access(parent).getState.replaceData();
                                        }}
                                    >
                                        reset
                                    </CustomButton>
                                </div>

                                <CustomButton
                                    label="logout"
                                    class="bg-red-500 disabled:bg-red-400 hover:bg-red-400 mt-5"
                                    onClick={inject("app").logout}
                                />
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
