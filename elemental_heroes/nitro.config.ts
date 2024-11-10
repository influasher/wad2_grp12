import { defineNitroConfig } from 'nitropack/config';
 
// This function can run for a maximum of 60 seconds
export default defineNitroConfig({
  vercel: {
    functions: {
      maxDuration: 60,
    },
  },
});