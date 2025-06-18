<template>
  <div class="d-flex align-center app-height-global">
    <div class="not-found">
      <div class="position-relative img-placeholder">
        <Loader class="pt-0 position-absolute" />
        <img
          src="@/assets/png/setup-logo.png"
          alt="Setup Illustration"
          class="error-image"
        />
      </div>
      <div class="mt-4">
        <h1>{{ $t("setup.databaseCreation") }}</h1>
        <p class="mb-0">
          {{ $t("setup.redirectNotice") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import Loader from "@/components/auth/components/Loader";
import { startPolling, stopPolling } from "@/utils/util";

export default {
  name: "SetupPage",
  components: {
    Loader,
  },
  data() {
    return {
      pollInterval: null,
      config: {
        localOnly: false,
        theme: "light",
        ai: {
          enabled: false,
        },
        showIssue: false,
        appLabel: false,
        defaultColor: "#1976D2FF",
        commentType: "Comment",
        audioCapture: false,
        videoQuality: "high",
        debugMode: false,
        summary: false,
        templates: {
          image: {
            content: "",
            text: "",
          },
          video: {
            content: "",
            text: "",
          },
          audio: {
            content: "",
            text: "",
          },
          text: {
            content: "",
            text: "",
          },
          file: {
            content: "",
            text: "",
          },
          mindmap: {
            content: "",
            text: "",
          },
        },
        defaultTags: [],
        checklist: {
          presession: {
            status: false,
            tasks: [],
          },
          postsession: {
            status: false,
            tasks: [],
          },
        },
        hotkeys: {
          general: {
            cancel: ["ctrl", "c"],
            save: ["ctrl", "s"],
          },
          home: {
            quickTest: ["ctrl", "q"],
            newExploratorySession: ["ctrl", "e"],
            openExploratorySession: ["ctrl", "o"],
          },
          sessionPlanning: {
            title: ["ctrl", "t"],
            charter: ["ctrl", "h"],
            timeLimit: ["ctrl", "l"],
            preconditions: ["ctrl", "p"],
            checklist: ["ctrl", "e"],
            start: "general.save",
          },
          workspace: {
            pause: ["ctrl", "p"],
            resume: "workspace.pause",
            stop: ["ctrl", "h"],
            videoStart: ["ctrl", "v"],
            videoStop: "workspace.videoStart",
            screenshot: ["ctrl", "r"],
            audioStart: ["ctrl", "a"],
            audioStop: "workspace.audioStart",
            note: ["ctrl", "n"],
            mindmap: ["ctrl", "m"],
            changeSource: ["ctrl", "o"],
            createIssue: ["ctrl", "i"],
            back: ["ctrl", "b"],
            copy: ["alt", "c"],
            paste: ["alt", "v"],
            edit: ["alt", "e"],
            delete: ["del"],
          },
          evidence: {
            name: ["ctrl", "n"],
            followUp: ["ctrl", "f"],
            comment: ["ctrl", "d"],
            tags: ["ctrl", "t"],
            type: ["ctrl", "y"],
            save: "general.save",
            cancel: "general.cancel",
          },
        },
        logo: {
          enabled: false,
          path: "",
          name: "",
          size: 0,
        },
      },
    };
  },
  computed: {
    ...mapState({
      currentAccount: (state) => state.user.currentAccount,
    }),
    ...mapGetters({
      signupOrgDetails: "user/getSignupOrgDetails",
    }),
  },
  mounted() {
    this.startPolling();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  methods: {
    ...mapMutations({
      setOrgs: "user/setOrgs",
      setCurrentAccount: "user/setCurrentAccount",
      setSignupOrgDetails: "user/setSignupOrgDetails",
    }),
    startPolling() {
      this.pollInterval = startPolling(this.pollProjects, 10000);
    },
    stopPolling() {
      stopPolling(this.pollInterval);
      this.pollInterval = null;
    },
    async pollProjects() {
      if (!this.currentAccount || !this.currentAccount.handle) {
        console.error("Current account or handle is not available");
        return;
      }

      try {
        console.log("Polling projects for setup status...");
        const response = await this.$storageService.getProfile();
        if (response.setupStatus === "completed") {
          stopPolling(this.pollInterval);
          // if in electron set the config w/out an API call
          if (this.$isElectron) {
            this.$store.commit("config/setFullConfig", this.config);
          } else {
            const config = await this.$storageService.createConfig(this.config);
            this.$store.commit("config/setFullConfig", config);
          }

          let dest;
          dest = {
            name: "Home",
            params: { handle: this.currentAccount.handle },
          };
          this.$router.replace(dest);
        }
      } catch (error) {
        console.error("Error polling projects:", error);
      }
    },
  },
};
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 48px;
  max-width: 600px;
  margin: 0 auto;
}

.error-image {
  max-width: 100%;
  height: auto;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  min-width: 504px;
  min-height: 388px;
  display: flex;
  justify-content: center;
  align-items: center;
}
h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

p {
  margin-bottom: 24px;
  text-align: center;
}
</style>
