<script lang="jsx">
import {access, getSubscription} from "@razaman2/reactive-vue";
import NewRole from "../components/NewRole.vue";
import Role from "../components/Role.vue";
import {getFirestore, writeBatch} from "firebase/firestore";
import {inject} from "vue";

export default {
    setup() {
        const subscriptions = getSubscription();

        return ($vue) => {
            return (
                <List
                    modelName="AppRoles"
                    class="p-4 space-y-2"
                    subscriptions={subscriptions}
                    getDisplayComponent={Role}
                    getDefaultDisplayComponent={NewRole}
                    onItemAdding={async ({component}) => {
                        if (component) {
                            const batch = writeBatch(getFirestore());

                            await access(component).getState.create({batch});
                            await batch.commit();
                        } else {
                            return true;
                        }
                    }}
                    onItemDeleting={async ({component}) => {
                        if (component) {
                            const batch = writeBatch(getFirestore());

                            await access(component).getState.remove({batch});
                            await batch.commit();
                        } else {
                            return true;
                        }
                    }}
                    state={inject("app").appRoles.getData()}

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
