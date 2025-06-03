import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

import HomeView from "../views/HomeView.vue";
import MainView from "../views/MainView.vue";
import ResultView from "../views/ResultView.vue";
import PrintView from "../views/PrintView.vue";
import LowProfileView from "../views/LowProfileView.vue";

import SettingView from "../views/SettingView.vue";
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

// Auth views
import LoginPage from "@/components/auth/views/LoginPage.vue";
import RegisterPage from "@/components/auth/views/RegisterPage.vue";
import ForgotPasswordPage from "@/components/auth/views/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/auth/views/ResetPasswordPage.vue";
import ContinueWithSSOPage from "@/components/auth/views/NonExistingUserInvitePage.vue";
import ExistingUserInvitePage from "@/components/auth/views/ExistingUserInvitePage.vue";
import EmailConfirmationPage from "@/components/auth/views/EmailConfirmationPage.vue";
import CreatePasswordPage from "@/components/auth/views/CreatePasswordPage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: () => {
      return process.env.IS_ELECTRON ? "/login" : "/home";
    },
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPasswordPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/invite/existing/:token",
    name: "ExistingUserInvite",
    component: ExistingUserInvitePage,
    meta: {
      public: true,
    },
  },
  {
    path: "/invite/:token",
    name: "InvitationRegistration",
    component: ContinueWithSSOPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/email-confirmation",
    name: "EmailConfirmation",
    component: EmailConfirmationPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: EmailConfirmationPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/create-password",
    name: "CreatePassword",
    component: CreatePasswordPage,
    meta: {
      public: true,
    },
  },
  {
    path: "/main",
    name: "main",
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
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? "hash" : "history",
  base: process.env.BASE_URL,
  routes,
});

// Single beforeEach guard that handles auth
router.beforeEach(async (to, from, next) => {
  // Skip auth check for public routes
  if (to.meta.public) {
    return next();
  }

  // TODO - Uncomment and implement the auth check logic
  // try {
  // Handle Electron vs Web differently
  // if (process.env.IS_ELECTRON) {
  // Desktop version - check auth status via IPC
  //     const response = await store.dispatch("auth/checkAuth");
  //     if (!response.isAuthenticated) {
  //       store.commit("auth/setRedirectPath", to.fullPath);
  //       return next("/login");
  //     }
  //   } else {
  //     // Web version - check auth status via API
  //     const response = await store.dispatch("auth/checkAuth");
  //     if (!response.isAuthenticated) {
  //       store.commit("auth/setRedirectPath", to.fullPath);
  //       return next("/login");
  //     }
  //   }
  // } catch (error) {
  //   console.error("Auth check failed:", error);
  //   store.commit("auth/setRedirectPath", to.fullPath);
  //   return next("/login");
  // }

  // Then proceed with navigation
  next();
});

router.beforeEach((to, from, next) => {
  // This prevents us from saving store on initial load where name is null
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
