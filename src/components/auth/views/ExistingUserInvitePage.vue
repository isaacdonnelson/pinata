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
            Complete your registration
          </div>

          <div class="invitation-text text-center mb-8">
            <strong>{{ inviterName }}</strong> invited you to
            <strong>{{ orgName }}</strong> organization. Specify your email and
            full name to join organization.
          </div>

          <v-form ref="form" @submit.prevent="handleJoin">
            <div class="mb-4">
              <label class="input-label">Email</label>
              <v-text-field
                v-model="joinInfo.email"
                placeholder="Enter your email"
                outlined
                dense
                class="mb-4 auth-input"
                :rules="emailValidation"
                :error-messages="errors.email"
                @input="clearError('email')"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>

            <div class="mb-4">
              <label class="input-label">Username</label>
              <v-text-field
                v-model="joinInfo.username"
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

            <div class="mb-6">
              <label class="input-label">Full Name</label>
              <v-text-field
                v-model="joinInfo.fullName"
                placeholder="Enter your full name"
                outlined
                dense
                class="auth-input"
                :rules="fullNameValidation"
                :error-messages="errors.fullName"
                @input="clearError('fullName')"
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
              class="mb-6 auth-btn"
            >
              <span class="login-btn-text">Join Organization</span>
            </v-btn>

            <div class="text-center terms-text mb-4">
              By creating an account you agree to the
              <a href="#" class="terms-link">Terms of Service</a> and
              <a href="#" class="terms-link">Privacy Policy</a>
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

export default {
  name: "ExistingUserInvitePage",
  components: {
    HeaderView,
  },
  mixins: [theme],
  data() {
    return {
      inviterName: "John Doe", // This should come from the invite token/API
      orgName: "TestFiesta", // This should come from the invite token/API
      inviteToken: "", // This should come from the URL
      loading: false,
      joinInfo: {
        email: "",
        username: "",
        fullName: "",
      },
      errors: {
        email: null,
        username: null,
        fullName: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    emailValidation() {
      return [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ];
    },
    usernameValidation() {
      return [
        (v) => !!v || "Username is required",
        (v) => v.length >= 5 || "Username must be at least 5 characters",
        (v) =>
          /^[a-zA-Z0-9._-]+$/.test(v) ||
          "Username can only contain letters, numbers, and ._-",
      ];
    },
    fullNameValidation() {
      return [
        (v) => !!v || "Full name is required",
        (v) => v.length >= 2 || "Full name must be at least 2 characters",
      ];
    },
  },
  created() {
    // Get invite token from URL and fetch invitation details
    this.inviteToken = this.$route.params.token;
    this.fetchInvitationDetails();
  },
  methods: {
    ...mapActions("auth", ["joinWithInvitation"]),
    clearError(field) {
      this.errors[field] = null;
    },
    async fetchInvitationDetails() {
      // TODO: Implement API call to fetch invitation details
      // This should set inviterName and orgName
    },
    async handleJoin() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.joinWithInvitation({
            ...this.joinInfo,
            inviteToken: this.inviteToken,
          });

          this.snackbar = {
            show: true,
            message: "Successfully joined organization! Redirecting...",
            color: "success",
          };

          // Redirect to workspace
          setTimeout(() => {
            this.$router.push("/workspace");
          }, 1500);
        } catch (error) {
          console.error("Join failed:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to join organization. Please try again.";
          this.snackbar = {
            show: true,
            message: errorMessage,
            color: "error",
          };
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

.invitation-text {
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #374151;
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

.auth-btn {
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

.terms-text {
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
}

.terms-link {
  color: #0052ff;
  text-decoration: none;
  font-weight: 600;
}
</style>
