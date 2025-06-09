<template>
  <v-dialog v-model="showModal" max-width="500">
    <v-card id="upload-avatar-modal">
      <v-card-title>{{ $t("changeAvatar") }}</v-card-title>
      <v-card-text>
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <v-form
            role="changeAvatarForm"
            @submit.prevent="handleSubmit(updateAvatar)"
          >
            <div>
              <v-img
                v-if="currentAvatar && !image.src"
                height="300"
                contain
                :src="currentAvatar"
              />
              <cropper
                v-else-if="image.src"
                ref="cropper"
                class="cropper"
                stencil-component="circle-stencil"
                :src="image.src"
              />
            </div>
            <div class="d-flex justify-center mt-4">
              <v-btn
                class="mr-8"
                :disabled="loading"
                @click="hiddenModalUpload"
              >
                {{ $t("cancel") }}
              </v-btn>

              <v-btn
                :disabled="loading || !image.src"
                color="primary"
                type="submit"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="24"
                  color="white"
                />
                {{ $t("save") }}
              </v-btn>
            </div>
          </v-form>
        </ValidationObserver>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { Cropper } from "vue-advanced-cropper";
import { mapActions } from "vuex";
import "vue-advanced-cropper/dist/style.css";
import { createNamespacedHelpers } from "vuex";
const { mapState, mapMutations } = createNamespacedHelpers("user");
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import fileValidator from "@/mixins/fileValidator.js";
import { profileImageTypes } from "@/constants/fileTypes.js";
export default {
  name: "ProfilePhotoCropDialog",
  components: {
    Cropper,
  },
  mixins: [fileValidator],
  props: {
    isOrg: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    mediaType: {
      type: String,
    },
    emitFile: {
      type: Boolean,
    },
    currentAvatar: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      profileImageTypes,
      showModal: false,
      loading: false,
      imageFile: null,
      image: {
        src: null,
        type: null,
      },
    };
  },
  computed: {
    ...mapState({ currentUser: "user" }),
  },
  methods: {
    ...mapMutations(["updateUser"]),
    ...mapActions({
      uploadToServer: "attachment/uploadToServer",
      setUser: "user/setUser",
    }),
    prepareImageForUpload() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image.src = e.target.result;
      };
      reader.readAsDataURL(this.imageFile);
    },
    hiddenModalUpload() {
      this.showModal = false;
      this.loading = false;
      this.image = { src: null, type: null };
      this.imageFile = null;

      if (this.$refs.observer) {
        this.$refs.observer.reset();
      }
    },
    async updateAvatar() {
      if (!this.imageFile) {
        return;
      }

      this.loading = true;
      try {
        const result = this.$refs.cropper.getResult();
        const dataUrl = result.canvas.toDataURL(this.imageFile.type);

        let response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileUpload = new File([blob], this.imageFile.name, {
          type: this.imageFile.type,
        });

        if (this.emitFile) {
          this.$emit("cropped-file", fileUpload);
          this.hiddenModalUpload();
          return;
        }

        const handle = this.$store.getters["user/currentAccount"].handle;
        const mediaType = this.mediaType;

        const params = {
          handle,
          ...(this.$route.params.key
            ? { projectKey: this.$route.params.key }
            : undefined),
        };
        const objectUrl = await this.uploadToServer({
          mediaType,
          file: fileUpload,
          params,
        });

        if (this.profileImage === "org") {
          this.$emit("uploaded", objectUrl);
        } else if (this.profileImage === "user") {
          this.updateUser({
            avatar: {
              ...this.currentUser.avatar,
              user: objectUrl,
            },
          });
        }

        showSuccessToast(this.$swal, this.$t("profileUpdated"));
        this.hiddenModalUpload();
      } catch (error) {
        showErrorToast(
          this.$swal,
          this.$t("error.failedToUploadAvatar"),
          {},
          error?.response?.data
        );
      } finally {
        this.loading = false;
      }
    },
  },
  destroyed() {
    if (this.image.src) {
      URL.revokeObjectURL(this.image.src);
    }
  },
};
</script>

<style lang="scss">
.cropper {
  height: 300px;
  width: 100%;
}
#upload-avatar-modal .v-image__image {
  background-color: #000;
}
</style>
