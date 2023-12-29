<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";
import CustomOptionGroup from "@components/CustomOptionGroup.vue";
import {ref, reactive, capitalize} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                logging={true}
                modelName="AboutPage"
                state={{fruits: ["apples", "bananas", "grapes", "plums"], direction: "north"}}
                // state={["apples", "bananas", "grapes", "plums"]}
                setup={(parent) => {
                    access(parent).getState.setIgnoredPath("fruits.");

                    const template = () => {
                        const vnode = (
                            <div class="m-4">
                                <h1>{access(parent).getState.getData("price")}</h1>

                                <div class="flex flex-col gap-y-2">
                                    <div>
                                        <h3 class="bg-slate-200 p-2">Favourite Fruits</h3>

                                        <CustomOptionGroup
                                            class="flex gap-x-2"
                                            options={[
                                                {id: "apples", name: "Apples"},
                                                {id: "bananas", name: "Bananas"},
                                                {id: "grapes", name: "Grapes"},
                                            ]}
                                            state={access(parent).getState.getData("fruits")}
                                            // onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                            onUpdate:modelState={({before, after, added, removed}) => {
                                                console.log("checkbox1 update:", {before, after, added, removed});
                                                access(parent).getState.setData({fruits: after.map((item) => item.id)});
                                            }}

                                            v-slots={{
                                                name: ({vnode}) => {
                                                    return (
                                                        <vnode.type
                                                            {...vnode.props}
                                                        >{vnode.children.map((item) => capitalize(item))}</vnode.type>
                                                    );
                                                },
                                            }}
                                        />

                                        <CustomOptionGroup
                                            class="flex gap-x-2"
                                            options={["apples", "bananas", "grapes", "plums"]}
                                            state={access(parent).getState.getData("fruits")}
                                            // onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                            onUpdate:modelState={({before, after, added, removed}) => {
                                                console.log("checkbox2 update:", {before, after, added, removed});
                                                access(parent).getState.setData({fruits: after});
                                            }}

                                            v-slots={{
                                                name: ({vnode}) => {
                                                    return (
                                                        <vnode.type
                                                            {...vnode.props}
                                                        >{vnode.children.map((item) => capitalize(item))}</vnode.type>
                                                    );
                                                },
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <h3 class="bg-slate-200 p-2">Direction</h3>

                                        <CustomOptionGroup
                                            type="radio"
                                            name="direction"
                                            class="flex gap-x-2 ml-2"
                                            options={[
                                                {id: "north", name: "North"},
                                                {id: "south", name: "South"},
                                            ]}
                                            // options={["north", "south"]}
                                            state={access(parent).getState.getData("direction")}
                                            onUpdate:modelState={({before, after}) => {
                                                console.log("radio:", {before, after});

                                                access(parent).getState.setData({direction: after.id});
                                            }}
                                        />
                                    </div>

                                    <CustomInput
                                        type="tel"
                                        class="rounded"
                                        placeholder="Price"
                                        state={access(parent).getState.getData("price")}
                                        onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("price", after);
                                        }}
                                        decimals={2}
                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                        unsigned={true}
                                        money={true}
                                    />

                                    <CustomInput
                                        type="number"
                                        class="rounded"
                                        placeholder="Age"
                                        state={access(parent).getState.getData("age")}
                                        onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("age", after);
                                        }}
                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                        unsigned={true}
                                    />

                                    <CustomInput
                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                        class="rounded"
                                        placeholder="Name"
                                        state={access(parent).getState.getData("test")}
                                        onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("test", after);
                                        }}
                                    />

                                    <CustomInput
                                        debounce={import.meta.env.VITE_DEBOUNCE_AGGRESSIVE}
                                        type="textarea"
                                        class="rounded"
                                        placeholder="Details"
                                        state={access(parent).getState.getData("details")}
                                        onUpdate:propsState={({after}, state) => state.replaceData(after)}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("details", after);
                                        }}
                                    />

                                    <CustomButton
                                        class="bg-red-500 disabled:bg-red-400 hover:bg-red-400 mt-2"
                                        onClick={() => {
                                            access(parent).getState.replaceData();
                                        }}
                                    >reset</CustomButton>
                                </div>
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
