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
              <div v-else style="height: 300px; width: 100%">
                <h4>Select image</h4>
              </div>
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
                class="mr-8"
                :disabled="loading"
                color="success"
                @click="$refs.file.click()"
              >
                <input
                  id="upload-avatar-input-file"
                  ref="file"
                  type="file"
                  hidden
                  :accept="`${profileImageTypes.join(', ')}`"
                  @change="uploadImage($event)"
                />
                {{ $t("chooseImage") }}
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
    <!-- <template #activator="{ on }"> -->
    <!-- <v-btn
        id="upload-avatar-change-avatar-btn"
        outlined
        color="secondary"
        icon
        small
        v-on="on"
      > -->
    <!-- <CameraIcon /> -->
    <!-- </v-btn> -->
    <!-- </template> -->
  </v-dialog>
</template>

<script>
import { Cropper } from "vue-advanced-cropper";
import { mapActions } from "vuex";
import "vue-advanced-cropper/dist/style.css";
import { createNamespacedHelpers } from "vuex";
const { mapState, mapMutations } = createNamespacedHelpers("user");
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import fileValidator from "@/mixins/fileValidator.js";
import { profileImageTypes } from "@/constants/fileTypes.js";
// import makeOrgService from "@/services/api/org";
// import makeUserService from "@/services/api/user";
// import makeProjectService from "@/services/api/project";

export default {
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
      imageFile: null, // To store the selected image file
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
    async updateAvatar() {
      if (
        !["project", "org", "user"].includes(this.profileImage) ||
        !this.mediaType ||
        !this.imageFile
      )
        return showErrorToast(
          this.$swal,
          this.$t("error.failedToUploadAvatar")
        );

      this.loading = true;
      try {
        // Get the result from the cropper
        const result = this.$refs.cropper.getResult();
        const dataUrl = result.canvas.toDataURL(this.imageFile.type);

        let response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileUpload = new File([blob], this.imageFile.name, {
          type: this.imageFile.type,
        });

        if (this.emitFile) return this.$emit("croppedFile", fileUpload);

        const handle = this.$store.getters["user/currentAccount"].handle;
        const mediaType = this.mediaType;
        const apiService = {
          // project: () => makeProjectService(this.$api),
          // org: () => makeOrgService(this.$api),
          // user: () => makeUserService(this.$api),
        };

        const params = {
          handle,
          ...(this.$route.params.key
            ? { projectKey: this.$route.params.key }
            : undefined),
        };
        const objectUrl = await this.uploadToServer({
          mediaType,
          file: fileUpload,
          apiService: apiService[this.profileImage](),
          params,
        });
        if (this.profileImage == "org") this.$emit("uploaded", objectUrl);
        else if (this.profileImage == "user")
          this.updateUser({
            avatar: {
              ...this.currentUser.avatar,
              user: objectUrl,
            },
          });

        // Show success notification
        showSuccessToast(this.$swal, this.$t("profileUpdated"));
      } catch (error) {
        // Handle error
        this.showErrorToast(
          this.$swal,
          this.$t("error.failedToUploadAvatar"),
          {},
          error?.response?.data
        );
      } finally {
        this.loading = false;
        this.hiddenModalUpload();
      }
    },
    uploadImage(event) {
      const files = Array.from(event.target.files);

      const validationResult = this.validateMimeTypes(files, profileImageTypes);

      if (!validationResult.valid) {
        showErrorToast(this.$swal, this.$t("error.fileFormatNotSupported"));
      } else {
        this.imageFile = files[0];

        this.prepareImageForUpload();
      }
    },
    prepareImageForUpload() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image.src = e.target.result;
      };
      reader.readAsDataURL(this.imageFile);
    },
    toDataUrl(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    },
    showModalUpload() {
      const self = this;
      this.toDataUrl(this.currentUser.avatar_url, function (myBase64) {
        const type = myBase64.split(";")[0].split(":")[1];
        self.image.type = type;
      });
      this.image.src = this.currentUser.avatar_url;
      this.showModal = true;
    },
    hiddenModalUpload() {
      this.showModal = false;
      this.loading = false;
      this.image = { src: null, type: null };

      if (this.$refs.observer) {
        this.$refs.observer.reset();
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
