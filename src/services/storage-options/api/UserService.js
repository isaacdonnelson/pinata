import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class UserService extends StorageInterface {
  constructor(api) {
    super();
    this.api = api;
  }

  get handle() {
    return store.state.user.currentAccount?.handle;
  }

  get projectKey() {
    return store.state.user.currentAccount?.projectKey;
  }

  async getProfile() {
    const url = `/handle/${this.handle}/profile`;
    const response = await this.api.get(url);
    return response.data;
  }

  async getOrgs(userId) {
    const url = `/users/${userId}/orgs`;

    const response = await this.api.get(url);
    return response.data;
  }

  async getHandlePreferences() {
    const url = `/${this.handle}/preferences`;

    const response = await this.api.get(url);
    return response.data;
  }

  async updateUserProfile(profileData) {
    const url = `/profile`;

    const response = await this.api.put(url, profileData);
    return response.data;
  }

  async getUserProfile() {
    const response = await this.api.get("/profile");
    return response.data;
  }
}
