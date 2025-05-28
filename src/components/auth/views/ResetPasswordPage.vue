<template>
  <div class="page-container">
    <div class="auth-wrapper pa-6">
      <div class="d-flex justify-center align-center mb-8">
        <router-link to="/">
          <img src="@/assets/logo.svg" alt="Pinata" height="32" />
        </router-link>
      </div>

      <div class="text-center fs-24 font-weight-semibold mb-8">
        Reset password
      </div>

      <v-form ref="form" @submit.prevent="handleResetPassword">
        <v-text-field
          v-model="password"
          label="New password"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="showPassword = !showPassword"
          outlined
          dense
          class="mb-4 auth-input"
          :rules="passwordValidation"
          :error-messages="errors.password"
          background-color="#f9fafb"
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirm new password"
          :type="showConfirmPassword ? 'text' : 'password'"
          :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="showConfirmPassword = !showConfirmPassword"
          outlined
          dense
          class="mb-6 auth-input"
          :rules="confirmPasswordValidation"
          :error-messages="errors.confirmPassword"
          background-color="#f9fafb"
        />

        <v-btn
          block
          color="primary"
          height="48"
          type="submit"
          :loading="loading"
          class="mb-6 auth-btn"
        >
          Reset password
        </v-btn>

        <div class="text-center">
          <router-link
            to="/login"
            class="text-decoration-none primary--text font-weight-medium"
          >
            Back to login
          </router-link>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default {
  name: "ResetPasswordPage",
  data() {
    return {
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      errors: {
        password: null,
        confirmPassword: null,
      },
    };
  },
  computed: {
    passwordValidation() {
      return [
        (v) => !!v || "Password is required",
        (v) => v.length >= 8 || "Password must be at least 8 characters",
      ];
    },
    confirmPasswordValidation() {
      return [
        (v) => !!v || "Please confirm your password",
        (v) => v === this.password || "Passwords do not match",
      ];
    },
  },
  methods: {
    ...mapActions("auth", ["resetPassword"]),
    async handleResetPassword() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          const token = this.$route.query.token;
          await this.resetPassword({ token, password: this.password });
          showSuccessToast(this.$swal, "Password reset successful!");
          this.$router.push("/login");
        } catch (error) {
          showErrorToast(
            this.$swal,
            error.response?.data?.message || "Failed to reset password"
          );
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f8f9fa;
}

.auth-wrapper {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.auth-input ::v-deep .v-input__slot {
  background-color: #f9fafb !important;
}

.auth-btn {
  background-color: #0052ff !important;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 16px;
}

.primary--text {
  color: #0052ff !important;
}

.fs-24 {
  font-size: 24px;
}
</style>
