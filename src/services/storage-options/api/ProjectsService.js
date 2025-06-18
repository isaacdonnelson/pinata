import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class ProjectService extends StorageInterface {
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

  async getProject() {
    const url = `/${this.handle}/projects`;
    const response = await this.api.get(url);
    return response.data;
  }
}
