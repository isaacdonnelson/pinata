import axios from "axios";
import StorageInterface from "../storageInterface";
import store from "@/store";
import router from "@/router";
import { v4 as uuidv4 } from "uuid";
import AuthService from "./api/AuthService";
import UserService from "./api/UserService";
import StateService from "./api/StateService";
import AttachmentService from "./api/AttachmentService";
import ProjectsService from "./api/ProjectsService";
import ConfigService from "./api/ConfigService";

export default class RestApiService extends StorageInterface {
  constructor() {
    super();

    this.api = axios.create({
      baseURL: process.env.VUE_APP_API_URL || "http://localhost:5050/core",
      withCredentials: true,
    });

    // Add request interceptor for trace ID
    this.api.interceptors.request.use(
      (config) => {
        const traceId = uuidv4();
        config.headers["X-Trace-ID"] = traceId;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401) {
          // Clear user data from store
          store.commit("user/setUser", null);
          store.commit("user/setOrgs", null);
          store.commit("user/clearUser");
          // Clear user data from localStorage but preserve currentAccount
          localStorage.setItem("user", JSON.stringify(null));
          localStorage.setItem("orgs", JSON.stringify(null));

          // Redirect to login
          if (router.currentRoute.name !== "Home") {
            router.push({ path: "/home" });
          }
        }
        return Promise.reject(error);
      }
    );
    this.userService = new UserService(this.api);
    this.stateService = new StateService(this.api, store);
    this.authService = new AuthService(this.api, this.userService);
    this.attachmentService = new AttachmentService(this.api);
    this.configService = new ConfigService(this.api);
    this.projectsService = new ProjectsService(this.api);
  }

  // config endpoints
  async createConfig(config) {
    return this.configService.createConfig(config);
  }
  async getConfig(config) {
    return this.configService.getConfig(config);
  }

  async updateConfig(config) {
    return this.configService.updateConfig(config);
  }

  // attachments endpoints
  // TODO: implement attachments
  async cleanupAttachments(handle, id, relatedTo) {
    return this.attachmentService.cleanupAttachments(handle, id, relatedTo);
  }

  async getSignedAttachmentUrl(handle, payload) {
    return this.attachmentService.getSignedAttachmentUrl(handle, payload);
  }

  async getAttachment(type, attachmentId) {
    return this.attachmentService.getAttachment(type, attachmentId);
  }

  // projects endpoints
  async getProject() {
    return this.projectsService.getProject();
  }

  // auth endpoints
  async loginUser(credentials) {
    return this.authService.loginUser(credentials);
  }

  async logout() {
    return this.authService.logout();
  }

  async registerUser(userData) {
    return this.authService.registerUser(userData);
  }

  // eslint-disable-next-line no-unused-vars
  async verifyEmail(data) {
    // this.authService.verifyEmail(data);
  }

  async forgotPassword(email) {
    return this.authService.forgotPassword(email);
  }

  async validateInvite(data) {
    return this.authService.validateInvite(data);
  }

  async validateGoogleSignUp(token) {
    return this.authService.validateGoogleSignUp(token);
  }

  // user endpoints
  async getProfile() {
    return this.userService.getProfile();
  }

  async getOrgs(userId) {
    return this.userService.getOrgs(userId);
  }

  async getHandlePreferences() {
    return this.userService.getHandlePreferences();
  }
  async updateUserProfile(profileData) {
    return this.userService.updateUserProfile(profileData);
  }

  async getUserProfile() {
    return this.userService.getUserProfile();
  }

  // state management endpoints
  async getState(executionId) {
    return this.stateService.getState(executionId);
  }

  async updateState(state) {
    return this.stateService.updateState(state);
  }

  async createTestCase(state) {
    return this.stateService.createTestCase(state);
  }

  async createExecutionWithCase(state) {
    return this.stateService.createExecutionWithCase(state);
  }

  async createNewSession(state) {
    return this.stateService.createNewSession(state);
  }

  async saveSession() {
    // This method is not implemented
  }

  async resetData(state) {
    return this.stateService.resetData(state);
  }

  // misc
  // TODO: test this method - is it necessary?
  async getItemById(id) {
    console.log("getItemById called with id:", id);
    const itemInStore = store.state.session.items.find(
      (item) => item.stepID === id
    );
    return itemInStore;
  }

  // TODO: Implement this method to fetch credentials from the backend?
  async updateCredentials(credentials) {
    console.log(credentials);
  }
  // Todo: Implement this method to fetch accessTokens from the backend?
  async getCredentials() {
    // const url = `${this.baseURL}/${this.handle}/accessTokens`;
    // const response = await axios.get(url, { withCredentials: true });
    // return response;
  }
}
