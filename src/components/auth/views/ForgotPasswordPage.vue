<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div class="content-container">
      <div class="content">
        <div class="login-wrapper pa-6">
          <div class="header-container">
            <router-link to="/login" class="d-flex align-center back-link">
              <v-icon color="#0C2FF3">mdi-chevron-left</v-icon>
              <span class="back-text">Back</span>
            </router-link>
            <router-link to="/" class="logo-link">
              <img src="@/assets/logo.svg" alt="Pinata" height="32" />
            </router-link>
            <div class="header-spacer"></div>
          </div>

          <div v-if="!showConfirmation" class="text-center login-header mb-8">
            Password Recovery
          </div>

          <v-form
            v-if="!showConfirmation"
            ref="form"
            @submit.prevent="handleForgotPassword"
          >
            <div class="mb-2">
              <label class="input-label">Email</label>
              <v-text-field
                v-model="email"
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

            <v-btn
              block
              color="primary"
              height="48"
              type="submit"
              :loading="loading"
              class="mb-6 auth-btn login-btn"
            >
              <span class="login-btn-text">Send email</span>
            </v-btn>

            <div class="text-center">
              <span class="account-text">Don't have an account?</span>
              <router-link
                to="/register"
                class="text-decoration-none forgot-password-link ml-2"
              >
                Sign up
              </router-link>
            </div>
          </v-form>

          <div v-else class="confirmation-message">
            <div class="text-center login-header mb-8">Confirm Your Email</div>
            <div class="text-center mb-6">
              <p class="confirmation-text">
                Done! We've sent a confirmation email to
                <strong>{{ email }}</strong
                >. Please check and click the link inside to complete the
                process. Thanks!
              </p>
              <a
                href="#"
                @click.prevent="handleForgotPassword"
                class="resend-link"
                >Resend it</a
              >
            </div>
          </div>
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

export default {
  name: "ForgotPasswordPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      email: "",
      loading: false,
      errors: {
        email: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      showConfirmation: false,
    };
  },
  computed: {
    emailValidation() {
      return [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ];
    },
  },
  methods: {
    ...mapActions("user", ["forgotPassword"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async handleForgotPassword() {
      if (!this.showConfirmation && this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.$storageService.forgotPassword(this.email);
          this.snackbar = {
            show: true,
            message: `Done! We've sent a confirmation email to ${this.email}. Please check and click the link inside to complete the process. Thanks!`,
            color: "success",
          };
          this.showConfirmation = true;
        } catch (error) {
          console.error("Password reset failed:", error);
          if (error.response?.data?.errors) {
            this.errors = error.response.data.errors;
          } else {
            this.snackbar = {
              show: true,
              message:
                error.response?.data?.message ||
                "Failed to send reset email. Please try again.",
              color: "error",
            };
          }
        } finally {
          this.loading = false;
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

.login-header {
  font-family: Inter, sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  letter-spacing: 0;
  color: #1a1a1a;
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

.confirmation-text {
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #374151;
  margin-bottom: 16px;
}

.resend-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0052ff;
  text-decoration: none;
}

.resend-link:hover {
  text-decoration: underline;
}

.back-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  z-index: 1;
}

.back-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #0c2ff3;
  margin-left: 4px;
}

.logo-link {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}

.header-spacer {
  visibility: hidden;
  pointer-events: none;
}
</style>
