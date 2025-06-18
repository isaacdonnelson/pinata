import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class AttachmentService extends StorageInterface {
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

  async cleanupAttachments(handle, id, relatedTo) {
    const url = `/${this.handle}/attachments/${id}/${relatedTo}`;
    const response = await this.api.delete(url);
    return response.data;
  }

  async getSignedAttachmentUrl(handle, payload) {
    const url = `/${this.handle}/attachments`;
    const response = await this.api.post(url, payload);
    return response.data;
  }
}
