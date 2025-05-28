<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div class="content-container">
      <div class="content">
        <div class="password-wrapper pa-6">
          <!-- Logo -->
          <div class="d-flex justify-center align-center mb-8">
            <router-link to="/">
              <img src="@/assets/logo.svg" alt="Pinata" height="32" />
            </router-link>
          </div>

          <!-- Header -->
          <div class="text-center password-header mb-6">
            Create your password
          </div>

          <v-form ref="form" @submit.prevent="handleCreatePassword">
            <div class="mb-2">
              <label class="input-label">Password</label>
              <v-text-field
                v-model="password"
                placeholder="Choose a password"
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
                background-color="#f9fafb"
                hide-details="auto"
              />
              <!-- Password requirements -->
              <div class="password-requirements mt-2 mb-4">
                <div :class="['requirement', meetsLength ? 'met' : '']">
                  At least 8 characters
                </div>
                <div
                  :class="['requirement', meetsLettersAndNumbers ? 'met' : '']"
                >
                  Mix of letters and numbers
                </div>
                <div :class="['requirement', meetsSpecialChar ? 'met' : '']">
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
                @click:append="visibleConfirmPassword = !visibleConfirmPassword"
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
              :loading="createBtnLoading"
              class="mb-4 auth-btn"
            >
              <span class="btn-text">Create account</span>
            </v-btn>

            <div class="text-center terms-text mb-6">
              By creating an account, you agree to our
              <a href="#" class="terms-link">Terms of Service</a>
              and
              <a href="#" class="terms-link">Privacy Policy</a>
            </div>

            <div class="text-center">
              <span class="account-text">Already have an account?</span>
              <router-link
                to="/login"
                class="text-decoration-none login-link ml-2"
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
import { mapActions } from "vuex";
import theme from "@/mixins/theme";
import HeaderView from "@/components/HeaderView.vue";
import { passwordValidationRules } from "@/utils/validation";

export default {
  name: "CreatePasswordPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      password: "",
      confirmPassword: "",
      visiblePassword: false,
      visibleConfirmPassword: false,
      createBtnLoading: false,
      errors: {
        password: null,
        confirmPassword: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    meetsLength() {
      return this.password.length >= 8;
    },
    meetsLettersAndNumbers() {
      return /(?=.*[A-Za-z])(?=.*\d)/.test(this.password);
    },
    meetsSpecialChar() {
      return /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    },
    meetsCasing() {
      return /(?=.*[a-z])(?=.*[A-Z])/.test(this.password);
    },
    passwordValidation() {
      return passwordValidationRules();
    },
    confirmPasswordValidation() {
      return [
        (v) => !!v || "Please confirm your password",
        (v) => v === this.password || "Passwords do not match",
      ];
    },
  },
  created() {
    // Check if we have the necessary token
    const token = this.$route.query.token;
    if (!token) {
      this.$router.push("/register");
    }
  },
  methods: {
    ...mapActions("auth", ["setPassword", "login"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async handleCreatePassword() {
      if (this.$refs.form.validate()) {
        this.createBtnLoading = true;
        try {
          const token = this.$route.query.token;
          await this.setPassword({ token, password: this.password });

          this.snackbar = {
            show: true,
            message: "Password set successfully! Logging you in...",
            color: "success",
          };

          // Attempt to log in with the new credentials
          try {
            await this.login({
              email: this.$route.query.email,
              password: this.password,
            });

            // Wait for snackbar to show before redirecting
            setTimeout(() => {
              const redirectPath =
                this.$store.getters["auth/redirectPath"] || "/workspace";
              this.$router.push(redirectPath);
            }, 1500);
          } catch (loginError) {
            console.error("Auto-login failed:", loginError);
            // If auto-login fails, redirect to login page
            setTimeout(() => {
              this.$router.push("/login");
            }, 1500);
          }
        } catch (error) {
          if (error.response?.data?.errors) {
            const { errors } = error.response.data;
            this.errors = {
              password: errors.password,
              confirmPassword: errors.confirmPassword,
            };
          } else {
            this.snackbar = {
              show: true,
              message:
                error.response?.data?.message || "Failed to set password",
              color: "error",
            };
          }
        } finally {
          this.createBtnLoading = false;
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
}

.password-wrapper {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
}

.password-header {
  font-family: Inter, sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  color: #1a1a1a;
}

.input-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
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

.auth-input ::v-deep input {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  padding: 10px 12px !important;
}

.password-requirements {
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 18px;
  color: #6b7280;
}

.requirement {
  margin-bottom: 4px;
}

.requirement.met {
  color: #059669;
}

.auth-btn {
  border-radius: 8px;
  text-transform: none;
}

.btn-text {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #ffffff;
}

.terms-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
}

.terms-link {
  color: #0052ff;
  text-decoration: none;
}

.account-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #6b7280;
}

.login-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #0052ff;
}

/* Dark theme overrides */
.theme--dark .password-wrapper {
  background: #374151;
}

.theme--dark .password-header {
  color: #ffffff;
}

.theme--dark .input-label {
  color: #e5e7eb;
}

.theme--dark .password-requirements {
  color: #9ca3af;
}

.theme--dark .requirement.met {
  color: #34d399;
}

.theme--dark .terms-text {
  color: #9ca3af;
}

.theme--dark .account-text {
  color: #9ca3af;
}
</style>
