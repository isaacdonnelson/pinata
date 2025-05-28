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

          <div class="text-center login-header mb-8">Sign up</div>

          <v-btn
            v-if="!this.$isElectron"
            block
            :color="btnBg"
            class="mb-6 google-btn"
            height="48"
            @click="signupWithGoogle"
          >
            <img
              src="@/assets/google-icon.svg"
              class="mr-2"
              height="18"
              alt="Google"
            />
            <div class="btn-text fs-14">Sign up with Google</div>
          </v-btn>

          <div class="divider mb-6">
            <span class="divider-line"></span>
            <span class="divider-text">Or continue with email</span>
            <span class="divider-line"></span>
          </div>

          <v-form ref="form" @submit.prevent="handleSignup">
            <div class="mb-2">
              <label class="input-label">Full name</label>
              <v-text-field
                v-model="signupInfo.fullName"
                placeholder="Enter your full name"
                outlined
                dense
                class="mb-4 auth-input"
                :rules="fullNameValidation"
                :error-messages="errors.fullName"
                @input="clearError('fullName')"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>

            <div class="mb-2">
              <label class="input-label">Email</label>
              <v-text-field
                v-model="signupInfo.email"
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
                v-model="signupInfo.username"
                placeholder="Choose a username"
                outlined
                dense
                class="mb-4 auth-input"
                :rules="usernameValidation"
                :error-messages="errors.username"
                @input="clearError('username')"
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
              <span class="login-btn-text">Continue</span>
            </v-btn>

            <div class="text-center">
              <span class="account-text">Already have an account?</span>
              <router-link
                to="/login"
                class="text-decoration-none forgot-password-link ml-2"
              >
                Log in
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
import theme from "@/mixins/theme";
import HeaderView from "@/components/HeaderView.vue";
import {
  emailValidationRules,
  usernameValidationRules,
} from "@/utils/validation";
import { mapActions } from "vuex";

export default {
  name: "RegisterPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      signupInfo: {
        fullName: "",
        email: "",
        username: "",
      },
      signupBtnLoading: false,
      errors: {
        fullName: null,
        email: null,
        username: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    fullNameValidation() {
      return [
        (v) => !!v || "Full name is required",
        (v) =>
          (v && v.length >= 2) || "Full name must be at least 2 characters",
      ];
    },
    emailValidation() {
      return emailValidationRules();
    },
    usernameValidation() {
      return usernameValidationRules();
    },
  },
  methods: {
    ...mapActions("auth", ["setUser", "setIsAuthenticated"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async handleSignup() {
      if (this.$refs.form.validate()) {
        this.signupBtnLoading = true;
        try {
          // Make direct service call
          const response = await this.$storageService.register({
            fullName: this.signupInfo.fullName,
            email: this.signupInfo.email,
            username: this.signupInfo.username,
          });

          // Update store state
          await this.$store.commit("auth/setUser", response.user);
          await this.$store.commit("auth/setIsAuthenticated", true);
          // await this.$store.commit("auth/register", response);

          // Show success message
          this.snackbar = {
            show: true,
            message:
              "Registration successful! Please check your email to verify your account.",
            color: "success",
          };

          // Redirect to email confirmation
          this.$router.push({
            name: "EmailConfirmation",
            query: { email: this.signupInfo.email },
          });
        } catch (error) {
          // Handle validation errors
          if (error.response?.data?.errors) {
            const { errors } = error.response.data;
            this.errors = {
              fullName: errors.fullName,
              email: errors.email,
              username: errors.username,
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
      }
    },
    signupWithGoogle() {
      // Implement Google signup logic
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
</style>
