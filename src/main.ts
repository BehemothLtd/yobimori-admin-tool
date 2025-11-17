import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import router from "@/router";
// Amplify configuration disabled - using mock data
// import { configureAmplify } from "@/config/amplify";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

// Vue Flow styles
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// Amplify configuration disabled - no authentication needed
// configureAmplify();

createApp(App).use(router).use(Antd).mount("#app");
