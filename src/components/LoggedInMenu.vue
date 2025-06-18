<template>
  <div class="d-flex justify-space-between align-center">
    <div class="flex flex-row justify-center mr-5">
      <v-btn
        id="btn__setting"
        class="mx-1"
        fab
        icon
        small
        depressed
        color="default"
        to="/settings"
      >
        <img
          :src="require('../../public/icon/gear.svg')"
          width="20"
          height="20"
        />
      </v-btn>
      <!-- <v-btn id="btn__bell" class="mx-1" fab outlined small color="default">
        <img :src="require('../assets/icon/bell.svg')" width="24" height="24" />
      </v-btn> -->
    </div>
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      :nudge-width="100"
      bottom
      z-index="99999"
      offset-y
      min-width="280px"
      class="rounded-lg"
      content-class="shadow-theme"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          class="flex flex-row justify-center align-center cursor-pointer"
          v-bind="attrs"
          v-on="on"
        >
          <img
            style="border-radius: 100%; border: solid 1px #eaecf0"
            :src="profileAvatar"
            width="40"
            height="40"
            alt="avatar"
          />
        </div>
      </template>

      <v-card class="user-menu">
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <img
                :src="profileAvatar"
                alt="avatar"
                style="border-radius: 100%"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">
                {{ userName }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider v-if="!this.$isElectron && !disabledRoutes"></v-divider>

        <v-list v-if="!this.$isElectron && !disabledRoutes">
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="fs-16 font-weight-medium">
              {{ $tc("caption.logout", 1) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import theme from "../mixins/theme";

export default {
  name: "LoggedInMenu",
  mixins: [theme],
  data() {
    return {
      showMenu: false,
    };
  },
  props: {
    disabledRoutes: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters({
      credentials: "user/credentials",
      isAuthenticated: "user/isAuthenticated",
      currentUser: "user/user",
      currentAccount: "user/currentAccount",
    }),
    userName() {
      if (this.currentUser?.firstName && this.currentUser?.lastName) {
        return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      }
      return this.currentAccount?.name || "User";
    },
    userEmail() {
      return this.currentUser?.email || this.currentAccount?.email || "";
    },
    profileAvatar() {
      if (this.currentUser?.avatarUrl) {
        return this.currentUser.avatarUrl;
      }
      // Generate a default avatar based on user's name
      const name = this.userName;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`;
    },
  },
  methods: {
    async logout() {
      this.showMenu = false;
      try {
        await this.$store.dispatch("user/logout");
        this.$store.commit("user/setUser", null);
        this.$store.commit("user/setOrgs", null);
        localStorage.removeItem("user");
        localStorage.removeItem("orgs");
        this.$router.push("/login").catch(() => {});
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
};
</script>

<style scoped>
.user-menu {
  border-radius: 8px;
  box-shadow: 0px 16px 40px rgba(0, 0, 0, 0.06);
}

.cursor-pointer {
  cursor: pointer;
}

.v-list-item {
  min-height: 48px;
}

.v-list-item__icon {
  margin-right: 16px;
}

.v-list-item__title {
  font-size: 14px;
  line-height: 20px;
}

.v-list-item__subtitle {
  font-size: 12px;
  line-height: 16px;
  color: #6b7280;
}
</style>
