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

          <div class="text-center login-header mb-8">
            {{ $t("auth.register.title") }}
          </div>

          <!-- TODO: implement google Oauth -->
          <!-- <ContinueWithGoogleButton :loading="signupBtnLoading" /> -->
          <!-- <div class="divider mb-6">
            <span class="divider-line"></span>
            <span class="divider-text">{{
              $t("auth.login.orContinueWithEmail")
            }}</span>
            <span class="divider-line"></span>
          </div> -->
          <template>
            <ValidationObserver
              id="observer"
              ref="observerRef"
              v-slot="{ handleSubmit }"
            >
              <v-form ref="form" @submit.prevent="handleSubmit(handleSignup)">
                <div class="mb-2">
                  <label class="input-label">{{
                    $t("auth.register.firstName")
                  }}</label>
                  <v-text-field
                    v-model="user.firstName"
                    :placeholder="
                      $t('inputPlaceholder', {
                        field: $t('auth.register.firstName'),
                      })
                    "
                    outlined
                    dense
                    class="mb-4 auth-input"
                    :rules="firstNameValidation"
                    :error-messages="errors.firstName"
                    @input="clearError('firstName')"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                </div>

                <div class="mb-2">
                  <label class="input-label">Last name</label>
                  <v-text-field
                    v-model="user.lastName"
                    placeholder="Enter your last name"
                    outlined
                    dense
                    class="mb-4 auth-input"
                    :rules="lastNameValidation"
                    :error-messages="errors.lastName"
                    @input="clearError('lastName')"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                </div>

                <div class="mb-2">
                  <label class="input-label">Email</label>
                  <v-text-field
                    v-model="user.email"
                    placeholder="Enter your email"
                    outlined
                    dense
                    class="mb-4 auth-input"
                    :rules="emailValidation"
                    :error-messages="errors.email"
                    @input="clearError('email')"
                    autocomplete="email"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                </div>

                <div class="mb-2">
                  <label class="input-label">Username</label>
                  <v-text-field
                    v-model="user.handle"
                    placeholder="Choose a username"
                    outlined
                    dense
                    class="mb-4 auth-input"
                    :rules="usernameValidation"
                    :error-messages="errors.handle"
                    @input="clearError('username')"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                </div>

                <div class="mb-2">
                  <label class="input-label">Password</label>
                  <v-text-field
                    v-model="user.password"
                    placeholder="Choose a password"
                    :type="visiblePassword ? 'text' : 'password'"
                    :append-icon="
                      visiblePassword
                        ? 'mdi-eye-off-outline'
                        : 'mdi-eye-outline'
                    "
                    @click:append="visiblePassword = !visiblePassword"
                    outlined
                    dense
                    class="mb-1 auth-input"
                    :rules="passwordValidation"
                    :error-messages="errors.password"
                    @input="clearError('password')"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                  <!-- Password requirements -->
                  <div class="password-requirements mt-2 mb-4">
                    <div :class="['requirement', meetsLength ? 'met' : '']">
                      At least 8 characters
                    </div>
                    <div
                      :class="[
                        'requirement',
                        meetsLettersAndNumbers ? 'met' : '',
                      ]"
                    >
                      Mix of letters and numbers
                    </div>
                    <div
                      :class="['requirement', meetsSpecialChar ? 'met' : '']"
                    >
                      At least 1 special character
                    </div>
                    <div :class="['requirement', meetsCasing ? 'met' : '']">
                      At least 1 lowercase and 1 uppercase letter
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="input-label">Confirm password</label>
                  <v-text-field
                    v-model="confirmPassword"
                    placeholder="Confirm your password"
                    :type="visibleConfirmPassword ? 'text' : 'password'"
                    :append-icon="
                      visibleConfirmPassword
                        ? 'mdi-eye-off-outline'
                        : 'mdi-eye-outline'
                    "
                    @click:append="
                      visibleConfirmPassword = !visibleConfirmPassword
                    "
                    outlined
                    dense
                    class="auth-input"
                    :rules="confirmPasswordValidation"
                    :error-messages="errors.confirmPassword"
                    @input="clearError('confirmPassword')"
                    background-color="#f9fafb"
                    hide-details="auto"
                  />
                </div>

                <v-btn
                  block
                  color="primary"
                  height="48"
                  type="submit"
                  :loading="signupBtnLoading"
                  class="mb-6 auth-btn login-btn"
                >
                  <span class="login-btn-text">Sign Up</span>
                </v-btn>

                <div class="text-center">
                  <span class="account-text">{{
                    $t("auth.register.alreadyHaveAccount")
                  }}</span>
                  <router-link
                    to="/login"
                    class="text-decoration-none forgot-password-link ml-2"
                  >
                    Log in
                  </router-link>
                </div>
              </v-form>
            </ValidationObserver>
          </template>
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
// import ContinueWithGoogleButton from "@/components/auth/components/ContinueWithGoogleButton.vue";
import {
  emailValidationRules,
  passwordValidationRules,
  firstNameValidation,
  lastNameValidation,
  usernameValidation,
} from "@/utils/validation";
import { mapActions } from "vuex";

export default {
  name: "RegisterPage",
  components: {
    HeaderView,

    // ContinueWithGoogleButton,
  },
  mixins: [theme],
  data() {
    return {
      confirmPassword: "",
      visiblePassword: false,
      visibleConfirmPassword: false,
      signupBtnLoading: false,
      errors: {
        firstName: null,
        lastName: null,
        email: null,
        handle: null,
        password: null,
        confirmPassword: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      invite: true,
      inviteObserverRef: null,
      observerRef: null,
      user: {
        handle: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      },
    };
  },
  async mounted() {
    // Check for invite parameters in the URL
    this.checkForInvite(this.$route.params);
    // If there's a signup token in the query, validate it
    const token = this.$route.query.signupToken;
    if (token) {
      try {
        const response = await this.$store.commit["user/validateGoogleSignUp"](
          token
        );
        if (response.status === 200 && response.data) {
          const user = response.data;
          await this.$store.dispatch("user/initSession", {
            user: user,
            currentAccount: {
              handle: user.handle,
              type: "user",
              name: `${user.firstName} ${user.lastName}`,
              roleName: "owner",
            },
          });
        }
      } catch (error) {
        console.error("Error validating Google signup token:", error);
        // showAuthErrorToast(Swal, error.response?.data?.error || error.message);
      }
    }
  },
  computed: {
    firstNameValidation() {
      return firstNameValidation();
    },
    lastNameValidation() {
      return lastNameValidation();
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
    confirmPasswordValidation() {
      return [
        (v) => !!v || "Please confirm your password",
        (v) => v === this.user.password || "Passwords do not match",
      ];
    },
    meetsLength() {
      return this.user.password.length >= 8;
    },
    meetsLettersAndNumbers() {
      return /(?=.*[A-Za-z])(?=.*\d)/.test(this.user.password);
    },
    meetsSpecialChar() {
      return /[!@#$%^&*(),.?":{}|<>]/.test(this.user.password);
    },
    meetsCasing() {
      return /(?=.*[a-z])(?=.*[A-Z])/.test(this.user.password);
    },
  },
  methods: {
    ...mapActions("user", ["registerUser", "initSession"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async handleSignup() {
      // if (this.$refs.form.validate()) {
      this.signupBtnLoading = true;
      const userData = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        handle: this.user.handle,
        password: this.user.password,
      };
      try {
        // Register user
        await this.$store.dispatch("user/registerUser", userData);

        // Create config for the new user
        const config = await this.$storageService.createConfig();
        this.$store.commit("config/setFullConfig", config);

        // Show success message
        this.snackbar = {
          show: true,
          message: "Registration successful!",
          color: "success",
        };

        // Navigate to home
        this.$router.push({
          name: "Home",
          query: userData,
        });
      } catch (error) {
        // Handle validation errors
        if (error.response?.data?.errors) {
          const { errors } = error.response.data;
          this.errors = {
            firstName: errors.firstName,
            lastName: errors.lastName,
            email: errors.email,
            username: errors.handle,
            password: errors.password,
            confirmPassword: errors.confirmPassword,
          };
        } else {
          // Show generic error
          this.snackbar = {
            show: true,
            message: error.response?.data?.message || "Registration failed",
            color: "error",
          };
        }
      } finally {
        this.signupBtnLoading = false;
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

      // makeOrgService($api)
      //   .validateInvite(inviteData)
      //   .then((response) => {
      //     invite.value = {
      //       ...inviteData,
      //       organization: response.data.name,
      //       senderName: `${response.data.sender.firstName} ${response.data.sender.lastName}`,
      //     };
      //     user.value.email = response.data.email;
      //   })
      //   .catch((e) => {
      //     console.error(e);
      //     showAuthErrorToast(Swal, t("invalidInvite"));
      //   });
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
