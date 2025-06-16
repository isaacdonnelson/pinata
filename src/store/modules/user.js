import { showErrorToast } from "@/utils/toast";

export const user = {
  namespaced: true,
  state: () => ({
    user: null,
    orgs: [],
    currentAccount: null,
    signupOrgDetails: null,
    invite: null,
    accounts: [],
    isAuthenticated: false,
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
    setProfileImage(state, url) {
      if (state.user) {
        state.user.avatar_url = url;
      }
    },
    clearUser(state) {
      state.user = null;
      state.orgs = [];
      state.currentAccount = null;
      state.isAuthenticated = false;
    },
    setAuthenticated(state, isAuthenticated) {
      console.log("authenticated?? " + isAuthenticated);
      state.isAuthenticated = isAuthenticated;
    },
  },
  actions: {
    async getHandlePreferences({ commit }, { handle, accountType }) {
      try {
        const response = await this._vm.$storageService.getHandlePreferences(
          handle
        );
        const preferencesData = response.data.preferences || response.data;

        const timestamp = new Date().getTime();
        commit("setUserPreferences", {
          preferences: { ...preferencesData, timestamp },
          type: accountType,
          handle,
        });
      } catch (err) {
        console.error("Error fetching handle preferences:", err);
        showErrorToast(
          "fetchError",
          { item: "preferences" },
          err?.response?.data
        );
      }
    },
    setCurrentAccount({ commit }, currentAccount) {
      commit("setCurrentAccount", currentAccount);
    },
    setOrgs({ commit }, newOrgs) {
      commit("setOrgs", newOrgs);
    },
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
      commit("setUser", {
        ...data,
        preferences: preferences || {},
      });
    },
    setUserPreferences({ commit }, preferences) {
      commit("setUserPreferences", preferences);
    },
    initSession({ dispatch }, { user, currentAccount, orgs }) {
      dispatch("setUser", user);
      dispatch("setCurrentAccount", currentAccount);
      dispatch("setOrgs", orgs || []);
    },
    async uploadProfileImage({ commit }, file) {
      try {
        const response = await this._vm.$storageService.uploadProfileImage(
          file
        );
        if (response.success) {
          commit("setProfileImage", response.url);
          return { success: true, url: response.url };
        }
        return { success: false };
      } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
      }
    },
    async loginUser({ commit }, credentials) {
      try {
        const response = await this._vm.$storageService.loginUser(credentials);
        commit("setUser", response.user);
        commit("setOrgs", response.orgs || []);
        commit("setCurrentAccount", response.defaultAccount);
        commit("setAuthenticated", true);
        return response;
      } catch (error) {
        commit("setUser", null);
        commit("setOrgs", null);
        commit("setCurrentAccount", null);
        commit("setAuthenticated", false);
        throw error;
      }
    },
    async registerUser({ commit }, userData) {
      try {
        const response = await this._vm.$storageService.registerUser(userData);
        commit("setUser", response.user);
        commit("setOrgs", response.orgs || []);
        commit("setCurrentAccount", response.defaultAccount);
        commit("setAuthenticated", true);
        return response;
      } catch (error) {
        commit("setUser", null);
        commit("setOrgs", null);
        commit("setCurrentAccount", null);
        commit("setAuthenticated", false);
        throw error;
      }
    },
    async updateUserProfile({ commit }, profileData) {
      try {
        const response = await this._vm.$storageService.updateUserProfile(
          profileData
        );
        commit("setUser", response.user); // Update the user in Vuex state
        return response;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    async forgotPassword(email) {
      try {
        return await this._vm.$storageService.forgotPassword(email);
      } catch (error) {
        console.error("Error in forgotPassword:", error);
        throw error;
      }
    },
    async logout({ commit }) {
      commit("clearUser");
      await this._vm.$storageService.logout();
    },
    async getUserProfile({ commit }) {
      try {
        const response = await this._vm.$storageService.getUserProfile();
        if (response && response.uid) {
          commit("setUser", response);
          commit("setAuthenticated", true);
          return response;
        } else {
          commit("setUser", null);
          commit("setAuthenticated", false);
          throw new Error("Failed to get user profile");
        }
      } catch (error) {
        commit("setUser", null);
        commit("setAuthenticated", false);
        throw error;
      }
    },
  },
  getters: {
    getOrgs(state) {
      state.orgs = this._vm.$storageService.getOrgs() || state.orgs;
      return state.orgs;
    },
    getCurrentAccount(state) {
      return state.currentAccount;
    },
    getInvite(state) {
      return state.invite;
    },
    userName(state) {
      return state.user
        ? `${state.user.first_name} ${state.user.last_name}`
        : "";
    },
    isAuthenticated(state) {
      return state.isAuthenticated;
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
      return state?.user?.preferences || {};
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
    isOrgAdmin: (state) => (handle) => {
      let org = state.orgs.filter((org) => org.handle == handle)[0];
      return org && org.roleName !== "member";
    },
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
