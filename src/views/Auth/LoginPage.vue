<template>
  <v-container
    id="login-container"
    fluid
    class="d-flex align-center justify-center"
  >
    <v-row v-if="showSSOLogin" class="d-flex align-center">
      <v-col
        offset="1"
        offset-sm="2"
        offset-md="2"
        offset-lg="3"
        cols="10"
        sm="8"
        md="8"
        lg="6"
      >
        <ValidationObserver
          id="sso-validation-observer"
          ref="ssoObserver"
          v-slot="{ handleSubmit }"
        >
          <v-form
            id="sso-login-form"
            ref="ssoForm"
            role="ssoLoginForm"
            @submit.prevent="handleSubmit(ssoLogin)"
          >
            <v-row class="fs-24px fw-semibold mb-8" justify="center">
              {{ $t("loginWithSSO") }}
            </v-row>
            <v-row class="d-flex flex-column">
              <div class="d-flex align-center">
                <v-label
                  class="text-left fs-14px text-theme-label font-weight-medium mb-0 pr-1"
                >
                  {{ $t("testfiestaOrganization") }}
                </v-label>
                <v-tooltip top max-width="300">
                  <template #activator="{ on, attrs }">
                    <v-icon
                      color="#0C2FF3"
                      small
                      class="ml-1 pointer"
                      v-bind="attrs"
                      style="vertical-align: middle"
                      v-on="on"
                    >
                      mdi-help-circle-outline
                    </v-icon>
                  </template>
                  <span>{{ $t("testfiestaOrganizationTooltip") }}</span>
                </v-tooltip>
              </div>
              <v-text-field
                id="org-handle-field"
                v-model="ssoLoginInfo.orgHandle"
                :placeholder="$t('enterOrgHandle')"
                :rules="accountNameValidation"
                background-color="#F9F9FB"
                class="field-theme"
                :disabled="ssoSignInBtnLoading"
              />
            </v-row>
            <v-row class="my-8 gap-4">
              <v-btn
                id="sso-login-button"
                type="submit"
                block
                color="primary"
                :depressed="true"
                class="btn-theme"
                width="188px"
                height="40"
                :loading="ssoSignInBtnLoading"
                :class="{ 'btn-loading-opacity': ssoSignInBtnLoading }"
              >
                {{ $t("loginWithSSO") }}
              </v-btn>
            </v-row>
            <v-row justify="center">
              <a
                id="login-in-link"
                role="button"
                class="text-decoration-none fw-semibold fs-14 ml-3"
                @click="showSSOLogin = false"
              >
                {{ $t("backToLogin") }}
              </a>
            </v-row>
          </v-form>
        </ValidationObserver>
      </v-col>
    </v-row>

    <v-row v-else class="d-flex align-center">
      <v-col
        offset="1"
        offset-sm="2"
        offset-md="2"
        offset-lg="3"
        cols="10"
        sm="8"
        md="8"
        lg="6"
      >
        <ValidationObserver
          id="validation-observer"
          ref="observer"
          v-slot="{ handleSubmit }"
        >
          <v-form
            id="login-form"
            ref="form"
            role="loginForm"
            @submit.prevent="handleSubmit(login)"
          >
            <v-row class="fs-24px fw-semibold mb-8" justify="center">
              {{ $t("signInHeader") }}
            </v-row>
            <v-row class="d-flex flex-column">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("emailOrUsernameLabel") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                id="username-field"
                v-model="loginInfo.email"
                :rules="emailOrUsernameValidation"
                :placeholder="
                  $t('inputPlaceholder', { field: $t('emailOrUsernameLabel') })
                "
                height="38"
                background-color="#F9F9FB"
                class="field-theme"
                :disabled="signinBtnLoading"
              />
            </v-row>
            <v-row class="d-flex flex-column">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("passwordLabel") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                id="password-field"
                v-model="loginInfo.password"
                :placeholder="$t('inputPlaceholder', { field: $t('password') })"
                height="38"
                :rules="passwordValidation"
                background-color="#F9F9FB"
                class="field-theme"
                :type="visiblePassword ? 'text' : 'password'"
                :append-icon="
                  visiblePassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :disabled="signinBtnLoading"
                @click:append="visiblePassword = !visiblePassword"
              />
            </v-row>
            <div
              class="row d-flex justify-space-between align-center justify-center"
            >
              <div class="d-flex justify-center align-center">
                <v-checkbox
                  id="remember-me-checkbox"
                  class="field-theme"
                  :ripple="false"
                  off-icon="icon-checkbox-off"
                  on-icon="icon-checkbox-on"
                >
                  <template #label>
                    <span class="fs-14 text-theme-label">{{
                      $t("rememberMe")
                    }}</span>
                  </template>
                </v-checkbox>
              </div>
              <router-link
                id="forgot-password-link"
                to="/forgotPassword"
                class="text-decoration-none fw-semibold fs-14"
              >
                {{ $t("forgotPassword") }}
              </router-link>
            </div>
            <v-row class="my-8 gap-4">
              <v-btn
                id="login-button"
                type="submit"
                block
                color="primary"
                :depressed="true"
                class="btn-theme"
                width="188px"
                height="40"
                :loading="signinBtnLoading"
                :class="{ 'btn-loading-opacity': signinBtnLoading }"
              >
                {{ $t("signIn") }}
              </v-btn>

              <ContinueWithGoogleButton :loading="signinBtnLoading" />

              <v-btn
                id="login-button"
                block
                class="bg-theme-base fw-semibold"
                :depressed="true"
                width="188px"
                height="40"
                :loading="ssoSignInBtnLoading"
                :class="{ 'btn-loading-opacity': ssoSignInBtnLoading }"
                @click="showSSOLogin = true"
              >
                {{ $t("continueWithSSO") }}
              </v-btn>
            </v-row>
            <v-row class="text-theme-secondary" justify="center">
              {{ $t("doNotHaveAccount") }}
              <router-link
                id="sign-up-link"
                to="/signup"
                class="text-decoration-none fw-semibold fs-14 ml-3"
              >
                {{ $t("signUpTo") }}
              </router-link>
            </v-row>
          </v-form>
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
const { mapActions, mapGetters } = createNamespacedHelpers("user");
import makeAuthService from "@/services/api/auth";
import makeUserService from "@/services/api/user";
import {
  emailOrUsernameValidationRules,
  requiredFieldValidationRules,
} from "@/utils/validation";

import colorPreferencesMixin from "@/mixins/colorPreferences";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import settingsService from "@/services/local/settings";
import ContinueWithGoogleButton from "@/components/Auth/ContinueWithGoogleButton";

let authService;
let userService;

export default {
  components: {
    ContinueWithGoogleButton,
  },
  mixins: [colorPreferencesMixin],
  data() {
    return {
      showSSOLogin: false,
      status: "not_accepted",
      loginForm: true,
      visiblePassword: false,
      loginInfo: {
        email: "",
        password: "",
      },
      emailOrUsernameValidation: emailOrUsernameValidationRules(this),
      passwordValidation: requiredFieldValidationRules(this),
      signinBtnLoading: false,
      ssoSignInBtnLoading: false,
      ssoLoginInfo: {
        orgHandle: "",
      },
    };
  },
  computed: {
    ...mapGetters(["currentAccount"]),
    accountNameValidation() {
      const defaultRules = [
        (value) => !!value || this.$t("error.requiredField"),
        (value) =>
          /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
            value
          ) || this.$t("invalidOrgHandle"),
      ];
      if (this.handleError) {
        return [...defaultRules];
      }
      return defaultRules;
    },
  },
  created() {
    authService = makeAuthService(this.$api);
    userService = makeUserService(this.$api);
  },
  async mounted() {
    const { loginToken } = this.$route.query;
    if (loginToken) {
      const response = await authService.validateGoogleLogin(loginToken);
      const user = response.data;

      const orgResponse = await userService.getOrgs(user.uid);
      const { orgs } = orgResponse.data;

      let account = {
        handle: user.handle,
        type: "user",
        name: `${user.firstName} ${user.lastName}`,
        roleName: "owner",
        avatarUrl: user.avatarUrl,
      };

      const savedAccount = settingsService.getCurrentAccount();
      if (savedAccount) {
        const matchingOrg = orgs.find((org) => org.uid === savedAccount.uid);
        if (matchingOrg) {
          account = matchingOrg;
        }
      }

      this.initSession({ user, currentAccount: account, orgs });
      this.updatePreferences(account.handle);

      showSuccessToast(this.$swal, this.$t("loginSuccess"));

      this.$router.push({
        name: "Workspace",
        params: { handle: account.handle },
      });
    }
  },
  methods: {
    ...mapActions(["initSession"]),
    validate() {
      return this.$refs.form.validate();
    },
    reset() {
      return this.$refs.form.reset();
    },
    resetValidation() {
      return this.$refs.form.resetValidation();
    },
    ssoValidate() {
      return this.$refs.ssoForm.validate();
    },
    ssoReset() {
      return this.$refs.ssoForm.reset();
    },
    ssoResetValidation() {
      return this.$refs.ssoForm.resetValidation();
    },
    login() {
      if (this.validate()) {
        this.signinBtnLoading = true;
        authService
          .login(this.loginInfo)
          .then(async (response) => {
            const { user } = response.data;
            const orgResponse = await userService.getOrgs(user.uid);
            const { orgs } = orgResponse.data;

            let account = {
              handle: user.handle,
              type: "user",
              name: `${user.firstName} ${user.lastName}`,
              roleName: "owner",
              avatarUrl: user.avatarUrl,
            };

            const savedAccount = settingsService.getCurrentAccount();
            if (savedAccount) {
              const matchingOrg = orgs.find(
                (org) => org.uid === savedAccount.uid
              );
              if (matchingOrg) {
                account = matchingOrg;
              }
            }

            this.initSession({ user, currentAccount: account, orgs });
            this.updatePreferences(account.handle);

            showSuccessToast(this.$swal, this.$t("loginSuccess"));

            const comingFromAuth =
              ["/login", "/signup", "/setup", "/"].includes(
                this.$router.history._startLocation
              ) ||
              this.$router.history._startLocation.startsWith("/resetPassword");
            const dest = comingFromAuth
              ? {
                  name: "Workspace",
                  params: { handle: account.handle },
                }
              : this.$router.history._startLocation;
            this.$router.replace(dest);
          })
          .catch((res) => {
            showErrorToast(
              this.$swal,
              res.response?.data?.error ?? this.$t("problemProcessingRequest")
            );
          })
          .finally(() => {
            this.signinBtnLoading = false;
          });
      }
    },
    ssoLogin() {
      if (this.ssoValidate()) {
        this.ssoSignInBtnLoading = true;
        this.$router.push({
          name: "continueWithSSO",
          params: { handle: this.ssoLoginInfo.orgHandle },
        });
      }
    },
  },
};
</script>
