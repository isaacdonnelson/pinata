<template>
  <div class="pa-6" style="height: 100%" :style="{ backgroundColor: mainBg }">
    <div class="top">
      <v-btn
        class="text-capitalize pa-0 back-btn"
        plain
        :color="btnColor"
        solid
        v-shortkey="backHotkey"
        @shortkey="handleResetConfirmDialog"
        @click="handleResetConfirmDialog"
      >
        <div class="d-flex justify-center align-center">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          <span class="font-weight-semibold">{{ $tc("caption.back", 1) }}</span>
        </div>
      </v-btn>
    </div>
    <div class="text-left" style="height: 100%">
      <div style="height: 100%; overflow-y: auto" class="py-5">
        <div class="fs-30 dark-text font-weight-semibold mt-4 mb-6">
          Scripted Test
        </div>

        <!-- TCM Tool Selection -->
        <div class="mt-4">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            TCM Tool
          </div>
          <v-select
            v-model="selectedTcmTool"
            :items="tcmTools"
            class="rounded-lg custom-select"
            label="Select TCM Tool"
            item-text="name"
            item-value="key"
            style="width: 50%"
            :background-color="inputBg"
            :color="currentTheme.secondary"
            append-icon="mdi-chevron-down"
            :menu-props="{ offsetY: true }"
            solo
            flat
            height="40px"
            hide-details="true"
            @change="handleTcmToolChange"
          >
            <template v-slot:selection="{ attr, on, item }">
              <div class="d-flex align-center" v-bind="attr" v-on="on">
                <v-avatar size="20" class="mr-2">
                  <img :src="item.icon" alt="tool icon" />
                </v-avatar>
                {{ item.name }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="20" class="mr-2">
                  <img :src="item.icon" alt="tool icon" />
                </v-avatar>
                {{ item.name }}
              </div>
            </template>
          </v-select>
        </div>

        <!-- Project Selection -->
        <div class="mt-4">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.project", 1) }}
          </div>
          <v-select
            v-model="selectedProject"
            :items="projects"
            class="project-select rounded-lg custom-select"
            :label="$tc('caption.select_project', 1)"
            item-text="name"
            item-value="key"
            style="width: 50%"
            :background-color="inputBg"
            :color="currentTheme.secondary"
            append-icon="mdi-chevron-down"
            :menu-props="{ offsetY: true }"
            solo
            flat
            height="40px"
            hide-details="true"
            :loading="projectLoading"
            @change="handleProjectChange"
          >
            <template v-slot:selection="{ attr, on, item }">
              <div class="project-item" v-bind="attr" v-on="on">
                {{ item.name }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div class="project-item">
                {{ item.name }}
              </div>
            </template>
          </v-select>
        </div>

        <!-- Test Run Selection -->
        <div class="mt-4">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            Test Run
          </div>
          <v-select
            v-model="selectedTestRun"
            :items="testRuns"
            class="rounded-lg custom-select"
            label="Select Test Run"
            item-text="name"
            item-value="id"
            style="width: 50%"
            :background-color="inputBg"
            :color="currentTheme.secondary"
            append-icon="mdi-chevron-down"
            :menu-props="{ offsetY: true }"
            solo
            flat
            height="40px"
            hide-details="true"
            :disabled="!selectedProject"
            @change="handleTestRunChange"
          >
            <template v-slot:selection="{ attr, on, item }">
              <div class="test-run-item" v-bind="attr" v-on="on">
                {{ item.name }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div class="test-run-item">
                {{ item.name }}
              </div>
            </template>
          </v-select>
        </div>

        <!-- Test Cases Table -->
        <div class="mt-6">
          <v-card class="test-cases-card" outlined>
            <!-- Table Header with Search and Filter -->
            <div
              class="d-flex justify-space-between align-center pa-4 table-header-bar"
            >
              <div class="d-flex align-center" style="flex: 1">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Search"
                  hide-details
                  class="text-field field-theme mt-0 pa-0 rounded-lg custom-prepend custom-search search-bar"
                  style="max-width: 320px; height: 44px"
                  solo
                  flat
                  background-color="#F9F9FB"
                  clearable
                >
                  <template v-slot:prepend-inner>
                    <img
                      src="@/assets/icon/search.svg"
                      alt="search"
                      class="search-icon"
                    />
                  </template>
                </v-text-field>
                <v-btn
                  class="text-capitalize dark-text filter-btn ml-2"
                  :color="currentTheme.secondary"
                  @click="showFilterDialog = true"
                >
                  Filter
                </v-btn>
              </div>
              <div class="d-flex align-center">
                <img src="/pinata-logo.svg" alt="Pinata Logo" height="24" />
              </div>
            </div>

            <!-- Table -->
            <v-data-table
              v-model="selectedTestCases"
              :headers="tableHeaders"
              :items="filteredTestCases"
              :loading="testCasesLoading"
              show-select
              item-key="id"
              class="test-cases-table"
              :no-data-text="noDataText"
              :no-results-text="noResultsText"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <div class="icon-bg mb-4 mx-auto">
                    <img
                      :src="checkCircleBroken"
                      alt="check-circle-broken"
                      class="icon-check-circle-broken"
                    />
                  </div>
                  <div class="text-h6 dark-text mb-2">Select test run</div>
                  <div class="text-body-2 grey--text">
                    Select test run to see list of test cases
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </div>

        <!-- Session Name -->
        <div class="mt-6">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            Session Name
          </div>
          <v-text-field
            v-model="sessionName"
            placeholder="Enter session name"
            class="rounded-lg"
            :background-color="inputBg"
            dense
            height="40px"
            flat
            solo
            :color="currentTheme.secondary"
            style="width: 50%"
          ></v-text-field>
        </div>

        <!-- Privacy Settings -->
        <div class="mt-6">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            Privacy
          </div>
          <v-radio-group v-model="privacy" class="mt-2">
            <v-radio value="public" class="mb-4">
              <template v-slot:label>
                <div>
                  <div class="font-weight-medium">General</div>
                  <div class="text-caption grey--text">
                    Available to whole workspace
                  </div>
                </div>
              </template>
            </v-radio>
            <v-radio value="private">
              <template v-slot:label>
                <div>
                  <div class="font-weight-medium">Invite Only</div>
                  <div class="text-caption grey--text">
                    Available to invited people
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <!-- Invitation Link -->
        <div v-if="privacy === 'private'" class="mt-4">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            Invitation Link
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :value="invitationLink"
              readonly
              outlined
              dense
              hide-details
              class="mr-2"
            ></v-text-field>
            <v-btn
              outlined
              @click="copyInvitationLink"
              :color="currentTheme.secondary"
            >
              Copy
            </v-btn>
          </div>
        </div>

        <!-- Time Limit (Optional) -->
        <div class="mt-6">
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            Time Limit (Optional)
          </div>
          <v-text-field
            v-model="timeLimit"
            placeholder="Enter time limit in minutes"
            class="rounded-lg"
            :background-color="inputBg"
            dense
            height="40px"
            flat
            solo
            :color="currentTheme.secondary"
            style="width: 50%"
            type="number"
          ></v-text-field>
        </div>

        <!-- Start Session Button -->
        <div class="d-flex justify-end mt-6">
          <v-btn
            id="btn_start_scripted_session"
            class="text-capitalize rounded-lg font-weight-regular white--text"
            color="#0C2FF3"
            depressed
            height="40px"
            :style="{ color: currentTheme.white }"
            :disabled="!canStartSession"
            @click="startScriptedSession"
          >
            Start Session
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Filter Dialog -->
    <v-dialog v-model="showFilterDialog" max-width="400">
      <v-card>
        <v-card-title>Filter Test Cases</v-card-title>
        <v-card-text>
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Status"
            outlined
            dense
          ></v-select>
          <v-select
            v-model="priorityFilter"
            :items="priorityOptions"
            label="Priority"
            outlined
            dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showFilterDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="applyFilters">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ResetConfirmDialog
      v-model="resetConfirmDialog"
      ref="resetConfirmDialog"
      :text="$t('message.confirm_back')"
      @confirm="back"
      @cancel="resetConfirmDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";
import theme from "../mixins/theme";
import checkCircleBroken from "@/assets/icon/check-circle-broken.svg";

export default {
  name: "ScriptedSessionWrapper",
  components: {
    ResetConfirmDialog,
  },
  mixins: [theme],
  data() {
    return {
      resetConfirmDialog: false,
      selectedTcmTool: "testfiesta",
      selectedProject: null,
      selectedTestRun: null,
      sessionName: "",
      privacy: "public",
      timeLimit: "",
      searchQuery: "",
      selectedTestCases: [],
      testCasesLoading: false,
      showFilterDialog: false,
      statusFilter: null,
      priorityFilter: null,
      checkCircleBroken,
      projects: [],
      projectLoading: false,

      // Mock data - replace with actual API calls
      tcmTools: [
        {
          key: "testfiesta",
          name: "TestFiesta",
          icon: require("../assets/icon/testfiesta-logo.svg"),
        },
      ],
      testRuns: [],
      testCases: [],
      statusOptions: ["Pass", "Fail", "Blocked", "Skipped"],
      priorityOptions: ["High", "Medium", "Low"],
    };
  },
  computed: {
    ...mapGetters({
      isAiAssistEnabled: "config/isAiAssistEnabled",
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
      currentProject: "user/currentProject",
    }),

    backHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.back", this.hotkeys);
    },

    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },

    tableHeaders() {
      return [
        { text: "ID", value: "id", sortable: true },
        { text: "Name", value: "name", sortable: true },
        { text: "Assigned To", value: "assignedTo", sortable: true },
        { text: "Priority", value: "priority", sortable: true },
        { text: "Status", value: "status", sortable: true },
      ];
    },

    filteredTestCases() {
      let filtered = this.testCases;

      // Apply search filter
      if (this.searchQuery) {
        filtered = filtered.filter(
          (testCase) =>
            testCase.name
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            testCase.id.toString().includes(this.searchQuery)
        );
      }

      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(
          (testCase) => testCase.status === this.statusFilter
        );
      }

      // Apply priority filter
      if (this.priorityFilter) {
        filtered = filtered.filter(
          (testCase) => testCase.priority === this.priorityFilter
        );
      }

      return filtered;
    },

    invitationLink() {
      return "https://pinata.com/alskhgkjhasogifhoipaj";
    },

    canStartSession() {
      return (
        this.selectedTestRun &&
        this.sessionName &&
        this.selectedTestCases.length > 0
      );
    },

    noDataText() {
      return "Select test run to see list of test cases";
    },

    noResultsText() {
      return "No test cases found matching your search criteria";
    },
  },
  watch: {
    selectedTcmTool() {
      this.loadProjects();
    },
    selectedProject() {
      this.loadTestRuns();
    },
    selectedTestRun() {
      this.loadTestCases();
    },
  },
  async mounted() {
    await this.loadProjects();
  },
  methods: {
    async handleTcmToolChange() {
      this.selectedProject = null;
      this.selectedTestRun = null;
      this.testCases = [];
      this.selectedTestCases = [];
    },

    async handleProjectChange(projectKey) {
      try {
        const selectedProject = this.projects.find((p) => p.key === projectKey);
        if (selectedProject) {
          this.$store.commit("user/setCurrentProject", selectedProject);
          this.selectedProject = selectedProject.key;
        }
        this.selectedTestRun = null;
        this.testCases = [];
        this.selectedTestCases = [];
      } catch (error) {
        console.error("Error updating project:", error);
        this.$root.$emit(
          "set-snackbar",
          this.$tc("message.error_updating_project", 1)
        );
      }
    },

    async handleTestRunChange() {
      this.testCases = [];
      this.selectedTestCases = [];
    },

    async loadProjects() {
      try {
        this.projectLoading = true;
        const response = await this.$storageService.getProject();
        this.projects = response.items || [];
        this.selectedProject = this.currentProject?.key || null;
      } catch (error) {
        console.error("Error loading projects:", error);
        this.$root.$emit(
          "set-snackbar",
          this.$tc("message.error_loading_projects", 1)
        );
      } finally {
        this.projectLoading = false;
      }
    },

    async loadTestRuns() {
      if (!this.selectedProject) return;
      // TODO: Fetch test runs from backend based on selectedProject
      this.testRuns = [];
    },

    async loadTestCases() {
      if (!this.selectedTestRun) return;
      this.testCasesLoading = true;
      try {
        const response = await this.$storageService.getTestCasesByRun(
          this.selectedProject,
          this.selectedTestRun
        );
        this.testCases = response.items || [];
      } catch (error) {
        console.error("Error loading test cases:", error);
        this.$root.$emit(
          "set-snackbar",
          this.$tc("message.error_loading_test_cases", 1)
        );
        this.testCases = [];
      } finally {
        this.testCasesLoading = false;
      }
    },

    applyFilters() {
      this.showFilterDialog = false;
    },

    copyInvitationLink() {
      navigator.clipboard.writeText(this.invitationLink).then(() => {
        this.$root.$emit("set-snackbar", "Invitation link copied to clipboard");
      });
    },

    startScriptedSession() {
      // Emit event to start scripted session
      this.$root.$emit("start-new-scripted-session", {
        tcmTool: this.selectedTcmTool,
        project: this.selectedProject,
        testRun: this.selectedTestRun,
        sessionName: this.sessionName,
        privacy: this.privacy,
        timeLimit: this.timeLimit,
        selectedTestCases: this.selectedTestCases,
      });
    },

    async back() {
      this.$store.commit("clearState");
      const currentPath = this.$router.history.current.path;
      if (currentPath !== "/home") {
        await this.$router.push("/home");
      }
    },

    handleResetConfirmDialog() {
      this.resetConfirmDialog = true;
      setTimeout(() => {
        this.$refs.resetConfirmDialog?.$refs.confirmBtn.$el.focus();
      }, 100);
    },
  },
};
</script>

<style>
.v-icon.mdi.theme--light.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 0.6) !important;
}
.v-icon.mdi.theme--dark.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 1) !important;
}
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
}
</style>

<style scoped>
.dark-text {
  color: #344054;
}
.timer-box-wrapper {
  display: flex;
  column-gap: 10px;
  align-items: center;
  max-width: 10em;
}
.timer-box-wrapper-label {
  color: #666;
}
.charter-tab {
  border-top-left-radius: 4px !important;
  border-top-right-radius: 4px !important;
}
.charter-tab .v-tab {
  color: #667085 !important;
}
.charter-tab .v-tab.v-tab--active {
  color: #0a26c3 !important;
  border-bottom: solid 2px #eaecf0;
}
.charter-tab.theme--dark .v-tab.v-tab--active {
  color: #fff !important;
  border-bottom: solid 2px #eaecf0;
}
.charter-tab {
  border-bottom: solid 1px #eaecf0;
}

.test-cases-card {
  border-radius: 8px;
}

.test-cases-table {
  max-height: 400px;
  overflow-y: auto;
  margin: 10px;
}

.test-cases-table >>> thead th {
  background: #f9f9fb !important;
  border-bottom: 1px solid #eaecf0 !important;
  font-family: "Inter", sans-serif !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  line-height: 18px !important;
  letter-spacing: 0 !important;
  color: #475467 !important;
}

.project-item,
.test-run-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.filter-btn {
  background: #f3f4f7 !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0;
  text-align: center;
  border-radius: 8px;
  min-width: 76px !important;
  width: 76px !important;
  height: 44px !important;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.search-bar {
  width: 320px !important;
  height: 44px !important;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0;
  border-radius: 8px;
  gap: 15px;
  box-shadow: none !important;
}

.search-bar >>> .v-input__slot {
  border-bottom: none !important;
  box-shadow: none !important;
  background: #f9f9fb !important;
  min-height: 44px !important;
  border-radius: 8px !important;
}

.search-bar >>> input {
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0;
  padding: 10px 12px !important;
  height: 24px !important;
}

.search-icon {
  display: flex;
  align-items: center;
  height: 24px;
  width: 24px;
  margin-top: 0;
}

.icon-bg {
  width: 56px;
  height: 56px;
  background: #f9f9fb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-check-circle-broken {
  width: 23.33px;
  height: 23.33px;
}
</style>
