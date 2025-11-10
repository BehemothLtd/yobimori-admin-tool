import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import router from "@/router";
import { configureAmplify } from "@/config/amplify";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

// Configure Amplify before creating the app
configureAmplify();

createApp(App).use(router).use(Antd).mount("#app");
