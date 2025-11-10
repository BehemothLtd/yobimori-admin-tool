import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import router from "@/router";
import { configureAmplify } from "@/config/amplify";

// Configure Amplify before creating the app
configureAmplify();

createApp(App).use(router).mount("#app");
