<template>
  <v-container
    text-xs-center
    mt-5
    pt-5
  >
    <!-- Add Pic Title -->
    <v-layout
      row
      wrap
    >
      <v-flex
        xs12
        sm6
        offset-sm3
      >
        <h1 class="primary-text">Add Picture</h1>
      </v-flex>
    </v-layout>

    <!-- Add Pic Form -->
    <v-layout
      row
      wrap
    >
      <v-flex
        xs12
        sm6
        offset-sm3
      >
        <v-form>
          <!-- title input -->
          <v-layout row>
            <v-flex xs12>
              <v-text-field
                v-model="title"
                :rules="titleRules"
                label="Picture Title"
                type="text"
                required
              >

              </v-text-field>
            </v-flex>
          </v-layout>

          <!-- image loading -->
          <v-layout>
            <v-flex>
              <v-btn
                raised
                class="accent"
                @click="onPickFile"
              >
                Upload Image
              </v-btn>
              <input
                type="file"
                style="display: none"
                ref="fileInput"
                accept="image/*"
                @change="onFilePicked"
              >
            </v-flex>
          </v-layout>

          <!-- image preview -->

          <v-layout>
            <v-flex>
              <img
                :src="imageUrl"
                width="300px"
              >
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12>
              <v-btn
                :loading="loading"
                :disabled="!isFormValid || loading || !imageUploaded"
                color="accent"
                type="submit"
              >
                <span
                  slot="loader"
                  class="custom-loader"
                >
                  <v-icon light>
                    cached
                  </v-icon>
                </span>
                Submit
              </v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>

  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "AddPic",
  data() {
    return {
      imageUploaded: false,
      isFormValid: true,
      imageUrl: "",
      title: "",
      titleRules: [
        title => !!title || "Title is required",
        title => title.length < 20 || "Title must have less then 20 characters"
      ]
    };
  },

  computed: {
    ...mapGetters(["loading", "user", "imageFilename", "image"])
  },

  methods: {
    handleAddPic() {
      if (this.$refs.form.vlaide()) {
        this.$store.dispatch("addpic");
      }
    },

    onPickFile() {
      this.$refs.fileInput.click();
      return (this.imageUploaded = true);
    },
    onFilePicked(event) {
      const files = event.target.files;
      console.log(files);
      let filename = files[0].name;

      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file");
      }
      if (
        files[0].type === "image/jpg" ||
        "image/png" ||
        "image/jpg" ||
        "image/gif"
      ) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);
        fileReader.addEventListener("load", () => {
          console.log(fileReader.result);
          this.imageUrl = fileReader.result;
        });
        this.$store.dispatch("uploadImage", {
          file: files[0],
          username: this.user.username
        });
      } else {
        return alert("Please add an image( Jpeg, Png, Jpg, Gif ) file");
      }
    }
  }
};
</script>