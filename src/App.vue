<script setup lang="ts">
// Authentication disabled - using mock data
</script>

<template>
  <router-view />
</template>

<style>
/* AWS Amplify UI customization */
:root {
  --amplify-colors-brand-primary-10: #fef3f1;
  --amplify-colors-brand-primary-20: #fce4df;
  --amplify-colors-brand-primary-40: #f9c0b3;
  --amplify-colors-brand-primary-60: #f59c87;
  --amplify-colors-brand-primary-80: #ef654d;
  --amplify-colors-brand-primary-90: #e85038;
  --amplify-colors-brand-primary-100: #d64632;
}

[data-amplify-authenticator] {
  --amplify-components-authenticator-router-box-shadow: 0 0 16px
    rgba(239, 101, 77, 0.15);
  --amplify-components-authenticator-router-border-width: 0;
  --amplify-components-button-primary-background-color: linear-gradient(
    135deg,
    #ef654d 0%,
    #ff8a65 100%
  );
}

/* Custom gradient for primary buttons */
[data-amplify-authenticator] [data-amplify-router] {
  background: linear-gradient(
    135deg,
    rgba(239, 101, 77, 0.03) 0%,
    rgba(255, 138, 101, 0.03) 100%
  );
}

[data-amplify-authenticator] button[type="submit"],
[data-amplify-authenticator] button[data-variation="primary"] {
  background: linear-gradient(135deg, #ef654d 0%, #ff8a65 100%) !important;
}

[data-amplify-authenticator] button[type="submit"]:hover,
[data-amplify-authenticator] button[data-variation="primary"]:hover {
  background: linear-gradient(135deg, #d65644 0%, #f57a58 100%) !important;
}
</style>
