<template>
  <v-btn
    block
    outlined
    class="mb-6 google-btn"
    height="48"
    :loading="loading"
    @click="handleGoogleLogin"
  >
    <img src="@/assets/google-icon.svg" class="mr-2" height="18" alt="Google" />
    <div class="btn-text fs-14">{{ $t("auth.login.continueWithGoogle") }}</div>
  </v-btn>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "ContinueWithGoogleButton",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    ...mapActions("auth", ["loginWithGoogle"]),
    async handleGoogleLogin() {
      try {
        await this.loginWithGoogle();
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
  },
};
</script>

<style scoped>
.google-btn {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff !important;
}

.btn-text {
  font-weight: 500;
  color: #1a1a1a;
}
</style>
