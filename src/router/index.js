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
import SetupPage from "@/components/auth/views/SetupPage.vue";

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
        path: "/setup",
        name: "SetupPage",
        component: SetupPage,
      },
      {
        path: "/auth/:handle/:projectKey",
        name: "Auth",
        props: true,
        beforeEnter: async (to, from, next) => {
          const { handle, projectKey } = to.params;
          try {
            await store.dispatch("user/getUserProfile");
            if (handle && projectKey) {
              // TODO: Uncomment and implement the logic to set the current project
              // store.commit("setCurrentProject", { handle, projectKey });
            }
            if (store.getters["user/isAuthenticated"]) {
              next({ path: "/home" });
            } else {
              next({ path: "/login" });
            }
          } catch {
            next({ path: "/login" });
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
        path: "/",
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
  const isAuthenticated = store.getters["user/isAuthenticated"];

  // Default root path to /home
  if (to.path === "/") {
    return next({ path: "/home" });
  }

  // Block authenticated users from accessing login/register
  if (isAuthenticated && ["/login", "/register", "/setup"].includes(to.path)) {
    return next({ path: "/home" });
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
