import StorageInterface from "@/services/storageInterface";
export default class ProjectService extends StorageInterface {
  constructor(api, store) {
    super();
    this.api = api;
    this.store = store;
  }

  get handle() {
    return this.store.state.user.user.handle;
  }

  async getProject() {
    const url = `/${this.handle}/projects`;
    const response = await this.api.get(url);
    return response.data;
  }
}
