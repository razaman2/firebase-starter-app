<script lang="jsx">
import {RouterView, useRoute} from "vue-router";

export default {
    setup() {
        const route = useRoute();

        return () => {
            return (
                <RouterView key={route.fullPath}/>
            );
        };
    },
};
</script>
