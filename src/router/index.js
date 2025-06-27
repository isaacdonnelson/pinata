import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

// Layouts
import DefaultLayout from "../layouts/Default.vue";

// Views
import HomeView from "../views/HomeView.vue";
import MainView from "../views/MainView.vue";
import ResultView from "../views/ResultView.vue";
import PrintView from "../views/PrintView.vue";
import LowProfileView from "../views/LowProfileView.vue";
import SettingView from "../views/SettingView.vue";

// Settings Components
import ConnectionsTab from "@/components/settings/ConnectionsTab.vue";
import MyAccountTab from "@/components/settings/MyAccountTab.vue";
import GeneralTab from "@/components/settings/GeneralTab.vue";
import SupportTab from "@/components/settings/SupportTab.vue";
import TemplateTab from "@/components/settings/TemplateTab.vue";
import ConfigCheckListTab from "@/components/settings/ConfigCheckListTab.vue";
import ReportsTab from "@/components/settings/ReportsTab.vue";
import AddonsTab from "@/components/settings/AddonsTab.vue";
import HotkeysTab from "@/components/settings/HotkeysTab.vue";
import TagsTab from "@/components/settings/TagsTab.vue";

// Auth Components
import LoginPage from "@/components/auth/views/LoginPage.vue";
import RegisterPage from "@/components/auth/views/RegisterPage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "/login",
        name: "Login",
        component: LoginPage,
      },
      {
        path: "/register",
        name: "Register",
        component: RegisterPage,
      },
      {
        path: "/auth/:handle/:projectKey",
        name: "Auth",
        props: true,
        beforeEnter: async (to, from, next) => {
          const { handle } = to.params;
          try {
            // get the user profile to check if the user is authorized via cookie
            await store.dispatch("user/getUserProfile", handle);
            // TODO set via backend, for now get the local config update it once the user changes it also check for an existing one
            const config = store.getters["config/fullConfig"];
            store.commit("config/setFullConfig", config);
            // if (handle && projectKey) {
            // TODO: Uncomment and implement the logic to set the current project
            // store.commit("setCurrentProject", { handle, projectKey });
            // }
            next({ path: "/home" });
          } catch {
            // if the endpoint fails then the user is not authorized and must login
            const referrer = document.referrer;
            if (
              referrer.includes("testfiesta.com") ||
              referrer.includes("localhost:8084")
            ) {
              window.location.href = referrer;
            } else {
              const loginUrl =
                window.location.hostname === "localhost"
                  ? "http://localhost:8084/login"
                  : "https://app.testfiesta.com/login";
              window.location.href = loginUrl;
            }
          }
        },
      },
      {
        path: "/auth/:handle",
        name: "Auth",
        props: true,
        beforeEnter: async (to, from, next) => {
          const { handle, projectKey } = to.params;
          try {
            // get the user profile to check if the user is authorized via cookie
            await store.dispatch("user/getUserProfile", handle);
            // TODO set via backend, for now get the local config update it once the user changes it also check for an existing one
            const config = store.getters["config/fullConfig"];
            store.commit("config/setFullConfig", config);
            // if (handle && projectKey) {
            // TODO: Uncomment and implement the logic to set the current project
            // store.commit("setCurrentProject", { handle, projectKey });
            // }
            next({ path: "/home" });
          } catch {
            // if the endpoint fails then the user is not authorized and must login
            const referrer = document.referrer;
            if (
              referrer.includes("testfiesta.com") ||
              referrer.includes("localhost:8084")
            ) {
              window.location.href = referrer;
            } else {
              const loginUrl =
                window.location.hostname === "localhost"
                  ? "http://localhost:8084/login?from=pinata"
                  : "https://app.testfiesta.com/login?from=pinata";
              window.location.href = loginUrl;
            }
          }
        },
      },
    ],
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/main",
    name: "Main",
    component: MainView,
    children: [{ path: "workspace" }, { path: "workspace/:execID" }],
  },
  {
    path: "/settings",
    component: SettingView,
    children: [
      {
        path: "account",
        name: "myAccount",
        component: MyAccountTab,
        props: true,
      },
      {
        path: "general",
        name: "general",
        component: GeneralTab,
        props: true,
      },
      {
        path: "connections",
        name: "connections",
        component: ConnectionsTab,
        props: true,
      },
      {
        path: "support",
        name: "support",
        component: SupportTab,
        props: true,
      },
      {
        path: "template",
        name: "template",
        component: TemplateTab,
        props: true,
      },
      {
        path: "checklist",
        name: "checklist",
        component: ConfigCheckListTab,
        props: true,
      },
      {
        path: "reports",
        name: "reports",
        component: ReportsTab,
        props: true,
      },
      {
        path: "addons",
        name: "addons",
        component: AddonsTab,
        props: true,
      },
      {
        path: "hotkeys",
        name: "hotkeys",
        component: HotkeysTab,
        props: true,
      },
      {
        path: "tabs",
        name: "tabs",
        component: TagsTab,
        props: true,
      },
    ],
  },
  {
    path: "/result",
    name: "result",
    component: ResultView,
  },
  {
    path: "/print",
    name: "print",
    component: PrintView,
  },
  {
    path: "/minimize",
    name: "minimize",
    meta: { layout: "minimize" },
    component: LowProfileView,
  },
  {
    path: "*",
    redirect: "/",
  },
];

const isElectron = process.env.IS_ELECTRON === "true";
const router = new VueRouter({
  mode: isElectron ? "hash" : "history",
  base: process.env.BASE_URL,
  routes,
});

// Authentication guard
router.beforeEach(async (to, from, next) => {
  const loginUrl =
    process.env.VUE_APP_ENV === "production"
      ? "https://testfiesta.com/login?from=pinata"
      : "http://localhost:8084/login?from=pinata";

  const isAuthenticated = store.getters["user/isAuthenticated"];

  // Allow /auth/:handle and /auth/:handle/:projectKey to run their own guards
  if (
    to.matched.some(
      (record) =>
        record.path === "/auth/:handle" ||
        record.path === "/auth/:handle/:projectKey"
    )
  ) {
    return next();
  }

  // Default root path to /home
  if (to.path === "/") {
    return next({ path: "/home" });
  }

  // Block authenticated users from accessing login/register
  if (isAuthenticated && ["/login", "/register"].includes(to.path)) {
    return next({ path: "/home" });
  }

  // if not authenticated & in the web version then redirect to TF login
  if (!isAuthenticated && !process.env.IS_ELECTRON) {
    return next((window.location.href = loginUrl));
  }

  next();
});

// Global configuration check
router.beforeEach(async (to, from, next) => {
  next();
});

// Session path tracking
router.beforeEach((to, from, next) => {
  if (
    from.matched.length > 0 &&
    !to.path.includes("settings") &&
    store.state.session.sessionID
  ) {
    store.commit("setSessionPath", to.path);
  }
  next();
});

export default router;
