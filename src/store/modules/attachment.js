import axios from "axios";
// TODO: Continue to adapt this module to pinata - this is already partially adapted from the frontend
export const attachment = {
  namespaced: true,
  mutations: {
    state: () => ({
      uploadedFiles: [],
    }),
    addUploadedFile: (state, uploadedFile) => {
      state.uploadedFiles.push(uploadedFile);
    },
    removeUploadedFile: (state, file) => {
      const { key } = file;
      const fileIndex = state.uploadedFiles.findIndex(
        (element) => element.key == key
      );
      state.uploadedFiles.splice(fileIndex, 1);
    },
    updateFileProgress: (state, { uploadingFile, progress }) => {
      const { key } = uploadingFile;
      const fileIndex = state.uploadedFiles.findIndex(
        (element) => element.key == key
      );
      state.uploadedFiles[fileIndex].progress = progress;
    },
    resetUploadedFiles: (state) => {
      state.uploadedFiles = [];
    },
    setUploadFailed: (state, file) => {
      const { key } = file;
      const fileIndex = state.uploadedFiles.findIndex(
        (element) => element.key == key
      );
      state.uploadedFiles[fileIndex].failed = true;
    },
  },

  getters: {
    uploadedFiles: (state) => state.uploadedFiles,
  },
  actions: {
    removeUploadedFile({ commit }, file) {
      commit("removeUploadedFile", file);
    },
    async deleteUploadedFile(_, { id, params }) {
      await this.vm.$storageService.cleanupAttachments({
        id,
        params,
      });
    },
    async retryUpload({ commit, dispatch }, { handle, attachment }) {
      commit("removeUploadedFile", attachment);

      await dispatch("uploadToServer", {
        handle,
        mediaType: attachment.mediaType,
        file: attachment.file,
        params: attachment.params,
      });
    },
    async uploadToServer(
      { commit, dispatch, getters },
      { mediaType, file, signedUrl, params }
    ) {
      const key = getters["uploadedFiles"].length;
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const attachment = {
        key,
        fileName: file.name,
        size: file.size,
        fileType: file.type,
        mediaType,
        sizeInKB: file.size / 1000,
        progress: 0,
        file,
        source,
        params,
        extension: file.type.substr(file.type.indexOf("/") + 1).toUpperCase(),
        failed: false,
      };
      commit("addUploadedFile", attachment);

      const signedUrlPayload = {
        fileType: attachment.fileType,
        size: attachment.size,
        fileName: attachment.fileName,
        mediaType: attachment.mediaType,
      };

      const { data } =
        signedUrl ??
        (await this._vm.$storageService
          .getSignedAttachmentUrl({
            payload: signedUrlPayload,
            ...(params ? { params } : undefined),
          })
          .catch(() => commit("setUploadFailed", attachment)));

      return await dispatch("uploadFile", {
        attachment,
        signedUrl: data.signedUrl,
        headers: data.clientHeaders,
      })
        .then(() => {
          commit("removeUploadedFile", attachment);
          if (mediaType == "profile-picture") return data.objectUrl;
          return {
            type: data.clientHeaders["Content-Type"],
            uid: data.uid,
          };
        })
        .catch(async (error) => {
          await dispatch("deleteUploadedFile", {
            id: data.uid,
            params,
          });

          if (axios.isCancel(error)) commit("removeUploadedFile", attachment);
          else commit("setUploadFailed", attachment);
        });
    },
    async uploadFile({ commit }, { attachment, signedUrl, headers }) {
      return await axios
        .put(signedUrl, attachment.file, {
          cancelToken: attachment.source.token,
          headers,
          onUploadProgress: (progressEvent) => {
            const progress = parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            commit("updateFileProgress", {
              uploadingFile: attachment,
              progress,
            });
          },
        })
        .then((response) => response)
        .catch((err) => {
          throw err;
        });
    },
  },
};
