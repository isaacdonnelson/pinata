import StorageInterface from "../storageInterface";
import { IPC_FUNCTIONS, IPC_HANDLERS } from "@/modules/constants";
import RestApiService from "./restApiService";

export default class LocalJsonDbService extends StorageInterface {
  constructor() {
    super();
    this.restApi = new RestApiService();
  }

  async getState() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_STATE,
    });
  }

  async updateState(state) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_STATE,
      data: state,
    });
  }

  async createConfig(config) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.CREATE_CONFIG,
      data: config,
    });
  }

  async getConfig(config) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CONFIG,
      data: config,
    });
  }

  async updateConfig(config) {
    return window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CONFIG,
      data: config,
    });
  }

  async getCredentials() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CREDENTIALS,
    });
  }

  async getMetaData() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_METADATA,
    });
  }

  async updateCredentials(credentials) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });
  }

  async getItems() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_ITEMS,
    });
  }

  async getItemById(id) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_ITEM_BY_ID,
      data: id,
    });
  }

  async addItem(item) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.ADD_ITEM,
      data: item,
    });
  }

  async updateItem(item) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_ITEM,
      data: item,
    });
  }

  async updateItems(items) {
    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_ITEMS,
      data: items,
    });
  }

  async deleteItems(items) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.DELETE_ITEMS,
      data: items,
    });
  }

  async getNotes() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_NOTES,
    });
  }

  async updateNotes(notes) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_NOTES,
      data: notes,
    });
  }

  async deleteNotes(notes) {
    await await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.DELETE_NOTES,
      data: notes,
    });
  }

  async getNodes() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_NODES,
    });
  }

  async updateNodes(nodes) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_NODES,
      data: nodes,
    });
  }

  async getConnections() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CONNECTIONS,
    });
  }

  async updateConnections(connections) {
    await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CONNECTIONS,
      data: connections,
    });
  }

  async createNewSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.CREATE_NEW_SESSION,
      data: data,
    });
  }

  async getSessionId() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_SESSION_ID,
    });
  }

  async getCaseId() {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.GET_CASE_ID,
    });
  }

  async saveSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.SAVE_SESSION,
      data: data,
    });
  }

  async resetData(state) {
    return await window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.RESET_DATA,
      data: state,
    });
  }

  // The below methods are called in both the desktop and web app
  async loginUser(credentials) {
    return this.restApi.loginUser(credentials);
  }

  async getProfile() {
    return this.restApi.getProfile();
  }

  async logout() {
    return this.restApi.logout();
  }

  async checkAuth() {
    return this.restApi.checkAuth();
  }

  async loginWithGoogle() {
    return this.restApi.loginWithGoogle();
  }

  async registerUser(userData) {
    return this.restApi.registerUser(userData);
  }

  async stagedSignup(data) {
    return this.restApi.stagedSignup(data);
  }

  async verifyEmail(data) {
    return this.restApi.verifyEmail(data);
  }

  async resendVerification(email) {
    return this.restApi.resendVerification(email);
  }

  async setPassword(token, password) {
    return this.restApi.setPassword(token, password);
  }

  async forgotPassword(email) {
    return this.restApi.forgotPassword(email);
  }

  async refreshToken() {
    return this.restApi.refreshToken();
  }

  async getHandlePreferences() {
    return this.restApi.getHandlePreferences();
  }

  async updateUserProfile(userData) {
    return this.restApi.updateUserProfile(userData);
  }

  async cleanupAttachments(handle, id, relatedTo) {
    return this.restApi.cleanupAttachments(handle, id, relatedTo);
  }

  async getSignedAttachmentUrl(handle, payload) {
    return this.restApi.getSignedAttachmentUrl(handle, payload);
  }
}
