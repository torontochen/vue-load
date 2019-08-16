<template>
  <v-container
    fluid
    grid-list-md
  >
    <!-- Pic Card -->
    <v-layout
      row
      wrap
      v-if="pics"
    >
      <v-flex
        xs12
        sm6
        v-for="pic in pics"
        :key="pic._id"
      >
        <v-card
          hover
          class="pa-0"
        >
          <!-- card image -->
          <v-img
            :src="pic.imageBase64"
            height="50vh"
            lazy
          ></v-img>
          <v-card-actions>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{pic.title}}</div>
              </div>
            </v-card-title>
            <v-spacer></v-spacer>
            <!-- file download button -->
            <v-btn
              color="accent"
              floating
              fab
              small
              dark
              v-if="user && user.username !== pic.createdBy.username"
              @click="downloadImage(pic.imageFileName)"
            >
              <v-icon>file_download</v-icon>
            </v-btn>
            <!-- pic delete button -->
            <v-btn
              color="error"
              floating
              fab
              small
              dark
              v-if="user && user.username == pic.createdBy.username"
              @click="handleDeletePic(pic._id,pic.imageId)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
          </v-card-actions>
          <!-- Pic  Creator Tile -->
          <v-card-text class="grey lighten-4">
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <img
                  :src="pic.createdBy.avatar"
                  alt="avatar"
                >
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title class="text--primary">
                  {{pic.createdBy.username}}
                </v-list-tile-title>
                <v-list-tile-sub-title class="font-weight-this">
                  Added {{formatCreatedDate(pic.createdDate)}}
                </v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-btn
                  icon
                  ripple
                >
                  <v-icon color="grey lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-card-text>

        </v-card>
      </v-flex>
    </v-layout>

    <!-- Download Image Dialog -->
    <v-layout
      row
      align-center
    >
      <v-dialog
        v-model="downloadDialog"
        max-width="290"
      >
        <v-card class="pb-2">
          <v-card-title>
            <h5>File Is Ready to download, Click Link Below</h5>
          </v-card-title>
          <p class="text-xs-center text-md-center mb-4"><a
              v-if="downloadImagepath"
              target="_blank"
              v-bind:href="'download/'+downloadImagePath"
              @click.stop="downloadDialog=false"
              download
            >{{downloadImagePath}}</a></p>

        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: "home",
  data() {
    return {
      downloadDialog: false
    };
  },
  created() {
    this.handleGetALLPics();
  },
  computed: {
    ...mapGetters(["user", "pics", "downloadImagePath", "loading"])
  },
  methods: {
    handleGetALLPics() {
      this.$store.dispatch("getPics");
    },
    handleDeletePics() {},
    formatCreatedDate(date) {
      return moment(new Date(date)).format("ll");
    },
    downloadImage(imageFilename) {
      this.$store.dispatch();
    }
  }
};
</script>
