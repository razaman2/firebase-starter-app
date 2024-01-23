<script lang="jsx">
import ReactiveView from "@razaman2/reactive-view";
import CustomButton from "@components/CustomButton.vue";
import { useRouter } from "vue-router";

export default {
    setup() {
        const router = useRouter();

        return () => {
            return (
                <ReactiveView class="justify-center items-center gap-y-6 text-blue-500">
                    <h3 class="text-5xl">Error 404</h3>

                    <CustomButton
                        label="back"
                        onClick={() => router.back()}
                        class="bg-blue-500 disabled:bg-blue-400 hover:bg-blue-400"
                    />
                </ReactiveView>
            );
        };
    },
};
</script>
