<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card id="upload-avatar-modal">
      <v-card-title>{{ $t("caption.crop_photo") }}</v-card-title>
      <v-card-text>
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <v-form
            role="changeAvatarForm"
            @submit.prevent="handleSubmit(saveCrop)"
          >
            <div>
              <v-img
                v-if="imageUrl && !image.src"
                height="300"
                contain
                :src="imageUrl"
              />
              <cropper
                v-else-if="image.src"
                ref="cropper"
                class="cropper"
                stencil-component="circle-stencil"
                :src="image.src"
              />
              <div v-else style="height: 300px; width: 100%">
                <h4>{{ $t("caption.select_image") }}</h4>
              </div>
            </div>
            <div class="d-flex justify-center mt-4">
              <v-btn class="mr-8" :disabled="loading" @click="closeDialog">
                {{ $t("caption.cancel") }}
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
                  accept="image/jpeg,image/png,image/gif,image/svg+xml"
                  @change="uploadImage($event)"
                />
                {{ $t("caption.choose_image") }}
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
                {{ $t("caption.save") }}
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
import "vue-advanced-cropper/dist/style.css";
import { ValidationObserver } from "vee-validate";

export default {
  name: "ProfilePhotoCropDialog",
  components: {
    Cropper,
    ValidationObserver,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dialog: this.value,
      loading: false,
      imageFile: null,
      image: {
        src: null,
        type: null,
      },
    };
  },
  watch: {
    value(val) {
      this.dialog = val;
      if (val) {
        this.prepareImage();
      }
    },
    dialog(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    prepareImage() {
      if (this.imageUrl) {
        this.image.src = this.imageUrl;
        const type = this.imageUrl.split(";")[0].split(":")[1];
        this.image.type = type;
      }
    },
    uploadImage(event) {
      const file = event.target.files[0];
      if (!file) return;

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        this.$emit("error", "Only JPG, PNG, GIF, or SVG allowed.");
        return;
      }
      if (file.size > 800 * 1024) {
        this.$emit("error", "File size must be less than 800K");
        return;
      }

      this.imageFile = file;
      this.prepareImageForUpload();
    },
    prepareImageForUpload() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image.src = e.target.result;
      };
      reader.readAsDataURL(this.imageFile);
    },
    closeDialog() {
      this.dialog = false;
      this.loading = false;
      this.image = { src: null, type: null };
      if (this.$refs.observer) {
        this.$refs.observer.reset();
      }
    },
    async saveCrop() {
      if (!this.$refs.cropper) return;

      this.loading = true;
      try {
        const result = this.$refs.cropper.getResult();
        const dataUrl = result.canvas.toDataURL(
          this.imageFile?.type || "image/png"
        );

        // Convert data URL to File object
        let response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileUpload = new File(
          [blob],
          this.imageFile?.name || "cropped.png",
          {
            type: this.imageFile?.type || "image/png",
          }
        );

        this.$emit("crop-saved", fileUpload);
        this.closeDialog();
      } catch (error) {
        this.$emit("error", "Failed to crop image");
      } finally {
        this.loading = false;
      }
    },
  },
  beforeDestroy() {
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
