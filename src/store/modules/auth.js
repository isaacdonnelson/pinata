export const auth = {
  namespaced: true,
  state: () => ({
    user: null,
    authType: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    redirectPath: null,
    credentials: null,
  }),
  mutations: {
    setUser(state, user) {
      state.user = user;
      this._vm.$storageService.register(state);
    },
    setAuthType(state, authType) {
      state.authType = authType;
    },
    setIsAuthenticated(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.authType = null;
      state.isAuthenticated = false;
    },
    setRedirectPath(state, path) {
      state.redirectPath = path;
    },
    setCredentials(state, credentials) {
      state.credentials = credentials;
    },
  },
  actions: {},
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    authType: (state) => state.authType,
    loading: (state) => state.loading,
    error: (state) => state.error,
    redirectPath: (state) => state.redirectPath,
    credentials: (state) => state.credentials,
  },
};
