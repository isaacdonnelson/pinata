import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class ConfigService extends StorageInterface {
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

  async createConfig(config) {
    const url = `/${this.handle}/pinata/configs`;
    const response = await this.api.post(url, config);
    return response.data;
  }
  async getConfig(config) {
    const configId = config.uid;
    const url = `/${this.handle}/pinata/configs/${configId}`;
    const { data } = await this.api.get(url);
    return data;
  }

  async updateConfig(config) {
    const configId = config.uid;
    const url = `/${this.handle}/pinata/configs/${configId}`;
    const { data } = await this.api.patch(url, config);
    return data;
  }
}
