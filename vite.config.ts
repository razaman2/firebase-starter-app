import {defineConfig} from "vite";
import Vue from "@vitejs/plugin-vue";
import Jsx from "@vitejs/plugin-vue-jsx";
import Icons from "unplugin-icons/vite";
import IconResolver from "unplugin-icons/resolver";
import IconComponents from "unplugin-vue-components/vite";

export default defineConfig({
    plugins: [
        Jsx({}),

        Vue({}),

        Icons({autoInstall: true}),

        IconComponents({
            resolvers: [IconResolver()],
        }),
    ],
});
