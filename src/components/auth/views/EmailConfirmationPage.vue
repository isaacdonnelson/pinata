<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div class="content-container">
      <div class="content">
        <div class="confirmation-wrapper pa-6">
          <!-- Logo -->
          <div class="d-flex justify-center align-center mb-8">
            <router-link to="/">
              <img src="@/assets/logo.svg" alt="Pinata" height="32" />
            </router-link>
          </div>

          <!-- Header -->
          <div class="text-center confirmation-header mb-4">
            Confirm your email
          </div>

          <!-- Confirmation Message -->
          <div class="text-center confirmation-text mb-8">
            We've sent a confirmation email to <strong>{{ email }}</strong
            >. Please check and click the link inside to complete the process.
          </div>

          <!-- Alert Box -->
          <v-card class="alert-box mb-6" flat>
            <div class="d-flex pa-4">
              <v-icon color="grey darken-1" class="mr-3"
                >mdi-alert-circle-outline</v-icon
              >
              <div class="alert-content">
                <div class="font-weight-bold mb-2">
                  Didn't receive an email?
                </div>
                <div class="mb-4">
                  If you can't find the email in your inbox or spam folder,
                  please click below and we will send you a new one.
                </div>
                <v-btn
                  block
                  :color="resendButtonColor"
                  height="40"
                  class="text-none resend-btn"
                  :loading="resendLoading"
                  @click="handleResendEmail"
                >
                  Resend email
                </v-btn>
              </div>
            </div>
          </v-card>

          <!-- Wrong Email Link -->
          <div class="text-center">
            <router-link
              to="/register"
              class="text-decoration-none wrong-email-link"
            >
              Wrong email?
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
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
import HeaderView from "@/components/HeaderView.vue";
import theme from "@/mixins/theme";
import { mapActions } from "vuex";

export default {
  name: "EmailConfirmationPage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      email: "",
      resendLoading: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    resendButtonColor() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#EFF6FF";
    },
  },
  created() {
    // Get email from route params or query
    this.email = this.$route.params.email || this.$route.query.email || "";

    // Handle verification token if present
    const token = this.$route.query.token;
    if (token) {
      this.handleVerification(token);
    } else if (!this.email) {
      this.$router.push("/register");
    }
  },
  methods: {
    ...mapActions("auth", ["verifyEmail", "resendVerification"]),
    async handleVerification(token) {
      try {
        await this.verifyEmail(token);

        this.snackbar = {
          show: true,
          message: "Email verified successfully! Please set up your password.",
          color: "success",
        };

        // Redirect to password creation after 1.5 seconds
        setTimeout(() => {
          this.$router.push({
            name: "CreatePassword",
            query: { token },
          });
        }, 1500);
      } catch (error) {
        this.snackbar = {
          show: true,
          message: error.response?.data?.message || "Email verification failed",
          color: "error",
        };
      }
    },
    async handleResendEmail() {
      if (this.resendLoading) return;

      this.resendLoading = true;
      try {
        await this.resendVerification(this.email);

        this.snackbar = {
          show: true,
          message:
            "Verification email has been resent. Please check your inbox.",
          color: "success",
        };
      } catch (error) {
        this.snackbar = {
          show: true,
          message:
            error.response?.data?.message ||
            "Failed to resend verification email",
          color: "error",
        };
      } finally {
        this.resendLoading = false;
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

.confirmation-wrapper {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
}

.confirmation-header {
  font-family: Inter, sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  color: #1a1a1a;
}

.confirmation-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
}

.alert-box {
  background-color: #f9fafb !important;
  border-radius: 8px;
}

.alert-content {
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
}

.resend-btn {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #0052ff !important;
  text-transform: none;
  box-shadow: none !important;
}

.wrong-email-link {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #0052ff;
}

/* Dark theme overrides */
.theme--dark .confirmation-wrapper {
  background: #374151;
}

.theme--dark .confirmation-header {
  color: #ffffff;
}

.theme--dark .confirmation-text {
  color: #e5e7eb;
}

.theme--dark .alert-box {
  background-color: #4b5563 !important;
}

.theme--dark .alert-content {
  color: #e5e7eb;
}
</style>
