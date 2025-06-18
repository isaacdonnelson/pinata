import i18n from "@/i18n";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export const project = {
  state: () => ({
    projects: [],
    totalArchived: 0,
    totalActive: 0,
    project: null,
  }),

  mutations: {
    SET_PROJECTS: (state, projects) => (state.projects = projects),
    SET_PROJECT: (state, project) => (state.project = project),
    ADD_PROJECT: (state, project) => state.projects.unshift(project),
    DELETE_PROJECT: (state, projectKey) =>
      (state.projects = state.projects.filter(
        (project) => project.key !== projectKey
      )),
    UPDATE_PROJECT: (state, updatedProject) => {
      const index = state.projects.findIndex(
        (project) => project.key === updatedProject.key
      );
      if (index !== -1) {
        state.projects.splice(index, 1, updatedProject);
      }
    },
    SET_TOTAL_ARCHIVED: (state, total) => {
      state.totalArchived = total;
    },
    SET_TOTAL_ACTIVE: (state, total) => {
      state.totalActive = total;
    },
  },

  actions: {
    getProject: async function ({ commit }) {
      try {
        const response = await this._vm.$storageService.getProject();
        if (response.data && response.data.items) {
          commit("SET_PROJECTS", response.data.items);
        }

        if (response.data.meta) {
          commit("SET_TOTAL_ARCHIVED", response.data.meta?.totalArchived || 0);
          commit("SET_TOTAL_ACTIVE", response.data.meta?.totalActive || 0);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    },
    addProject: async function ({ commit }, { swal, handle, payload }) {
      try {
        const response = await this._vm.$storageService.createProject(
          handle,
          payload
        );
        if (response.data) {
          commit("ADD_PROJECT", response.data);
          showSuccessToast(swal, i18n.t("success.projectCreated"));
        }
        return response;
      } catch (err) {
        showErrorToast(swal, err.response.data.message);
      }
    },
    deleteProject: async function ({ commit }, { swal, handle, projectKey }) {
      try {
        await this._vm.$storageService.deleteProject(handle, projectKey);
        commit("DELETE_PROJECT", projectKey);
        showSuccessToast(swal, i18n.t("success.projectDeleted"));
      } catch (err) {
        showErrorToast(swal, err.response.data.message);
      }
    },
    updateProject: async function (
      { commit },
      { swal, handle, oldProject, payload }
    ) {
      try {
        await this._vm.$storageService.updateProject(
          handle,
          oldProject.key,
          payload
        );
        commit("UPDATE_PROJECT", { ...oldProject, ...payload });
        showSuccessToast(swal, i18n.t("success.projectUpdated"));
      } catch (err) {
        if (err.response.status === 422) {
          showErrorToast(swal, err.response.data.message);
        }
      }
    },
  },

  getters: {
    projects(state) {
      return state.projects;
    },
    project(state) {
      return state.project;
    },
  },
};
