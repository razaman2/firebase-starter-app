<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                logging={true}
                modelName="AboutPage"
                defaultData={{radio: []}}
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <div class="m-4">
                                <h1>{access(parent).getState.getData("price")}</h1>

                                <div class="flex flex-col gap-y-2">
                                    <div class="flex items-center gap-2">
                                        Male
                                        <CustomInput
                                            type="checkbox"
                                            value="gender.male"
                                            model={access(parent).getState}
                                        />
                                    </div>

                                    <div class="flex items-center gap-2">
                                        Female
                                        <CustomInput
                                            type="checkbox"
                                            value="gender.female"
                                            model={access(parent).getState}
                                        />
                                    </div>

                                    <div class="flex gap-x-2">
                                        <div class="flex items-center gap-2">
                                            up
                                            <CustomInput
                                                type="radio"
                                                value="radio.up"
                                                name="direction"
                                                model={access(parent).getState}
                                            />
                                        </div>

                                        <div class="flex items-center gap-2">
                                            down
                                            <CustomInput
                                                type="radio"
                                                value="radio.down"
                                                name="direction"
                                                model={access(parent).getState}
                                            />
                                        </div>
                                    </div>

                                    <CustomInput
                                        type="tel"
                                        class="rounded"
                                        placeholder="Price"
                                        state={access(parent).getState.getData("price")}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("price", after);
                                        }}
                                        decimals={2}
                                        debounce={500}
                                        unsigned={true}
                                        money={true}
                                    />

                                    <CustomInput
                                        type="number"
                                        class="rounded"
                                        placeholder="Age"
                                        state={access(parent).getState.getData("age")}
                                        onUpdate:modelState={({after}) => {
                                            access(parent).getState.setData("age", after);
                                        }}
                                        debounce={500}
                                        unsigned={true}
                                    />

                                    <CustomInput
                                        debounce={750}
                                        type="textarea"
                                        class="rounded"
                                        placeholder="Details"
                                        state={access(parent).getState.getData("details")}
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
