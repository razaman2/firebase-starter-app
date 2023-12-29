import {fileURLToPath, URL} from "node:url";

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
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./", import.meta.url)),
            "@collections": fileURLToPath(new URL("./collections", import.meta.url)),
            "@helpers": fileURLToPath(new URL("./helpers", import.meta.url)),
            "@src": fileURLToPath(new URL("./src", import.meta.url)),
            "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
            "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
            "@factories": fileURLToPath(new URL("./src/factories", import.meta.url)),
            "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
            "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
            "@routes": fileURLToPath(new URL("./src/routes", import.meta.url)),
            "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
        },
    },
});
