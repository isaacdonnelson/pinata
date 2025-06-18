import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class AuthService extends StorageInterface {
  constructor(api, userService) {
    super();
    this.api = api;
    this.userService = userService;
  }

  get handle() {
    return store.state.user.currentAccount?.handle;
  }

  get projectKey() {
    return store.state.user.currentAccount?.projectKey;
  }

  async loginUser(credentials) {
    const url = `/signin`;

    const response = await this.api.post(url, credentials);

    const { user } = response.data;
    const orgResponse = await this.userService.getOrgs(user.uid);
    const { orgs } = orgResponse.orgs;

    const account = {
      handle: user.handle,
      type: "user",
      name: `${user.firstName} ${user.lastName}`,
      roleName: "owner",
      avatarUrl: user.avatarUrl,
    };
    console.log("Login successful:", response.data);
    return {
      ...response.data,
      orgs,
      defaultAccount: account,
    };
  }

  async logout() {
    const url = `/logout`;

    const response = await this.api.post(url);
    return response.data;
  }

  async registerUser(userData) {
    const url = `/signup`;
    const payload = {
      handle: userData.handle,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    };

    const response = await this.api.post(url, payload);
    return response.data;
  }

  // todo: implement this method to verify email
  // async verifyEmail(data) {
  //   const url = `/`;
  //     const response = await this.api.post(url, { email: data });
  //     return response.data;
  // }

  // async setPassword(token, password) {
  //   const url = `/auth/set-password`;
  //     const response = await this.api.post(url, { token, password });
  //     return response.data;
  // }

  async forgotPassword(email) {
    const url = `/forgot-password`;
    const response = await this.api.post(url, { email });
    return response.data;
  }

  async validateInvite(data) {
    const url = `/orgs/${data.handle}/invite/${data.token}`;
    const response = await this.api.get(url);
    return response.data;
  }
  async validateGoogleSignUp(token) {
    const url = `/signup/google/validate?signupToken=${token}`;
    const response = await this.api.get(url);
    return response.data;
  }
}
