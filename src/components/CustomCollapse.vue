<script lang="jsx">
import EventEmitter from "@razaman2/event-emitter";
import ReactiveVue, {setup, access} from "@razaman2/reactive-view";
import {computed, onMounted} from "vue";

export default {
    props: {
        ...setup,
        title: {
            type: String,
            default: "Custom Collapse",
        },
        titleClass: {
            type: String,
            default: "",
        },
        contentClass: {
            type: String,
            default: "",
        },
        icon: {
            default: "plus",
            validator: (icon) => {
                return ["plus", "arrow", false].includes(icon);
            },
        },
        eager: {
            type: Boolean,
            default: false,
        },
        opened: {
            type: Boolean,
            default: false,
        },
        accordion: {
            type: Boolean,
            default: false,
        },
        name: String,
    },

    setup() {
        const notifications = new EventEmitter();

        return ($vue) => (
            <ReactiveVue
                modelName="CustomCollapse"
                defaultData={{activated: $vue.eager, open: false}}
                notifications={notifications}
                setup={(parent) => {
                    const template = () => {
                        const vnode = (
                            <div class={{
                                "collapse flex flex-col p-0": true,
                                "collapse-arrow": ($vue.icon === "arrow"),
                                "collapse-plus": ($vue.icon === "plus"),
                            }}>
                                <input
                                    class="hidden"
                                    name={$vue.name}
                                    type={$vue.accordion ? "radio" : "checkbox"}
                                    checked={access(parent).getState.getData("open")}
                                />

                                {access($vue).collapseTitle()}
                                {access($vue).collapseContent()}
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const collapseTitle = () => {
                        const vnode = (
                            <div
                                class={{
                                    "collapse-title flex items-center": true,
                                    [$vue.titleClass]: true,
                                }}
                                onClick={() => {
                                    const open = access(parent).getState.getData("open");

                                    access(parent).notifications.emit("open", !open);
                                }}
                            >{$vue.title}</div>
                        );

                        return $vue.$slots.collapseTitle?.({$vue, vnode}) ?? vnode;
                    };

                    const collapseContent = () => {
                        const vnode = (
                            <div class={{
                                "hidden": !access(parent).getState.getData("open"),
                                "collapse-content w-full p-0": true,
                                [$vue.contentClass]: true,
                            }}>{content.value}</div>
                        );

                        return $vue.$slots.collapseContent?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, collapseTitle, collapseContent};

                    const content = computed(() => {
                        if (access(parent).getState.getData("activated")) {
                            return ($vue.$slots.default?.($vue) ?? []).map((vnode) => {
                                return (
                                    <vnode.type
                                        {...vnode.props}
                                        notifications={access(parent).notifications}

                                        v-slots={vnode.children}
                                    />
                                );
                            });
                        }
                    });

                    const self = Object.assign(vnodes, {});

                    onMounted(() => {
                        access(parent).notifications.once("activated", (activated) => {
                            access(parent).getState.setData({activated});
                        });

                        access(parent).notifications.on("open", (open) => {
                            access(parent).getState.setData({open});

                            if (open && !access(parent).getState.getData("activated")) {
                                access(parent).notifications.emit("activated", true);
                            }
                        });

                        if ($vue.opened) {
                            access(parent).notifications.emit("open", true);
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

