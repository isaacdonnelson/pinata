import axios from "axios";
// import dayjs from "dayjs";
import StorageInterface from "../storageInterface";
import store from "@/store";
import router from "@/router";
import { v4 as uuidv4 } from "uuid";
// import TestfiestaIntegrationHelpers from "@/integrations/TestfiestaIntegrationHelpers";

export default class RestApiService extends StorageInterface {
  constructor() {
    super();
    this.api = axios.create({
      baseURL: process.env.VUE_APP_API_URL || "http://localhost:5050/core",
      withCredentials: true,
    });

    // Add request interceptor for trace ID
    this.api.interceptors.request.use(
      (config) => {
        const traceId = uuidv4();
        config.headers["X-Trace-ID"] = traceId;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401 && router.currentRoute.name !== "Login") {
          // Clear user data from store
          store.commit("user/setUser", null);
          store.commit("user/setOrgs", null);

          // Clear user data from localStorage but preserve currentAccount
          localStorage.setItem("user", JSON.stringify(null));
          localStorage.setItem("orgs", JSON.stringify(null));

          // Redirect to login
          router.push({ name: "Login" });
        }
        if (status === 423) {
          router.push({ name: "Maintenance" });
        }
        return Promise.reject(error);
      }
    );
  }

  async getState(executionId) {
    const handle = "idonn01";
    const url = `/${handle}/projects/project1/executions/${executionId}`;

    try {
      const { data } = await this.api.get(url);
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }

  async updateState(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const executionId = state.session.sessionID;
    const url = `/${handle}/projects/${projectKey}/executions/${executionId}`;

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

    try {
      const response = await this.api.patch(url, data);
      returnResponse = response.data;
    } catch (error) {
      console.error("Error updating state:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }

    return returnResponse;
  }

  async createTestCase(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const url = `/${handle}/projects/${projectKey}/cases`;

    const testCasePayload = {
      name: state.case.title,
      source: "pinata",
      projectKey: state.case.key || null,
      parentId: state.case.parentId || 0,
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

    try {
      const response = await this.api.post(url, testCasePayload);
      if (response.status !== 200) {
        console.error("Failed to create test case:", response.data);
        return null;
      }

      console.log("Test case created successfully:", response.data);
      store.commit("setCaseIDFromBackend", response.data.uid);

      return response.data;
    } catch (error) {
      console.error(
        "Error creating test case:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createExecutionWithCase(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const url = `/${handle}/projects/${projectKey}/executions`;

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

    try {
      const response = await this.api.post(url, executionPayload);
      returnResponse = response.data;

      if (returnResponse?.uid) {
        store.commit("setSessionIDFromBackend", returnResponse.uid);
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
              try {
                await this.api.put(step.uploadURL, file, {
                  headers: {
                    "Content-Type": match.fileType,
                    "X-Upload-Content-Length": match.fileSize,
                  },
                });
              } catch (uploadError) {
                console.error("File upload error:", uploadError);
                returnResponse.error = returnResponse.error || [];
                returnResponse.error.push(uploadError.response?.data?.errors);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error creating execution:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }

    return returnResponse;
  }

  async createNewSession(state) {
    try {
      // Step 1: Create the test case
      const testCaseResponse = await this.createTestCase(state);
      if (!testCaseResponse?.uid) {
        throw new Error("Failed to get test case UID");
      }

      // Step 2: Create the execution linked to the test case
      const executionResponse = await this.createExecutionWithCase(state);

      return executionResponse;
    } catch (error) {
      console.error("Error in createNewSession:", error);
      return {
        link: "",
        error: error.response?.data?.errors || error.message,
      };
    }
  }

  async saveSession(data) {
    console.log(data);
  }
  async resetData(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const executionId = state.session.sessionID;
    const caseId = state.case.caseID;

    const executionUrl = `/${handle}/projects/${projectKey}/executions/${executionId}`;
    const caseUrl = `/${handle}/projects/${projectKey}/cases/${caseId}`;

    if (executionId && caseId) {
      try {
        await this.api.delete(executionUrl);
        await this.api.delete(caseUrl);
      } catch (error) {
        console.error(
          "Error deleting execution:",
          error.response?.data?.errors || error.message
        );
        throw error;
      }
    }
  }
  // TODO: Implement this method to fetch metadata from the backend
  async getMetaData() {}

  async createConfig() {
    const handle = "idonn01";
    const url = `/${handle}/pinata/configs`;

    const payload = {
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
    };

    try {
      const response = await this.api.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Failed to create Piñata Config:", error);
      throw error;
    }
  }
  async getConfig(config) {
    const handle = "idonn01";
    const configId = config.uid;
    if (!handle) {
      throw new Error(
        "Organization handle is not defined. Ensure the user is logged in."
      );
    }
    const url = `/${handle}/pinata/configs/${configId}`;
    try {
      const { data } = await this.api.get(url);
      if (!data) {
        throw new Error("No data returned from the API.");
      }
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }

  async updateConfig(config) {
    const handle = "idonn01";
    const configId = config.uid;
    const url = `/${handle}/pinata/configs/${configId}`;

    try {
      const { data } = await this.api.patch(url, config);
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      } else {
        console.error(
          "Error updating config:",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  // TODO: Needed? Never called.
  async getAttachment(type, attachmentId) {
    const handle = "idonn01";
    const url = `/${handle}/${type}/attachments/${attachmentId}/object`;

    try {
      const { data } = await this.api.get(url);
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }

  async getItemById(id) {
    const itemInStore = store.state.session.items.find(
      (item) => item.stepID === id
    );
    return itemInStore;
  }

  async deleteItems(items) {
    console.log(items);
  }

  // TODO: Implement this method to fetch credentials from the backend?
  async updateCredentials(credentials) {
    console.log(credentials);
    // saving credentials endpoint here
  }
  // Todo: Implement this method to fetch credentials from the backend
  // async getCredentials() {
  // const handle = "idonn01"; // TODO: Ensure this is set in Vuex
  // let data = { user: {} };
  // const allCookies = document.cookie;
  // const cookieArray = allCookies.split("; ");
  // let accessToken = null;
  // for (const cookie of cookieArray) {
  //   const [name, value] = cookie.split("=");
  //   if (name.trim() === "access_token") {
  //     accessToken = value;
  //     break;
  //   }
  // }
  // data = store.state.auth.credentials?.testfiesta[0] || {};
  // if (accessToken) {
  //   data.type = "cookie";
  // } else {
  //   const url = `${this.baseURL}/${handle}/accessTokens`;
  //   const response = await axios.get(url, { withCredentials: true });
  //   data = response.data;
  //   data.type = "bearer";
  // }
  // return {
  //   testfiesta: [
  //     {
  //       accessToken: data.accessToken,
  //       expiresAt: data.expiresAt,
  //       type: data.type || "bearer",
  //       loggedInAt: data.loggedInAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
  //       oauthTokenIds: data.oauthTokenIds,
  //       user: {
  //         id: data.user?.uid,
  //         email: data.user?.email,
  //         name: data.user?.first_name + " " + data.user?.last_name,
  //         avatar: data.user?.avatar_url,
  //         locale: data.user?.preferences?.locale,
  //         verified: data.user?.preferences?.verified,
  //       },
  //       orgs: data.orgs,
  //     },
  //   ],
  // };
  // }

  async loginUser(credentials) {
    const url = `/signin`;
    try {
      const response = await this.api.post(url, credentials);

      const { user } = response.data;
      const orgResponse = await this.getOrgs(user.uid);
      const { orgs } = orgResponse.orgs;

      const account = {
        handle: user.handle,
        type: "user",
        name: `${user.firstName} ${user.lastName}`,
        roleName: "owner",
        avatarUrl: user.avatarUrl,
      };

      return {
        ...response.data,
        orgs,
        defaultAccount: account,
      };
    } catch (error) {
      console.error("Login error:", error.response?.data?.errors);
      throw error;
    }
  }

  async logout() {
    const url = `/auth/logout`;
    try {
      const response = await this.api.post(url);
      return response.data;
    } catch (error) {
      console.error("Logout error:", error.response?.data?.errors);
      throw error;
    }
  }

  async registerUser(userData) {
    const url = `/signup`;
    const payload = {
      handle: userData.handle,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    };
    try {
      const response = await this.api.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data?.errors);
      throw error;
    }
  }

  // todo: implement this method to verify email
  // async verifyEmail(data) {
  //   const url = `/`;
  //   try {
  //     const response = await this.api.post(url, { email: data });
  //     return response.data;
  //   } catch (error) {
  //     console.error("Email verification error:", error.response?.data?.errors);
  //     throw error;
  //   }
  // }

  // async setPassword(token, password) {
  //   const url = `/auth/set-password`;
  //   try {
  //     const response = await this.api.post(url, { token, password });
  //     return response.data;
  //   } catch (error) {
  //     console.error("Set password error:", error.response?.data?.errors);
  //     throw error;
  //   }
  // }

  async forgotPassword(email) {
    const url = `/forgot-password`;
    try {
      const response = await this.api.post(url, { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error.response?.data?.errors);
      throw error;
    }
  }

  async validateInvite(data) {
    const url = `/orgs/${data.handle}/invite/${data.token}`;
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("Invite validation error:", error.response?.data?.errors);
      throw error;
    }
  }
  async validateGoogleSignUp(token) {
    const url = `/signup/google/validate?signupToken=${token}`;
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error(
        "Google Sign-Up validation error:",
        error.response?.data?.errors
      );
      throw error;
    }
  }
  async getOrgs(userId) {
    const url = `/users/${userId}/orgs`;
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get organizations error:", error.response?.data?.errors);
      throw error;
    }
  }
  async getHandlePreferences(handle) {
    const url = `/${handle}/preferences`;
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching handle preferences:", error.response?.data);
      throw error;
    }
  }
  async updateUserProfile(profileData) {
    const url = `/profile`;
    try {
      const response = await this.api.put(url, profileData);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user profile:",
        error.response?.data?.errors
      );
      throw error;
    }
  }

  async cleanupAttachments(handle, id, relatedTo) {
    const url = `/${handle}/attachments/${id}/${relatedTo}`;
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      console.error(
        "Error cleaning up attachments:",
        error.response?.data?.errors || error.message
      );
      throw error;
    }
  }

  async getSignedAttachmentUrl(handle, payload) {
    const url = `/${handle}/attachments`;
    try {
      const response = await this.api.post(url, payload);
      return response.data;
    } catch (error) {
      console.error(
        "Error getting signed attachment URL:",
        error.response?.data?.errors || error.message
      );
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await this.api.get("/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }
}
