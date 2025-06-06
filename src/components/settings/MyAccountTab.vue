<template>
  <v-container class="content-wrapper">
    <h1 class="settings-header">{{ $t("caption.account") }}</h1>
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab class="tab-text">{{ $t("caption.profile") }}</v-tab>
      <v-tab class="tab-text">{{ $t("caption.security") }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <!-- Profile Tab -->
      <v-tab-item>
        <!-- Profile Photo Section -->
        <div class="mb-6">
          <div class="d-flex align-start">
            <div>
              <div
                v-if="!profilePhoto"
                class="photo-upload-card d-flex flex-column align-center justify-center"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <img
                  :src="uploadCloudIcon"
                  alt="Upload Icon"
                  class="upload-icon"
                />
                <div class="upload-label mt-2">
                  <div class="upload-desc mt-1">
                    <span class="upload-link">
                      {{ $t("caption.click_to_upload") }}
                    </span>
                    <span class="file-types">
                      or drag and drop <br />SVG, PNG, JPG or GIF (max.
                      800x400px)
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="profile-photo-wrapper d-flex align-center">
                <v-avatar size="80">
                  <v-img
                    :src="profilePhoto"
                    alt="Profile Photo"
                    class="profile-photo"
                  ></v-img>
                </v-avatar>
                <div class="d-flex flex-column ml-4">
                  <div class="d-flex align-center">
                    <span class="delete-link mr-4" @click="deletePhoto">
                      {{ $t("caption.delete_photo") }}
                    </span>
                    <span class="update-link" @click="triggerFileInput">
                      {{ $t("caption.update_photo") }}
                    </span>
                  </div>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="handleFileUpload"
              />
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <v-row>
          <v-col>
            <div class="mb-2">
              <label class="input-label">{{ $t("caption.first_name") }}</label>
              <v-text-field
                v-model="firstName"
                dense
                class="mb-4 auth-input"
                :placeholder="$t('caption.first_name')"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>
            <div class="mb-2">
              <label class="input-label">{{ $t("caption.last_name") }}</label>
              <v-text-field
                v-model="lastName"
                dense
                class="mb-4 auth-input"
                :placeholder="$t('caption.last_name')"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>
            <div class="mb-2">
              <label class="input-label">{{ $t("caption.email") }}</label>
              <v-text-field
                v-model="email"
                dense
                class="mb-4 auth-input"
                :placeholder="$t('caption.email')"
                background-color="#f9fafb"
                hide-details="auto"
              />
            </div>
            <div class="mb-2">
              <label class="input-label">{{ $t("caption.timezone") }}</label>
              <v-select
                v-model="user.timeZone"
                :items="timeZones"
                dense
                filled
                class="mb-4 auth-input"
                item-text="label"
                item-value="value"
                :rules="requiredRules"
                :item-class="getSelectedClass"
                style="min-height: 44px; height: 44px"
              />
            </div>
            <div class="mb-6">
              <v-btn
                color="primary"
                class="update-profile-btn"
                @click="onChangeProfile()"
              >
                {{ $t("caption.update_profile") }}
              </v-btn>
            </div>
            <!-- Delete Account Section -->
            <div class="mt-8">
              <h2 class="delete-header">
                {{ $t("caption.delete_account") }}
              </h2>
              <p class="delete-warning">
                {{ $t("message.delete_account_warning") }}
              </p>
              <v-btn class="delete-btn" @click="onDeleteAccount">
                {{ $t("caption.delete_account") }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-tab-item>
      <!-- Security Tab -->
      <v-tab-item>
        <v-row>
          <v-col cols="12" class="mb-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <label class="input-label font-weight-bold">
                  {{ $t("caption.password") }}
                </label>
                <div class="text-caption text-grey">
                  {{ $t("caption.last_updated", { time: "1 week" }) }}
                </div>
              </div>
              <v-btn class="change-password-btn" dense @click="changePassword">
                {{ $t("caption.change_password") }}
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" class="mb-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <label class="input-label font-weight-bold">
                  {{ $t("caption.two_factor_auth") }}
                </label>
                <div class="text-caption text-grey">
                  {{ $t("caption.two_factor_desc") }}
                </div>
              </div>
              <v-btn class="enable-2fa-btn" dense @click="enableTwoFactorAuth">
                {{ $t("caption.enable") }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <ProfilePhotoCropDialog
      ref="cropDialog"
      :current-avatar="profilePhoto"
      :profile-image="'user'"
      :media-type="'avatar'"
      @cropped-file="handleCroppedImage"
    />

    <v-snackbar v-model="snackbar" :timeout="4000" color="error">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { timeZones } from "@/constants/timezones";
import ProfilePhotoCropDialog from "./ProfilePhotoCropDialog.vue";
import { profileImageTypes, maxFileSize } from "@/constants/fileTypes";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import uploadCloudIcon from "@/assets/icon/upload-cloud-02.svg";

export default {
  name: "MyAccountTab",
  components: {
    ProfilePhotoCropDialog,
  },
  data() {
    return {
      uploadCloudIcon,
      requiredRules: [(value) => !!value || this.$t("error.requiredField")],
      activeTab: 0,
      user: {
        firstName: "",
        lastName: "",
        email: "",
        timeZone: "",
      },
      timeZones: timeZones,
      showDeleteConfirmDialog: false,
      profilePhoto: null,
      tempImageUrl: null,
      snackbar: false,
      snackbarMessage: "",
    };
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      currentUser: "user/user",
    }),

    emailRules() {
      return [
        (v) => !!v || this.$t("error.emailRequired"),
        (v) => /.+@.+\..+/.test(v) || this.$t("error.validEmail"),
      ];
      //   return emailValidationRules(this); // TODO
    },
  },

  mounted() {
    // Load user data
    if (this.currentUser) {
      this.user.firstName = this.currentUser.firstName || "";
      this.user.lastName = this.currentUser.lastName || "";
      this.user.email = this.currentUser.email || "";
      this.user.timeZone =
        this.currentUser.preferences?.timeZone || "America/New_York";
      this.profilePhoto =
        this.currentUser.avatar?.user || this.currentUser.avatarUrl || null;
    }
  },
  methods: {
    ...mapActions({
      setUser: "user/setUser",
      setLoading: "setLoading",
      uploadProfileImage: "user/uploadProfileImage",
    }),
    async onChangeProfile() {
      try {
        this.setLoading({
          loading: true,
          loadingText: this.$t("account.updatingProfile"),
        });

        const response = await this.$store.dispatch("user/updateProfile", {
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
      //   this.showDeleteConfirmDialog = true
    },
    async deleteAccount(password) {
      this.showDeleteConfirmDialog = false;

      this.setLoading({
        loading: true,
        loadingText: this.$t("account.deletingAccount"),
      });

      try {
        await this.$store.dispatch(
          "user/deleteUser",
          this.currentUser.uid,
          password
        );

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
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!profileImageTypes.includes(file.type)) {
        this.showSnackbar("Only JPG, PNG, GIF, or SVG allowed.");
        return;
      }

      if (file.size > maxFileSize) {
        this.showSnackbar("File size must be less than 800K");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempImageUrl = e.target.result;
        this.$refs.cropDialog.showModalUpload();
      };
      reader.readAsDataURL(file);
    },
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (!file) return;

      if (!profileImageTypes.includes(file.type)) {
        this.showSnackbar("Only JPG, PNG, GIF, or SVG allowed.");
        return;
      }

      if (file.size > maxFileSize) {
        this.showSnackbar("File size must be less than 800K");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempImageUrl = e.target.result;
        this.$refs.cropDialog.showModalUpload();
      };
      reader.readAsDataURL(file);
    },
    async handleCroppedImage(file) {
      try {
        this.setLoading({
          loading: true,
          loadingText: this.$t("account.uploadingProfile"),
        });

        const response = await this.uploadProfileImage(file);

        if (response.success) {
          this.profilePhoto = URL.createObjectURL(file);
          showSuccessToast(this.$swal, this.$t("messages.profile_updated"));
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        showErrorToast(this.$swal, this.$t("messages.upload_failed"));
      } finally {
        this.setLoading({
          loading: false,
        });
      }
    },
    deletePhoto() {
      this.profilePhoto = null;
      // TODO: Add API call to remove profile photo
    },
    showSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbar = true;
    },
    getSelectedClass(item) {
      return item.value === this.user.timeZone ? "selected-item" : "";
    },
    changePassword() {
      //   TODO: Implement change password logic
    },
    enableTwoFactorAuth() {
      //   TODO: Implement enable 2FA logic
    },
  },
};
</script>
<style scoped>
.content-wrapper {
  padding: 25px;
}
.settings-header {
  margin-bottom: 15px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 35px;
  line-height: 38px;
  letter-spacing: 0%;
  vertical-align: middle;
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
.auth-input ::v-deep .v-input__slot {
  background-color: #f9fafb !important;
  border-radius: 8px;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
  height: 44px !important;
  width: 28vw !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
}
.auth-input ::v-deep .v-select__selections {
  padding: 0 !important;
  min-height: 24px !important;
  display: flex !important;
  align-items: center !important;
}
.auth-input ::v-deep .v-select__selection {
  margin: 0 !important;
  font-weight: 600 !important;
}
.auth-input ::v-deep .v-select__selection--comma {
  margin: 0 !important;
  font-weight: 600 !important;
}
.auth-input ::v-deep .v-select__append-inner {
  margin-top: 0 !important;
  align-self: center !important;
}
.update-profile-btn {
  background: #0a26c3 !important;
  color: white !important;
  border-radius: 6px;
  margin-top: 16px;
  box-shadow: none !important;
  min-width: 140px;
  height: 40px;
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
  padding: 0 !important;
}
.auth-input ::v-deep input::placeholder {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
  color: #0a26c3;
}
.profile-photo {
  border-radius: 50%;
  object-fit: cover;
}
.delete-header {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.delete-warning {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}
.delete-btn {
  background: #fff5f7 !important;
  color: #ab1934 !important;
  border-radius: 8px;
  font-weight: 600;
  width: 135px;
  height: 40px;
  font-size: 14px;
  letter-spacing: 0.01em;
  text-transform: none;
  box-shadow: none;
  margin-top: 10px;
}
.change-password-btn {
  background: #f3f4f6 !important;
  color: black !important;
  border: none !important;
  border-radius: 6px;
  box-shadow: none !important;
  min-width: 140px;
}
.enable-2fa-btn {
  background: #f3f4f6 !important;
  color: black !important;
  border: none !important;
  border-radius: 6px;
  box-shadow: none !important;
  min-width: 100px;
}
.photo-upload-card {
  width: 28vw;
  height: 138px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: center;
}
.photo-upload-card:hover {
  border-color: #0a26c3;
}
.upload-label {
  font-weight: 700;
  color: #0a26c3;
  font-size: 15px;
  cursor: pointer;
}
.upload-link {
  color: #0a26c3;
  font-weight: 700;
}
.upload-desc {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
}
.file-types {
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
}
.profile-photo-wrapper {
  min-width: 240px;
  min-height: 80px;
}
.delete-link {
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}
.update-link {
  color: #0a26c3;
  font-size: 14px;
  cursor: pointer;
  font-weight: 700;
}
.tab-text {
  color: #677085 !important;
  font-weight: 700;
  text-transform: none;
  position: relative;
}
.tab-text.v-tab--active {
  color: #0a26c3 !important;
  font-weight: 700 !important;
  text-transform: none;
}
.selected-item {
  font-weight: bold !important;
}
.v-tabs {
  border-bottom: 1px solid #e5e7eb;
}
.v-tabs > .v-tabs-bar {
  background-color: transparent !important;
}
.v-tabs-slider {
  background-color: #0a26c3 !important;
  height: 2px !important;
}
.upload-icon {
  width: 40px;
  height: 40px;
  fill: #354055; /* Change the color */
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 10px;
  /* width: 40px;
  height: 40px; */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
