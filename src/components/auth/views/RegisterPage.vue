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
            {{ $t("auth.register.title") }}
          </div>
          <!-- TODO: implement google Oauth -->
          <v-form
            id="form"
            ref="formRef"
            role="registerForm"
            @submit.prevent="handleSignup"
          >
            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("auth.register.firstName") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                id="firstname"
                name="First name"
                v-model="user.firstName"
                :rules="firstNameValidation"
                class="mb-4 auth-input"
                background-color="#f9fafb"
                :placeholder="
                  $t('inputPlaceholder', { field: $t('first name') })
                "
                height="45"
                :disabled="signupBtnLoading"
              />
            </div>

            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("auth.register.lastName") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                v-model="user.lastName"
                class="mb-4 auth-input"
                :rules="lastNameValidation"
                background-color="#f9fafb"
                id="lastname"
                name="Last name"
                :placeholder="$t('inputPlaceholder', { field: $t('surname') })"
                height="45"
                :disabled="signupBtnLoading"
              />
            </div>

            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("auth.register.email") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                v-model="user.email"
                class="mb-4 auth-input"
                id="email"
                name="email"
                background-color="#F9F9FB"
                :disabled="signupBtnLoading"
                :rules="emailValidation"
                :placeholder="$t('inputPlaceholder', { field: $t('email') })"
                height="45"
              />
            </div>

            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("auth.register.username") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                v-model="user.handle"
                name="username"
                class="mb-4 auth-input"
                :rules="usernameValidation"
                background-color="#f9fafb"
                id="username"
                height="45"
                :disabled="signupBtnLoading"
                :placeholder="$t('inputPlaceholder', { field: $t('username') })"
              />
            </div>

            <div class="mb-2">
              <v-label
                class="text-left fs-14px text-theme-label font-weight-medium"
              >
                {{ $t("auth.register.password") }}
                <strong class="red--text text--lighten-1">*</strong>
              </v-label>
              <v-text-field
                v-model="user.password"
                class="mb-1 auth-input"
                :rules="passwordValidation"
                id="password"
                name="password"
                :placeholder="$t('inputPlaceholder', { field: $t('password') })"
                height="38"
                background-color="#F9F9FB"
                :disabled="signupBtnLoading"
                :append-icon="visiblePassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visiblePassword ? 'text' : 'password'"
                @click:append="visiblePassword = !visiblePassword"
              />
            </div>

            <v-btn
              id="signup"
              block
              color="primary"
              height="48"
              type="submit"
              :loading="signupBtnLoading"
              class="mb-6 auth-btn login-btn"
            >
              <span class="login-btn-text">{{
                $t("auth.register.signUp")
              }}</span>
            </v-btn>

            <div class="text-center">
              <span class="account-text">{{
                $t("auth.register.alreadyHaveAccount")
              }}</span>
              <router-link
                to="/login"
                class="text-decoration-none forgot-password-link ml-2"
              >
                {{ $t("auth.register.login") }}
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
import theme from "@/mixins/theme";
import HeaderView from "@/components/HeaderView.vue";
import {
  emailValidationRules,
  passwordValidationRules,
  firstNameValidation as firstNameValidationRules,
  lastNameValidation as lastNameValidationRules,
  usernameValidation,
} from "@/utils/validation";
import { mapActions } from "vuex";
import { showErrorToast } from "@/utils/toast";

export default {
  name: "RegisterPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      confirmPassword: "",
      visiblePassword: false,
      visibleConfirmPassword: false,
      signupBtnLoading: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      user: {
        handle: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      },
    };
  },
  computed: {
    firstNameValidation() {
      return firstNameValidationRules();
    },
    lastNameValidation() {
      return lastNameValidationRules();
    },
    emailValidation() {
      return emailValidationRules();
    },
    usernameValidation() {
      return usernameValidation();
    },
    passwordValidation() {
      return passwordValidationRules();
    },
  },
  methods: {
    ...mapActions("user", ["registerUser", "initSession"]),
    async handleSignup() {
      const isValid = await this.$refs.formRef.validate();
      if (isValid) {
        this.signupBtnLoading = true;
        const userData = {
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          handle: this.user.handle,
          password: this.user.password,
        };
        try {
          // Register user and get response
          const response = await this.$store.dispatch(
            "user/registerUser",
            userData
          );

          // Initialize session with the registered user data
          await this.$store.dispatch("user/initSession", {
            user: response.user,
            currentAccount: {
              handle: response.user.handle,
              type: "user",
              name: `${response.user.firstName} ${response.user.lastName}`,
              roleName: "owner",
            },
          });

          // Show success message

          // Navigate to home regardless of config creation success
          await this.$router.push({ path: "/setup" });
        } catch (error) {
          let errorMessage;
          if (Array.isArray(error.response?.data?.error)) {
            errorMessage = error.response.data.errors.join(" ");
          } else {
            errorMessage =
              error?.response?.data?.errors ||
              error?.response?.data?.message ||
              error?.message;

            showErrorToast(this.$swal, errorMessage);
          }
        } finally {
          this.signupBtnLoading = false;
        }
      }
    },
    signupWithGoogle() {
      // Implement Google signup logic
    },
    // TODO: add accept logic for invite etc.
    // Check for invite token and organization in the URL parameters
    checkForInvite(params) {
      if (!params?.token || !params.org) return;

      const inviteData = { handle: params.org, token: params.token };

      this.$store
        .dispatch("user/getInvite", inviteData)
        .then((response) => {
          if (response.data) {
            this.invite = response.data;
            this.$router.push({ name: "GetInvite", params: this.invite });
          } else {
            this.$router.push({ name: "RegisterPage" });
          }
        })
        .catch((error) => {
          console.error("Error fetching invite:", error);
          this.$router.push({ name: "RegisterPage" });
        });
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
