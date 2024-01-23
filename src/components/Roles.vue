<script lang="jsx">
import {access} from "@razaman2/reactive-vue";
import NewRole from "@components/NewRole.vue";
import Role from "@components/Role.vue";
import {getFirestore, writeBatch} from "firebase/firestore";

export default {
    setup() {
        return ($vue) => {
            return (
                <List
                    modelName="Roles"
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

                    v-slots={$vue.$slots}
                />
            );
        };
    },
};
</script>
