/* eslint-disable no-unused-vars */
export default class StorageInterface {
  async login(credentials) {
    throw new Error("Method 'login(credentials)' must be implemented.");
  }

  async logout() {
    throw new Error("Method 'logout()' must be implemented.");
  }

  async checkAuth() {
    throw new Error("Method 'checkAuth()' must be implemented.");
  }

  async loginWithGoogle() {
    throw new Error("Method 'loginWithGoogle()' must be implemented.");
  }

  async registerUser(userData) {
    throw new Error("Method 'registerUser(userData)' must be implemented.");
  }

  async verifyEmail(token) {
    throw new Error("Method 'verifyEmail(token)' must be implemented.");
  }

  async resendVerification(email) {
    throw new Error("Method 'resendVerification(email)' must be implemented.");
  }

  async getState(executionId) {
    throw new Error("Method 'getState()' must be implemented.");
  }

  async updateState(state) {
    throw new Error("Method 'updateState()' must be implemented.");
  }

  async createConfig() {
    throw new Error("Method 'createConfig()' must be implemented.");
  }

  async getConfig(config) {
    throw new Error("Method 'getConfig(config)' must be implemented.");
  }

  async getCredentials() {
    throw new Error("Method 'getCredentials()' must be implemented.");
  }

  async updateCredentials(credentials) {
    throw new Error("Method 'updateCredentials()' must be implemented.");
  }

  async getItems() {
    throw new Error("Method 'fetchItems()' must be implemented.");
  }

  async getItemById(id) {
    throw new Error("Method 'getItemById(id)' must be implemented.");
  }

  async updateItem(state) {
    throw new Error("Method 'updateItems(state)' must be implemented.");
  }

  async updateItems(state) {
    throw new Error("Method 'updateItems(state)' must be implemented.");
  }

  async getNotes() {
    throw new Error("Method 'getNotes()' must be implemented.");
  }

  async updateNotes(notes) {
    throw new Error("Method 'updateNotes()' must be implemented.");
  }

  async createNewSession(state) {
    throw new Error("Method 'createNewSession(state)' must be implemented.");
  }

  async validateInvite(data) {
    throw new Error("Method 'validateInvite(data)' must be implemented.");
  }

  async validateGoogleSignUp(token) {
    throw new Error("Method 'validateGoogleSignUp(data)' must be implemented.");
  }

  async uploadProfileImage(file) {
    throw new Error("Method 'uploadProfileImage(file)' must be implemented.");
  }

  async loginUser(user) {
    throw new Error("Method 'loginUser(user)' must be implemented.");
  }

  async getOrgs(userId) {
    throw new Error("Method 'getOrgs(userId)' must be implemented.");
  }

  async getHandlePreferences(handle) {
    throw new Error(
      "Method 'getHandlePreferences(handle)' must be implemented."
    );
  }

  async updateUserProfile(profile) {
    throw new Error("Method 'updateUserProfile(profile)' must be implemented.");
  }

  async forgotPassword(email) {
    throw new Error("Method 'forgotPassword(email)' must be implemented.");
  }

  async cleanupAttachments(handle, id, relatedTo) {
    throw new Error(
      "Method 'cleanupAttachments(handle, id, relatedTo)' must be implemented."
    );
  }

  async getSignedAttachmentUrl(handle, payload) {
    throw new Error(
      "Method 'getSignedAttachmentUrl(handle, payload)' must be implemented."
    );
  }
}
