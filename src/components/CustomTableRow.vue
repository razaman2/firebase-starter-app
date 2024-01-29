<script lang="jsx">
import ReactiveVue, {setup, access} from "@razaman2/reactive-view";

export default {
    props: {
        ...setup,
    },

    setup() {
        return ($vue) => (
            <ReactiveVue
                modelName="CustomTableRow"
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <tr class="hover:!bg-blue-100">
                                <td class="border">{access(parent).getState.getData("firstName")}</td>
                                <td class="border">{access(parent).getState.getData("lastName")}</td>
                                <td class="border w-0">
                                    <i-mdi-delete
                                        class="text-red-500 w-full text-lg cursor-pointer hover:scale-105"
                                        onClick={access($vue.$attrs.list()).getDeleteButton($vue).props.onClick}
                                    />
                                </td>
                            </tr>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const columns = () => {
                        const vnode = (
                            [
                                "First Name", "Last Name",
                                <th/>,
                            ]
                        );

                        // const vnode = (
                        //     <div>
                        //         <th>First Name</th>
                        //         <th>Last Name</th>
                        //         <th class="w-0"/>
                        //     </div>
                        // );

                        return $vue.$slots.columns?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template};

                    const self = Object.assign(vnodes, {columns});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>

