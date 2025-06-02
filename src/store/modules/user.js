// import { registerUserUtil } from "@/modules/PersistenceUtility";x
// import { stat } from "original-fs";

export const user = {
  namespaced: true,
  state: () => ({
    user: null,
    orgs: [],
    currentAccount: null,
    signupOrgDetails: null,
    invite: null,
  }),
  mutations: {
    // TODO - needed for pinata?
    // setProjectAuthz(state, { permissions, handle, projectKey }) {
    //   const orgIndex = state.orgs.findIndex((org) => org.handle === handle);
    //   if (!state.orgs[orgIndex].projectAuthz)
    //     state.orgs[orgIndex].projectAuthz = {};
    //   state.orgs[orgIndex].projectAuthz[projectKey] = {
    //     permissions,
    //     updatedAt: Date.now(),
    //   };
    // },
    // _setOrgAuthz(state, { permissions, handle }) {
    //   const orgIndex = state.orgs.findIndex((org) => org.handle === handle);
    //   if (orgIndex === -1) return false;
    //   state.orgs[orgIndex].orgAuthzPermissions = permissions;
    //   state.orgs[orgIndex].orgAuthzUpdatedAt = Date.now();
    //   return true;
    // },
    validateGoogleSignUp(state, token) {
      return this._vm.$storageService.validateGoogleSignUp(token);
    },
    registerUser(state, user) {
      state.user = user;
      this._vm.$storageService.registerUser(user);
    },
    setUser(state, user) {
      state.user = user;
    },
    setInvite(state, user) {
      state.invite = user;
      return this._vm.$storageService.validateInvite(user);
    },
    updateUser(state, user) {
      state.user = { ...state.user, ...user };
    },
    setOrgs(state, orgs) {
      state.orgs = orgs;
    },
    setSignupOrgDetails(state, orgDetails) {
      state.signupOrgDetails = orgDetails;
    },
    updateOrg(state, org) {
      const findIndex = state.orgs.findIndex(
        (element) => element.uid == org.uid
      );
      state.orgs[findIndex] = org;
    },
    setCurrentAccount(state, currentAccount) {
      state.currentAccount = currentAccount;
    },
    emptyState(state) {
      state.user = null;
      state.currentAccount = null;
      state.orgs = [];
    },
    setAccounts(state, accounts) {
      state.accounts = accounts;
    },
    setUserPreferences(state, preferences) {
      state.user.preferences = preferences;
    },
  },
  actions: {
    // todo - refactor to use the pinata storage service
    // eslint-disable-next-line no-unused-vars
    initSettings({ state, dispatch }) {
      // const currentAccount = settingsService.getCurrentAccount();
      // // Verify current account access
      // if (currentAccount && state.orgs) {
      //   const hasAccess = state.orgs.some(
      //     (org) => org.uid === currentAccount.uid
      //   );
      //   if (!hasAccess) {
      //     // User no longer has access to current account, reset to first available org
      //     if (state.orgs.length > 0) {
      //       const defaultAccount = {
      //         isOrg: true,
      //         ...state.orgs[0],
      //       };
      //       settingsService.setCurrentAccount(defaultAccount);
      //       state.currentAccount = defaultAccount;
      //     } else {
      //       settingsService.setCurrentAccount(null);
      //       state.currentAccount = null;
      //     }
      //   } else {
      //     state.currentAccount = currentAccount;
      //   }
      // }
      // // Set default account if none exists
      // if (!state.currentAccount && state.orgs && state.orgs.length > 0) {
      //   const defaultAccount = {
      //     isOrg: true,
      //     ...state.orgs[0],
      //   };
      //   settingsService.setCurrentAccount(defaultAccount);
      //   state.currentAccount = defaultAccount;
      // }
      // if (state.currentAccount) {
      //   dispatch("project/get", state.currentAccount.uid, { root: true });
      // }
    },
    async updateProjectAuthz() {
      // async updateProjectAuthz({ commit }, { handle, projectKey }) {
      // const projectsService = makeProjectsService(api);
      // const response = await projectsService.getAuthz(handle, projectKey);
      // commit("setProjectAuthz", {
      // permissions: response.data[handle].projects[projectKey],
      // handle,
      // projectKey,
      // });
    },
    // eslint-disable-next-line no-unused-vars
    async setOrgAuthz({ commit, state }, { permissions, handle }) {
      // async setOrgAuthz({ commit, dispatch, state }, { permissions, handle }) {
      // commit("_setOrgAuthz", { permissions, handle });
      // if (state.orgs.find((org) => org.handle === handle)) return;
      // const userService = makeUserService(api);
      // try {
      // const response = await userService.getOrgs(handle);
      // await dispatch("setOrgs", response.data?.orgs || []);
      // commit("_setOrgAuthz", { permissions, handle });
      // if (state.orgs.find((org) => org.handle === handle)) return;
      // commit("error404/SET_SHOW_404", true, { root: true });
      // } catch (error) {
      // console.error("Failed to set org permissions:", error);
      // throw error;
      // }
    },
    async updateOrgAuthz() {
      // async updateOrgAuthz({ dispatch }, handle) {
      // const orgService = makeOrgService(api);
      // const response = await orgService.getAuthz(handle);
      // await dispatch("setOrgAuthz", {
      //   permissions: response.data[handle].permissions,
      //   handle,
      // });
    },
    /**
     * set currently selected account
     * @param {Object} currentAccount
     */
    setCurrentAccount({ commit }, currentAccount) {
      // settingsService.setCurrentAccount(currentAccount);
      commit("setCurrentAccount", currentAccount);
    },
    setOrgs({ commit }, newOrgs) {
      // credentialService.setOrgs(newOrgs);
      commit("setOrgs", newOrgs);
    },
    /**
     * set user on org and cache
     * @param {Object} newUser
     */
    setUser({ commit }, newUser) {
      const { preferences, ...data } = newUser;
      const fieldsToIgnore = ["secret", "phoneNumber", "recoveryCodes"];

      if (preferences) {
        fieldsToIgnore.forEach((field) => {
          if (field in preferences) {
            delete preferences[field];
          }
        });
      }

      // credentialService.setUser({
      // ...data,
      // preferences: preferences || {},
      // });
      commit("setUser", {
        ...data,
        preferences: preferences || {},
      });
    },
    setUserPreferences({ commit }, preferences) {
      commit("setUserPreferences", preferences);
    },
    /**
     * persists a user session for subsequent auth
     * @param {*} param0
     * @param {*} accounts
     */
    initSession({ dispatch }, { user, currentAccount, orgs }) {
      dispatch("setUser", user);
      dispatch("setCurrentAccount", currentAccount);
      dispatch("setOrgs", orgs || []);
    },
  },
  getters: {
    getInvite(state) {
      return state.invite;
    },
    userName(state) {
      return state.user
        ? `${state.user.first_name} ${state.user.last_name}`
        : "";
    },
    isAuthenticated(state) {
      return state?.user;
    },
    currentAccount(state) {
      return state?.currentAccount;
    },
    user(state) {
      return state?.user;
    },
    accounts(state) {
      return state.accounts;
    },
    orgs(state) {
      return state.orgs;
    },
    getUserPreferences(state) {
      return state?.user.preferences || {};
    },
    getSignupOrgDetails(state) {
      return state.signupOrgDetails;
    },
    getUserStatusColorsByEntityType: (_, getters) => (entityType) => {
      const preferencesData = getters.getUserPreferences;
      return (
        preferencesData?.statusColors?.filter(
          (status) => status.entityType === entityType
        ) || []
      );
    },
    getUserPriorityColorsByEntityType: (_, getters) => (entityType) => {
      const preferencesData = getters.getUserPreferences;
      return (
        preferencesData?.priorityColors?.filter(
          (priority) => priority.entityType === entityType
        ) || []
      );
    },
    /**
     * returns true if the current user is org admin
     * @param {String} handle
     * @return {Boolean} isAdmin
     */
    isOrgAdmin: (state) => (handle) => {
      let org = state.orgs.filter((org) => org.handle == handle)[0];
      return org && org.roleName !== "member";
    },
    /**
     * get org with org handle
     * @param {String} handle
     * @return {Object} org
     */
    getOrg: (state) => (handle) => {
      return state.orgs.filter((org) => org.handle == handle)[0];
    },
    currentPermissions: (state) => (handle, projectKey) => {
      if (!handle) {
        console.log("Handle required for authz.");
      }
      const orgIndex = state.orgs.findIndex((org) => org.handle === handle);
      if (orgIndex == -1) return [];

      const isWorkspacePermissions = state.user.orgs
        ?.map((item) => item.handle)
        .includes(handle);
      return projectKey
        ? isWorkspacePermissions
          ? state.user?.projectAuthz?.[projectKey]?.permissions
          : state.orgs[orgIndex].projectAuthz[projectKey].permissions
        : isWorkspacePermissions
        ? state.user.orgAuthzPermissions
        : state.orgs[orgIndex].orgAuthzPermissions;
    },
  },
};
