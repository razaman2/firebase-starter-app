<script lang="jsx">
import EventEmitter from "@razaman2/event-emitter";
import { Collection } from "@razaman2/firestore-proxy";
import Roles from "@components/Roles.vue";
import { useAppStore } from "@stores/app";
import { inject } from "vue";

export default {
    setup() {
        const notifications = new EventEmitter();
        const { authUser, appRoles } = inject("app");

        notifications.on("creating", (collection, { batch }) => {
            if (collection.getDoc().id === "super") {
                return Collection.proxy("roles").setDoc(collection.getDoc().id).setParent(authUser).create({ batch });
            }
        });

        return () => {
            return (
                <div class="p-4">
                    <h1 class={{
                        hidden: useAppStore().getRoles("super"),
                        "text-md shadow-lg text-white font-semibold bg-orange-500 px-2 py-1 mb-3 uppercase": true,
                    }}>create at least a super role to continue.</h1>

                    <Roles
                        modelName="AppRolesPage"
                        class="space-y-2"
                        getItemProps={{ notifications }}
                        model={appRoles}
                    />
                </div>
            );
        };
    },
};
</script>
