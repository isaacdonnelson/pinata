<template>
  <v-form ref="form" v-model="validForm" lazy-validation>
    <v-row>
      <v-col cols="12" class="text-center">
        <v-badge overlap color="white">
          <template #badge>
            <upload-avatar
              :current-avatar="currentUser.avatar.user ?? currentUser.avatarUrl"
              media-type="profile-picture"
              profile-image="user"
            />
          </template>
          <v-avatar class="mb-4" size="9rem" color="secondary">
            <img
              v-if="currentUser.avatar.user ?? currentUser.avatarUrl"
              :src="currentUser.avatar.user ?? currentUser.avatarUrl"
              alt="avatar"
            />
            <v-icon v-else size="6rem" color="white">mdi-account</v-icon>
          </v-avatar>
        </v-badge>
      </v-col>

      <v-col cols="12" class="pb-0">
        <p class="font-weight-medium body-2 text-left mb-1">
          {{ $t("firstName") }}
        </p>
        <v-text-field
          v-model="user.firstName"
          type="text"
          dense
          filled
          :rules="requiredRules"
        />
      </v-col>

      <v-col cols="12" class="pb-0">
        <p class="font-weight-medium body-2 text-left mb-1">
          {{ $t("lastName") }}
        </p>
        <v-text-field
          v-model="user.lastName"
          type="text"
          dense
          filled
          :rules="requiredRules"
        />
      </v-col>

      <v-col cols="12" class="pb-0">
        <p class="font-weight-medium body-2 text-left mb-1">
          {{ $t("email") }}
        </p>
        <v-text-field
          v-model="user.email"
          type="email"
          dense
          filled
          :rules="emailRules"
        />
      </v-col>

      <v-col cols="12" class="pb-0">
        <p class="font-weight-medium body-2 text-left mb-1">
          {{ $t("account.timeZone") }}
        </p>
        <v-select
          v-model="user.timeZone"
          :items="timeZones"
          dense
          filled
          item-text="label"
          item-value="value"
          :rules="requiredRules"
        />
      </v-col>

      <v-col cols="12">
        <v-btn
          color="blue"
          width="300px"
          elevation="0"
          class="white--text text-capitalize"
          :disabled="!validForm"
          @click="onChangeProfile()"
        >
          {{ $t("updateProfile") }}
        </v-btn>
      </v-col>

      <v-col cols="12" class="pb-4 mt-4 text-left">
        <p class="font-weight-bold text-h6">
          {{ $t("account.deleteAccount") }}
        </p>
        <p class="font-weight-medium body-2">
          {{ $t("account.deleteAccountNotice") }}
        </p>
        <v-btn
          color="error"
          width="300px"
          elevation="0"
          class="white--text text-capitalize"
          @click="onDeleteAccount()"
        >
          {{ $t("account.deleteAccount") }}
        </v-btn>
      </v-col>
    </v-row>

    <DeleteAccountConfirmDialog
      v-model="showDeleteConfirmDialog"
      @delete-account="deleteAccount"
    />
  </v-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import makeUserService from "@/services/api/user";
import { emailValidationRules } from "@/utils/validation";
import { timeZones } from "@/constants/timezones";

import UploadAvatar from "@/components/Profile/UploadAvatar.vue";
import DeleteAccountConfirmDialog from "@/components/Settings/Account/DeleteAccountConfirmDialog.vue";

import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default {
  name: "UpdateProfile",

  components: {
    UploadAvatar,
    DeleteAccountConfirmDialog,
  },

  data() {
    return {
      requiredRules: [(value) => !!value || this.$t("error.requiredField")],
      validForm: false,
      user: {
        firstName: "",
        lastName: "",
        email: "",
        timeZone: "",
      },
      timeZones: timeZones,
      showDeleteConfirmDialog: false,
    };
  },

  computed: {
    ...mapGetters({ currentUser: "user/user" }),

    emailRules() {
      return emailValidationRules(this);
    },
  },

  mounted() {
    this.updateUserData();
  },

  watch: {
    currentUser: {
      handler() {
        this.updateUserData();
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions({
      setUser: "user/setUser",
      setLoading: "setLoading",
    }),
    async onChangeProfile() {
      const isValidForm = this.$refs.form.validate();

      if (!isValidForm) {
        return;
      }

      this.setLoading({
        loading: true,
        loadingText: this.$t("account.updatingProfile"),
      });

      try {
        const response = await this.$store.dispatch("user/updateUserProfile", {
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          preferences: {
            ...this.currentUser.preferences,
            timeZone: this.user.timeZone,
          },
        });

        this.setUser({
          ...this.currentUser,
          ...response.data.user,
        });

        showSuccessToast(this.$swal, this.$t("profileUpdated"));
      } catch (err) {
        showErrorToast(
          this.$swal,
          err.response?.data?.message || "Internal server error"
        );
      } finally {
        this.setLoading({
          loading: false,
        });
      }
    },

    onDeleteAccount() {
      this.showDeleteConfirmDialog = true;
    },

    async deleteAccount(password) {
      this.showDeleteConfirmDialog = false;

      const userService = makeUserService(this.$api);

      this.setLoading({
        loading: true,
        loadingText: this.$t("account.deletingAccount"),
      });

      try {
        await userService.deleteUser(this.currentUser.uid, password);

        showSuccessToast(this.$swal, this.$t("account.accountHasBeenDeleted"));

        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 100);
      } catch (err) {
        showErrorToast(
          this.$swal,
          err.response?.data?.message || "Internal server error"
        );
      } finally {
        this.setLoading({
          loading: false,
        });
      }
    },

    updateUserData() {
      this.user = {
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        timeZone: this.currentUser.preferences?.timeZone || "America/New_York",
      };
    },
  },
};
</script>
