<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
</script>

<template>
  <Authenticator :hide-sign-up="true">
    <template v-slot="{ signOut }">
      <router-view :sign-out="signOut" />
    </template>
  </Authenticator>
</template>

<style>
/* AWS Amplify UI customization */
:root {
  --amplify-colors-brand-primary-10: #e3f2fd;
  --amplify-colors-brand-primary-80: #1976d2;
  --amplify-colors-brand-primary-90: #1565c0;
  --amplify-colors-brand-primary-100: #0d47a1;
}

[data-amplify-authenticator] {
  --amplify-components-authenticator-router-box-shadow: 0 0 16px
    rgba(0, 0, 0, 0.1);
  --amplify-components-authenticator-router-border-width: 0;
}
</style>
