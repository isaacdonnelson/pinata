<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div class="content-container">
      <div class="content">
        <div class="login-wrapper pa-6">
          <div class="d-flex justify-center align-center mb-8">
            <img src="@/assets/logo.svg" alt="Pinata" height="32" />
          </div>

          <div class="text-center login-header mb-8">
            {{ $t("auth.login.title") }}
          </div>
          <!-- TODO: implement Google auth -->
          <v-form ref="form" @submit.prevent="handleLogin">
            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("emailOrUsernameLabel") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                v-model="loginInfo.email"
                class="mb-4 auth-input"
                :rules="emailOrUsernameValidation"
                background-color="#f9fafb"
                id="username-field"
                :placeholder="
                  $t('inputPlaceholder', {
                    field: $t('emailOrUsernamePlaceholder'),
                  })
                "
                height="38"
                :disabled="signinBtnLoading"
              />
            </div>
            <div class="mb-2">
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
                class="mb-4 auth-input"
                :type="visiblePassword ? 'text' : 'password'"
                :append-icon="
                  visiblePassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :disabled="signinBtnLoading"
                @click:append="visiblePassword = !visiblePassword"
              />
            </div>

            <div class="d-flex justify-start mb-6">
              <a
                href="#"
                @click.prevent="forgotPassword"
                class="text-decoration-none forgot-password-link"
              >
                {{ $t("forgotPassword") }}
              </a>
            </div>

            <v-btn
              block
              color="primary"
              height="48"
              type="submit"
              :loading="signinBtnLoading"
              class="mb-6 auth-btn login-btn"
            >
              <span class="login-btn-text">{{ $t("auth.login.title") }} </span>
            </v-btn>

            <div class="text-center">
              <span class="no-account-text">{{
                $t("auth.login.noAccount")
              }}</span>
              <router-link
                to="/register"
                class="text-decoration-none signup-link ml-2"
              >
                {{ $t("auth.login.signUp") }}
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
          {{ $t("common.close") }}
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
  requiredFieldValidationRules,
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
      return emailOrUsernameValidationRules(this);
    },
    passwordValidation() {
      return requiredFieldValidationRules(this);
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
          console.log(response);
          if (response.success) {
            // Check for saved account preference
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
          } else {
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          console.log(this.$swal);
          showErrorToast(
            this.$swal,
            error.response?.data?.error ??
              this.$t("auth.messages.problemProcessingRequest")
          );
        } finally {
          this.signinBtnLoading = false;
        }
      }
    },

    async forgotPassword() {
      const testfiestaUrl = "https://app.testfiesta.com/forgotPassword";
      if (this.$isElectron) {
        await this.$electronService.openExternalLink(testfiestaUrl);
      } else {
        window.open(testfiestaUrl, "_blank");
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
  margin-top: 10px;
}

.login-header {
  font-family: Inter, sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  letter-spacing: 0;
  color: #1a1a1a;
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
  border-radius: 8px !important;
  color: #6b7280;
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

.account-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0;
  color: #6b7280;
}

.forgot-password-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0;
  color: #0052ff;
}

.password-requirements {
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: #6b7280;
}

.requirement {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: #ef4444; /* Red color for unmet requirements */
}

.requirement.met {
  color: #22c55e; /* Green color for met requirements */
}

.requirement::before {
  content: "•";
  margin-right: 8px;
  font-size: 16px;
}

.requirement.met::before {
  content: "✓";
  margin-right: 8px;
  font-size: 14px;
}
</style>
