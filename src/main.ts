import "@src/style.css";
import {createApp} from "vue";
import {createPinia} from "pinia";
import Storage from "pinia-plugin-persist";
import Routes from "@routes/index";
import App from "@src/App.vue";

const app = createApp(App);
const store = createPinia();

store.use(Storage);
app.use(store);
app.use(Routes);
app.mount("#app");
