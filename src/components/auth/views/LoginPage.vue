<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div class="content-container">
      <div class="content">
        <div class="login-wrapper pa-6">
          <div class="d-flex justify-center align-center mb-8">
            <router-link to="/">
              <img src="@/assets/logo.svg" alt="Pinata" height="32" />
            </router-link>
          </div>

          <div class="text-center login-header mb-8">Log in</div>
          <!-- TODO: implement Google auth -->
          <!-- <v-btn
            v-if="!isElectron"
            block
            :color="btnBg"
            class="mb-6 google-btn"
            height="48"
            @click="loginWithGoogle"
          >
            <img
              src="@/assets/google-icon.svg"
              class="mr-2"
              height="18"
              alt="Google"
            />
            <div class="btn-text fs-14">Log in with Google</div>
          </v-btn>

          <div class="divider mb-6">
            <span class="divider-line"></span>
            <span class="divider-text">Or continue with email</span>
            <span class="divider-line"></span>
          </div> -->

          <v-form ref="form" @submit.prevent="handleLogin">
            <div class="mb-2">
              <label class="input-label">Email or username</label>
              <v-text-field
                v-model="loginInfo.email"
                placeholder="Email or username"
                outlined
                dense
                class="mb-4 auth-input"
                :rules="emailOrUsernameValidation"
                :error-messages="errors.email"
                @input="clearError('email')"
                autocomplete="username"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>

            <div class="mb-2">
              <label class="input-label">Password</label>
              <v-text-field
                v-model="loginInfo.password"
                placeholder="Password"
                :type="visiblePassword ? 'text' : 'password'"
                :append-icon="
                  visiblePassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                @click:append="visiblePassword = !visiblePassword"
                outlined
                dense
                class="mb-1 auth-input"
                :rules="passwordValidation"
                :error-messages="errors.password"
                @input="clearError('password')"
                autocomplete="current-password"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>

            <div class="d-flex justify-start mb-6">
              <router-link
                to="/forgot-password"
                class="text-decoration-none forgot-password-link"
              >
                Forgot your password?
              </router-link>
            </div>

            <v-btn
              block
              color="primary"
              height="48"
              type="submit"
              :loading="signinBtnLoading"
              class="mb-6 auth-btn login-btn"
            >
              <span class="login-btn-text">Log in</span>
            </v-btn>

            <div class="text-center">
              <span class="no-account-text">Don't have an account?</span>
              <router-link
                to="/register"
                class="text-decoration-none signup-link ml-2"
              >
                Sign up
              </router-link>
            </div>
          </v-form>
        </div>
      </div>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import theme from "@/mixins/theme";
import HeaderView from "@/components/HeaderView.vue";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

import {
  emailOrUsernameValidationRules,
  passwordValidationRules,
} from "@/utils/validation"; // Centralized validation rules

export default {
  name: "LoginPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      visiblePassword: false,
      loginInfo: {
        email: "",
        password: "",
      },
      signinBtnLoading: false,
      errors: {
        email: null,
        password: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    ...mapGetters("user", ["isAuthenticated"]),
    isElectron() {
      return window && window.process && window.process.type === "renderer";
    },
    emailOrUsernameValidation() {
      return emailOrUsernameValidationRules(this); // Use centralized validation
    },
    passwordValidation() {
      return passwordValidationRules(this); // Use centralized validation
    },
  },
  methods: {
    ...mapGetters("user", ["getOrgs", "getCurrentAccount"]),
    ...mapActions("user", ["loginUser"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async handleLogin() {
      if (this.$refs.form.validate()) {
        this.signinBtnLoading = true;

        try {
          const response = await this.$store.dispatch(
            "user/loginUser",
            this.loginInfo
          );

          // Check for saved account preference
          // TODO: handle org response - this is in place for when orgs are implemented in settings
          const savedAccount = this.getCurrentAccount();
          let finalAccount = response.defaultAccount;

          if (savedAccount && response.orgs != undefined) {
            const matchingOrg = response.orgs.find(
              (org) => org.uid === savedAccount.uid
            );
            if (matchingOrg) {
              finalAccount = matchingOrg;
            }
          }

          showSuccessToast(this.$swal, this.$t("loginSuccess"));

          // Get the intended destination or default to home
          this.$router.push({
            name: "Home",
            params: { handle: finalAccount.handle },
          });
        } catch (error) {
          showErrorToast(
            this.$swal,
            error.response?.data?.error ?? this.$t("problemProcessingRequest")
          );
        } finally {
          this.signinBtnLoading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.content-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
}

.content {
  overflow: auto;
  min-width: 408px;
  border-radius: 8px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
}

.google-btn {
  border: none !important;
  border-radius: 8px;
  box-shadow: none !important;
  background-color: #f2f4f7 !important;
}

.btn-text {
  font-weight: 500;
  color: #1a1a1a;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.input-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}

.auth-input {
  margin: 0;
}

.auth-input ::v-deep .v-input__slot {
  background-color: #f9fafb !important;
  border-radius: 8px;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
  min-height: 44px !important;
}

.auth-input ::v-deep .v-input__slot:before,
.auth-input ::v-deep .v-input__slot:after {
  border: none !important;
}

.auth-input ::v-deep .v-text-field__details {
  display: none;
}

.auth-input ::v-deep input {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
  padding: 10px 12px !important;
}

.auth-input ::v-deep input::placeholder {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
  color: #6b7280;
}

.auth-input ::v-deep .v-input__append-inner {
  margin-top: 10px !important;
  padding: 0 12px;
}

.auth-input ::v-deep .v-icon {
  font-size: 18px !important;
  color: #6b7280 !important;
}

.auth-btn {
  background-color: #0052ff !important;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 16px;
}

.text-subtitle-1 {
  color: #6b7280;
  font-size: 14px;
}

.primary--text {
  color: #0052ff !important;
}

.fs-24 {
  font-size: 24px;
}

.fs-14 {
  font-size: 14px;
}

.theme--dark .v-tab {
  border-color: #4b5563;
}

.workspace .theme--light.v-tabs .v-tabs-bar .v-tab--active,
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab:not(.v-tab--disabled) {
  font-weight: bold;
  border: 1px solid #0a26c3;
}

.workspace .theme--light.v-tabs .v-tabs-bar .v-tab--disabled,
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab:not(.v-tab--active) {
  color: rgba(0, 0, 0, 0.54);
  border: 1px solid #d1d5db;
}

.text-body-2 {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0;
  color: #374151;
}

.login-header {
  font-family: Inter, sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  letter-spacing: 0;
  color: #1a1a1a;
}

.forgot-password-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0;
  color: #0052ff;
}

.login-btn {
  border-radius: 8px;
  text-transform: none;
}

.login-btn-text {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0;
  text-align: center;
  color: #ffffff;
}

.no-account-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0;
  color: #6b7280;
}

.signup-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0;
  color: #0052ff;
}
</style>
