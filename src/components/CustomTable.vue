<script lang="jsx">
import {setup, access} from "@razaman2/reactive-view";
import ItemsList from "@components/ItemsList.vue";
import CustomTablePagination from "@components/CustomTablePagination.vue";
import {provide, Fragment} from "vue";

export default {
    props: {
        ...setup,
        size: {
            type: String,
            default: "sm",
            validator: (size) => {
                return ["xs", "sm", "md", "lg"].includes(size);
            },
        },
        pinRows: {
            type: Boolean,
            default: false,
        },
        pinColumns: {
            type: Boolean,
            default: false,
        },
        striped: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: "Custom Table",
        },
        pagination: Object,
    },

    setup() {
        return ($vue) => (
            <ItemsList
                modelName="CustomTable"
                setup={(parent) => {
                    provide("list", $vue);

                    const sizes = {
                        xs: "table-xs",
                        sm: "table-sm",
                        md: "table-md",
                        lg: "table-lg",
                    };

                    const template = () => {
                        const vnode = (
                            <Fragment>
                                {access($vue).tableTop()}

                                <table
                                    class={{
                                        "table": true,
                                        "table-zebra": $vue.striped,
                                        "table-pin-columns": $vue.pinColumns,
                                        "table-pin-rows": $vue.pinRows,
                                        [sizes[$vue.size]]: true,
                                    }}

                                    {...$vue.$attrs}
                                >
                                    {access($vue).topRow()}
                                    {access($vue).tableHead()}
                                    {access($vue).tableBody()}
                                    {access($vue).bottomRow()}
                                </table>

                                {access($vue).tableBottom()}
                            </Fragment>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const tableHead = () => {
                        const vnode = (
                            <thead>{access($vue).tableHeadRow()}</thead>
                        );

                        return $vue.$slots.tableHead?.({$vue, vnode}) ?? vnode;
                    };

                    const tableHeadRow = () => {
                        const row = access(access(parent).getDefaultComponent()).columns?.({list: $vue});

                        const th = (column) => {
                            return ["th", "td"].includes(column.type) ?
                                column :
                                <th>{column}</th>;
                        };

                        const columns = (Array.isArray(row) ?
                            row.map((column) => th(column)) :
                            row) ?? [];

                        const vnode = (
                            (["tr", undefined].includes(columns.type) ?
                                columns.type &&
                                <columns.type
                                    {...columns.props}

                                    v-slots={columns.children.map((column) => th(column))}
                                /> :
                                <tr>{columns.children.map((column) => th(column))}</tr>) ??
                            <tr>{columns.map((column) => th(column))}</tr>
                        );

                        return $vue.$slots.tableHeadRow?.({$vue, vnode}) ?? vnode;
                    };

                    const tableBody = () => {
                        const vnode = (
                            <tbody>{access(parent.parent).template().children}</tbody>
                        );

                        return $vue.$slots.tableBody?.({$vue, vnode}) ?? vnode;
                    };

                    const topRow = () => {
                        const vnode = false;

                        return $vue.$slots.topRow?.({$vue, vnode}) ?? vnode;
                    };

                    const bottomRow = () => {
                        const vnode = false;

                        return $vue.$slots.bottomRow?.({$vue, vnode}) ?? vnode;
                    };

                    const tableTop = () => {
                        const vnode = (
                            <div class="border border-b-0 p-3 rounded-t font-semibold">{$vue.title}</div>
                        );

                        return $vue.$slots.tableTop?.({$vue, vnode}) ?? vnode;
                    };

                    const tableBottom = () => {
                        const vnode = (
                            <div class="border border-t-0 p-3 rounded-b font-semibold text-right">
                                <span class={{
                                    "hidden": !$vue.pagination,
                                }}>{access($vue).pagination()}</span>
                            </div>
                        );

                        return $vue.$slots.tableBottom?.({$vue, vnode}) ?? vnode;
                    };

                    const pagination = () => {
                        const vnode = (
                            <CustomTablePagination getDefaultData={(data) => {
                                return {
                                    ...data,
                                    ...$vue.pagination,
                                };
                            }}/>
                        );

                        return $vue.$slots.pagination?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, topRow, bottomRow, tableTop, tableBottom, tableHead, tableHeadRow, tableBody, pagination};

                    const getItemProps = (options) => {
                        const props = {
                            class: {
                                "hidden": (
                                    // hide the default row component
                                    access(parent).getItemIdentifier(options.state)
                                    === access($vue).tid.value
                                ),
                            },
                        };

                        const getItemProps = access(parent.parent).getItemProps(Object.assign({}, options, props));

                        return {
                            ...getItemProps,
                            // class attribute was passed to client to allow adding or removing classes
                            // if class attribute is not returned from client `getItemProps.class`
                            // then default class attribute will be used `props.class
                            class: getItemProps.class ?? props.class,
                        };
                    };

                    const self = Object.assign(vnodes, {getItemProps});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>

