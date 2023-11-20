import "./style.css";
import {createApp} from "vue";
import {createPinia} from "pinia";
import persist from "pinia-plugin-persist";
import Routes from "./routes";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

pinia.use(persist);
app.use(pinia);
app.use(Routes);
app.mount("#app");
