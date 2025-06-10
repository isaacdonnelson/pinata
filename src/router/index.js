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
import ForgotPasswordPage from "@/components/auth/views/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/auth/views/ResetPasswordPage.vue";
import ContinueWithSSOPage from "@/components/auth/views/NonExistingUserInvitePage.vue";
import ExistingUserInvitePage from "@/components/auth/views/ExistingUserInvitePage.vue";
import EmailConfirmationPage from "@/components/auth/views/EmailConfirmationPage.vue";
import CreatePasswordPage from "@/components/auth/views/CreatePasswordPage.vue";

Vue.use(VueRouter);

// TODO: Uncomment and implement the authentication guard logic
// Public routes that don't require authentication
// const publicRoutes = [
//   "/login",
//   "/register",
//   "/forgot-password",
//   "/reset-password",
//   "/invite",
//   "/email-confirmation",
//   "/verify-email",
//   "/create-password",
// ];

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
        path: "/forgot-password",
        name: "ForgotPassword",
        component: ForgotPasswordPage,
      },
      {
        path: "/reset-password",
        name: "ResetPassword",
        component: ResetPasswordPage,
      },
      {
        path: "/invite/existing/:token",
        name: "ExistingUserInvite",
        component: ExistingUserInvitePage,
      },
      {
        path: "/invite/:token",
        name: "InvitationRegistration",
        component: ContinueWithSSOPage,
      },
      {
        path: "/email-confirmation",
        name: "EmailConfirmation",
        component: EmailConfirmationPage,
      },
      {
        path: "/verify-email",
        name: "VerifyEmail",
        component: EmailConfirmationPage,
      },
      {
        path: "/create-password",
        name: "CreatePassword",
        component: CreatePasswordPage,
      },
      {
        path: "/auth/:handle/:projectKey",
        name: "Auth",
        props: true,
        // meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
    meta: { requiresAuth: true },
    children: [{ path: "workspace" }, { path: "workspace/:execID" }],
  },
  {
    path: "/settings",
    component: SettingView,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: "/print",
    name: "print",
    component: PrintView,
    meta: { requiresAuth: true },
  },
  {
    path: "/minimize",
    name: "minimize",
    meta: { layout: "minimize" },
    component: LowProfileView,
  },
  // Catch all route - 404
  {
    path: "*",
    redirect: "/",
  },
];

// TODO: verify why process.env.IS_ELECTRON is not working
const router = new VueRouter({
  mode: navigator.userAgent.includes("Electron") ? "hash" : "history",
  base: process.env.BASE_URL,
  routes,
});

// TODO: Uncomment and implement the authentication guard logic
// Simplified beforeEach guard
// router.beforeEach(async (to, from, next) => {
// const isAuthenticated = store.getters["user/isAuthenticated"];
// const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

// // Handle root path
// if (to.path === "/") {
//   if (isAuthenticated) {
//     return next();
//   }
//   return next({ name: "Login" });
// }

// // If user is authenticated and trying to access auth pages, redirect to home
// if (isAuthenticated && isPublicRoute && to.path !== "/") {
//   return next({ name: "Home" });
// }

// // If route requires auth and user is not authenticated, redirect to login
// if (
//   to.matched.some((record) => record.meta.requiresAuth) &&
//   !isAuthenticated
// ) {
//   store.commit("user/setRedirectPath", to.fullPath);
//   return next({ name: "Login" });
// }

// next();
// });

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
