import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import router from "@/router";
// Amplify configuration disabled - using mock data
// import { configureAmplify } from "@/config/amplify";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

// Amplify configuration disabled - no authentication needed
// configureAmplify();

createApp(App).use(router).use(Antd).mount("#app");
