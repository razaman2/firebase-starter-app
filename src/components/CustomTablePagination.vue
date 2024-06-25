<script lang="jsx">
import ReactiveView, {access, setup} from "@razaman2/reactive-view";
import CustomButton from "@components/CustomButton.vue";
import CustomSelect from "@components/CustomSelect.vue";
import {computed} from "vue";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveView
                defaultData={{page: 1, rows: 5, current: 1, count: 0}}
                setup={(parent) => {
                    const template = () => {
                        const {current, page, rows, count} = access(parent).getState.getData();

                        const vnode = (
                            <div class="flex flex-wrap gap-x-2 gap-y-2 items-center justify-end">
                                Records per page:

                                {access($vue).rows()}

                                {(current > count) ? ((count === 0) ? count : (current - rows)) : current} - {(rows * page) > count ? count : (rows * page)} of {count}

                                <div class="flex gap-x-1">
                                    {access($vue).prev()}
                                    {access($vue).next()}
                                </div>
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const prev = () => {
                        const {current, page, rows} = access(parent).getState.getData();
                        const isValid = page > 1;

                        const vnode = (
                            <CustomButton
                                disabled={!isValid}
                                class="btn-sm text-black"
                                onClick={() => {
                                    if (isValid) {
                                        access(parent).getState.setData({
                                            page: (page - 1),
                                            current: (current - rows),
                                        });
                                    }
                                }}
                            >
                                <i-mdi-navigate-before/>
                            </CustomButton>
                        );

                        return $vue.$slots.prev?.({$vue, vnode}) ?? vnode;
                    };

                    const next = () => {
                        const {current, page, rows, count} = access(parent).getState.getData();
                        const isValid = (page * rows) < count;

                        const vnode = (
                            <CustomButton
                                disabled={!isValid}
                                class="btn-sm text-black"
                                onClick={() => {
                                    if (isValid) {
                                        access(parent).getState.setData({
                                            page: (page + 1),
                                            current: (current + rows),
                                        });
                                    }
                                }}
                            >
                                <i-mdi-navigate-next/>
                            </CustomButton>
                        );

                        return $vue.$slots.next?.({$vue, vnode}) ?? vnode;
                    };

                    const rows = () => {
                        const vnode = (
                            <CustomSelect
                                placeholder={false}
                                class="rounded max-w-fit bg-transparent border-none cursor-pointer"
                                options={[3, 5, 7, 10, 15, 20, 25]}
                                state={access(parent).getState.getData("rows")}
                                onUpdate:modelState={({after}) => {
                                    access(parent).getState.setData({rows: parseInt(after)});
                                }}
                            />
                        );

                        return $vue.$slots.rows?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, prev, next, rows};

                    const self = Object.assign(vnodes, {});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
