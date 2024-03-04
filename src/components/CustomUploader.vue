<script lang="jsx">
import "@src/firebase-init-storage";
import FileManager from "@helpers/FileManager";
import {getStorage} from "firebase/storage";
import ReactiveView, {setup, access} from "@razaman2/reactive-view";
import CustomButton from "@components/CustomButton.vue";
import {ref} from "vue";

export default {
    props: {
        ...setup,
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        path: {
            validator: (path) => {
                return ["String", "Number", "Function"].includes(path.constructor.name);
            },
        },
        metadata: {
            validator: (metadata) => {
                return ["Object", "Function"].includes(metadata.constructor.name);
            },
        },
        public: {
            type: Boolean,
            default: true,
        },
    },

    setup() {
        return ($vue) => (
            <ReactiveView
                defaultData={($vue.$attrs.multiple === true) ? [] : {}}
                setup={(parent) => {
                    const fileRef = ref();
                    const progress = ref({});

                    // region TEMPLATE V-NODES
                    const template = () => {
                        const vnode = (
                            <div class="flex flex-col gap-y-3 bg-transparent border-0 p-0">
                                {access($vue).getFileInput()}
                                {access($vue).getUploadProgress()}
                            </div>
                        );

                        return $vue.$slots.template?.({$vue, vnode}) ?? vnode;
                    };

                    const getFileInput = () => {
                        const vnode = (
                            <input
                                type="file"
                                ref={fileRef}
                                onInput={async (e) => {
                                    const items = await access($vue).upload(e.target.files);

                                    access(parent).getState.replaceData((
                                        ($vue.$attrs.multiple === true)
                                            ? items
                                            : items[0]
                                    ));

                                    fileRef.value.value = null;
                                    progress.value = {};
                                }}

                                {...$vue.$attrs}
                            />
                        );

                        return $vue.$slots.fileInput?.({$vue, vnode}) ?? vnode;
                    };

                    const getUploadProgress = () => {
                        const vnode = (
                            <div
                                class={{
                                    "hidden": !Object.keys(progress.value).length,
                                    "flex flex-col gap-y-1": true,
                                }}
                            >
                                {Object.values(progress.value).map((data) => {
                                    return (
                                        <div class="flex flex-col gap-y-1 p-2 rounded shadow-md">
                                            <div class="flex justify-between flex-wrap gap-x-2 font-mono">
                                                <div
                                                    class="cursor-pointer"
                                                    onClick={() => window.open(data.url)}
                                                >{data.filename}</div>

                                                <div>{`${((data.bytes.transferred / data.bytes.total) * 100).toFixed(2)} %`}</div>
                                            </div>

                                            <div class="flex gap-x-2 gap-y-1 flex-wrap justify-end">
                                                <CustomButton
                                                    class="btn-xs"
                                                    onClick={() => {
                                                        data.task.pause();
                                                    }}
                                                >pause</CustomButton>

                                                <CustomButton
                                                    class="btn-xs"
                                                    onClick={() => {
                                                        data.task.resume();
                                                    }}
                                                >resume</CustomButton>

                                                <CustomButton
                                                    class="btn-xs"
                                                    onClick={() => {
                                                        data.task.cancel();
                                                    }}
                                                >cancel</CustomButton>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );

                        return $vue.$slots.getUploadProgress?.({$vue, vnode}) ?? vnode;
                    };

                    const vnodes = {template, getFileInput, getUploadProgress};
                    // endregion

                    const upload = (files) => {
                        const path = [$vue.id, $vue.name].filter(() => Boolean).join("/");

                        return new FileManager(getStorage(), {
                            public: $vue.public,
                            path: (
                                (typeof $vue.path === "function")
                                    ? $vue.path(path)
                                    : $vue.path
                            ),
                            handler: (snapshot) => {
                                progress.value[snapshot.ref.name] = {
                                    task: snapshot.task,
                                    name: snapshot.ref.name,
                                    filename: snapshot.ref.name.replace(/-\d+?(?=\.\w+$)/, ""),
                                    bytes: {
                                        transferred: snapshot.bytesTransferred,
                                        total: snapshot.totalBytes,
                                    },
                                };
                            },
                        }).addFiles(Array.from(files), () => {
                            const metadata = {name: $vue.name, id: $vue.id};

                            return ((typeof $vue.metadata === "function")
                                ? $vue.metadata(metadata)
                                : $vue.metadata) ?? metadata;
                        });
                    };

                    const self = Object.assign(vnodes, {upload});

                    return $vue.setup({parent, self});
                }}

                v-slots={$vue.$slots}
            />
        );
    },
};
</script>
