import StorageInterface from "@/services/storageInterface";
import store from "@/store";

export default class StateService extends StorageInterface {
  constructor(api, store) {
    super();
    this.store = store;
    this.api = api;
  }

  get handle() {
    return store.state.user.currentAccount?.handle;
  }

  get projectKey() {
    return store.state.user.currentAccount?.projectKey;
  }

  async createNewSession(state) {
    // Step 1: Create the test case
    const testCaseResponse = await this.createTestCase(state);
    if (!testCaseResponse?.uid) {
      throw new Error("Failed to get test case UID");
    }

    // Step 2: Create the execution linked to the test case
    const executionResponse = await this.createExecutionWithCase(state);

    return executionResponse;
  }

  async getState(executionId) {
    const url = `/${this.handle}/projects/${this.projectKey}/executions/${executionId}`;
    const { data } = await this.api.get(url);
    return data;
  }

  async updateState(state) {
    const executionId = state.session.sessionID;
    const url = `/${this.handle}/projects/${this.projectKey}/executions/${executionId}`;
    console.log("Updating state for execution ID:", executionId);
    const data = {
      name: state.case.title,
      steps: state.session.items.map((item) => ({
        stepID: item.stepID,
        attachmentID: item.attachmentID,
        fileName: item.fileName,
        fileType: item.fileType,
        timer_mark: item.timer_mark,
        comment: item.comment,
        tags: item.tags || [],
        followUp: item.followUp || false,
        createdAt: item.createdAt,
        filePath: item.filePath,
        fileSize: item.fileSize,
      })),
      templateFields: {
        charter: state.case.charter?.content || "",
        preconditions: state.case.preconditions?.content || "",
        mindmap: {
          nodes: state.case.mindmap?.nodes || [],
          connections: state.case.mindmap?.connections || [],
        },
        notes: state.session.notes?.content || "",
      },
      customFields: {
        timer: state.session.timer,
        started: state.session.started,
        ended: state.session.ended,
        savedTimer: state.savedTimer,
        isTargetForAll: state.session.isTargetForAll,
        remote: state.session.remote,
      },
    };

    let returnResponse = { link: "" };

    const response = await this.api.patch(url, data);
    returnResponse = response.data;

    return returnResponse;
  }

  async createTestCase(state) {
    const url = `/${this.handle}/projects/${this.projectKey}/cases`;

    const testCasePayload = {
      name: state.case.title,
      source: "pinata",
      // parentId: state.case.parentId || 0, //TODO -  In the future, we need a flow in the UI for choosing a folder.
      templateId: state.case.templateId || null,
      priority: state.case.priority,
      steps: [],
      customFields: {
        templateFields: {
          charter: state.case.charter?.content || "",
          preconditions: state.case.preconditions?.content || "",
          mindmap: {
            nodes: state.case.mindmap?.nodes || [],
            connections: state.case.mindmap?.connections || [],
          },
          notes: state.session.notes?.content || "",
        },
      },
      tags: state.case.tags || [],
    };

    const response = await this.api.post(url, testCasePayload);

    if (response.status !== 200) {
      return null;
    }

    this.store.commit("setCaseIDFromBackend", response.data.uid);
    return response.data;
  }

  async createExecutionWithCase(state) {
    const url = `/${this.handle}/projects/${this.projectKey}/executions`;

    const executionPayload = {
      name: state.case.title,
      version: 1,
      testCaseRef: state.case.caseID,
      projectUid: state.project?.uid,
      steps: [],
      templateFields: {
        charter: state.case.charter?.content || "",
        preconditions: state.case.preconditions?.content || "",
        mindmap: {
          nodes: state.case.mindmap?.nodes || [],
          connections: state.case.mindmap?.connections || [],
        },
        notes: state.session.notes?.content || "",
      },
      customFields: {
        timer: state.session.timer,
        started: state.session.started,
        ended: state.session.ended,
        savedTimer: state.savedTimer,
        isTargetForAll: state.session.isTargetForAll,
        remote: state.session.remote,
      },
    };

    let returnResponse = { link: "" };

    const response = await this.api.post(url, executionPayload);
    returnResponse = response.data;
    if (returnResponse?.uid) {
      this.store.commit("setSessionIDFromBackend", returnResponse.uid);
    } else {
      console.warn("No uid returned from backend for new session");
    }

    if (returnResponse?.steps) {
      for (const step of returnResponse.steps) {
        if (step.uploadURL) {
          const match = state.session.items.find(
            (item) => item.stepID === step.external_id
          );
          if (match?.filePath) {
            const fetchResponse = await fetch(match.filePath);
            const fileBlob = await fetchResponse.blob();
            const file = new File([fileBlob], step?.uid, {
              type: match.fileType,
            });
            await this.api.put(step.uploadURL, file, {
              headers: {
                "Content-Type": match.fileType,
                "X-Upload-Content-Length": match.fileSize,
              },
            });
          }
        }
      }
    }

    return returnResponse;
  }

  async saveSession(data) {
    console.log(data);
  }
  async resetData(state) {
    const executionId = state.session.sessionID;
    const caseId = state.case.caseID;

    const executionUrl = `/${this.handle}/projects/${this.projectKey}/executions/${executionId}`;
    const caseUrl = `/${this.handle}/projects/${this.projectKey}/cases/${caseId}`;

    if (executionId && caseId) {
      await this.api.delete(executionUrl);
      await this.api.delete(caseUrl);
    }
  }

  async getTestCasesByRun(projectKey, runId) {
    const url = `/${this.handle}/projects/${projectKey}/runs/${runId}/cases`;
    const response = await this.api.get(url);
    return response.data;
  }

  async getRunsByProject(projectKey, handle) {
    const orgHandle = handle || this.handle;
    const url = `/${orgHandle}/projects/${projectKey}/runs`;
    const response = await this.api.get(url);
    return response.data;
  }
}
