// vite.config.ts
import { defineConfig } from "file:///F:/QBCore/resources/resources/[test]/bl_appearance/web/node_modules/.pnpm/vite@4.4.9/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///F:/QBCore/resources/resources/[test]/bl_appearance/web/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@2.4.2_svelte@4.0.5_vite@4.4.9/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";

// postcss.config.js
import tailwind from "file:///F:/QBCore/resources/resources/[test]/bl_appearance/web/node_modules/.pnpm/tailwindcss@3.3.3/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///F:/QBCore/resources/resources/[test]/bl_appearance/web/node_modules/.pnpm/autoprefixer@10.4.16_postcss@8.4.30/node_modules/autoprefixer/lib/autoprefixer.js";

// tailwind.config.js
var tailwind_config_default = {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#252525",
        "secondary": "#3C3C3C",
        "accent": "#8685ef",
        "success": "#7FEB9D",
        "error": "#E5283E",
        "txt-primary": "#faf7ff",
        "txt-secondary": "#2b2b2b"
      }
    }
  },
  plugins: []
};

// postcss.config.js
var postcss_config_default = {
  plugins: [tailwind(tailwind_config_default), autoprefixer]
};

// vite.config.ts
import { resolve } from "path";
var vite_config_default = defineConfig({
  css: {
    postcss: postcss_config_default
  },
  plugins: [svelte({
    /* plugin options */
  })],
  base: "./",
  // fivem nui needs to have local dir reference
  resolve: {
    alias: {
      "@assets": resolve("./src/assets"),
      "@components": resolve("./src/components"),
      "@providers": resolve("./src/providers"),
      "@stores": resolve("./src/stores"),
      "@utils": resolve("./src/utils"),
      "@typings": resolve("./src/typings"),
      "@enums": resolve("./src/enums"),
      "@lib": resolve("./src/lib")
    }
  },
  server: {
    port: 3e3
  },
  build: {
    emptyOutDir: true,
    outDir: "../build",
    assetsDir: "./",
    rollupOptions: {
      output: {
        // By not having hashes in the name, you don't have to update the manifest, yay!
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcuanMiLCAidGFpbHdpbmQuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcUUJDb3JlXFxcXHJlc291cmNlc1xcXFxyZXNvdXJjZXNcXFxcW3Rlc3RdXFxcXGJsX2FwcGVhcmFuY2VcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxRQkNvcmVcXFxccmVzb3VyY2VzXFxcXHJlc291cmNlc1xcXFxbdGVzdF1cXFxcYmxfYXBwZWFyYW5jZVxcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L1FCQ29yZS9yZXNvdXJjZXMvcmVzb3VyY2VzL1t0ZXN0XS9ibF9hcHBlYXJhbmNlL3dlYi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXHJcbmltcG9ydCBwb3N0Y3NzIGZyb20gJy4vcG9zdGNzcy5jb25maWcuanMnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBjc3M6IHtcclxuICAgICAgcG9zdGNzcyxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbc3ZlbHRlKHtcclxuICAgICAgLyogcGx1Z2luIG9wdGlvbnMgKi9cclxuICAgIH0pXSxcclxuICAgIGJhc2U6ICcuLycsIC8vIGZpdmVtIG51aSBuZWVkcyB0byBoYXZlIGxvY2FsIGRpciByZWZlcmVuY2VcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQGFzc2V0cyc6IHJlc29sdmUoXCIuL3NyYy9hc3NldHNcIiksXHJcbiAgICAgICAgJ0Bjb21wb25lbnRzJzogcmVzb2x2ZShcIi4vc3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgICAgJ0Bwcm92aWRlcnMnOiByZXNvbHZlKFwiLi9zcmMvcHJvdmlkZXJzXCIpLFxyXG4gICAgICAgICdAc3RvcmVzJzogcmVzb2x2ZShcIi4vc3JjL3N0b3Jlc1wiKSxcclxuICAgICAgICAnQHV0aWxzJzogcmVzb2x2ZShcIi4vc3JjL3V0aWxzXCIpLFxyXG4gICAgICAgICdAdHlwaW5ncyc6IHJlc29sdmUoXCIuL3NyYy90eXBpbmdzXCIpLFxyXG4gICAgICAgICdAZW51bXMnOiByZXNvbHZlKCcuL3NyYy9lbnVtcycpLFxyXG4gICAgICAgICdAbGliJzogcmVzb2x2ZSgnLi9zcmMvbGliJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICBvdXREaXI6ICcuLi9idWlsZCcsXHJcbiAgICAgIGFzc2V0c0RpcjogJy4vJyxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgLy8gQnkgbm90IGhhdmluZyBoYXNoZXMgaW4gdGhlIG5hbWUsIHlvdSBkb24ndCBoYXZlIHRvIHVwZGF0ZSB0aGUgbWFuaWZlc3QsIHlheSFcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBgW25hbWVdLmpzYCxcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBgW25hbWVdLmpzYCxcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgW25hbWVdLltleHRdYFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgfSlcclxuICAiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXFFCQ29yZVxcXFxyZXNvdXJjZXNcXFxccmVzb3VyY2VzXFxcXFt0ZXN0XVxcXFxibF9hcHBlYXJhbmNlXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcUUJDb3JlXFxcXHJlc291cmNlc1xcXFxyZXNvdXJjZXNcXFxcW3Rlc3RdXFxcXGJsX2FwcGVhcmFuY2VcXFxcd2ViXFxcXHBvc3Rjc3MuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9RQkNvcmUvcmVzb3VyY2VzL3Jlc291cmNlcy9bdGVzdF0vYmxfYXBwZWFyYW5jZS93ZWIvcG9zdGNzcy5jb25maWcuanNcIjtpbXBvcnQgdGFpbHdpbmQgZnJvbSAndGFpbHdpbmRjc3MnO1xyXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XHJcbmltcG9ydCB0YWlsd2luZENvbmZpZyBmcm9tICcuL3RhaWx3aW5kLmNvbmZpZy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgcGx1Z2luczogW3RhaWx3aW5kKHRhaWx3aW5kQ29uZmlnKSwgYXV0b3ByZWZpeGVyXSxcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXFFCQ29yZVxcXFxyZXNvdXJjZXNcXFxccmVzb3VyY2VzXFxcXFt0ZXN0XVxcXFxibF9hcHBlYXJhbmNlXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcUUJDb3JlXFxcXHJlc291cmNlc1xcXFxyZXNvdXJjZXNcXFxcW3Rlc3RdXFxcXGJsX2FwcGVhcmFuY2VcXFxcd2ViXFxcXHRhaWx3aW5kLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovUUJDb3JlL3Jlc291cmNlcy9yZXNvdXJjZXMvW3Rlc3RdL2JsX2FwcGVhcmFuY2Uvd2ViL3RhaWx3aW5kLmNvbmZpZy5qc1wiOy8qKiBAdHlwZSB7aW1wb3J0KCd0YWlsd2luZGNzcycpLkNvbmZpZ30gKi9cclxuXHJcblxyXG5cclxuLy8gLS1wcmltYXJ5OiAjMmMyYzJjO1xyXG4vLyAtLXNlY29uZGFyeTogIzQyNDA1MDtcclxuLy8gLS1hY2NlbnQ6ICM4Njg1ZWY7XHJcblxyXG4vLyAtLXRleHQtcHJpbWFyeTogI2ZhZjdmZjtcclxuLy8gLS10ZXh0LXNlY29uZGFyeTogIzJiMmIyYjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBjb250ZW50OiBbXHJcbiAgICAgICAgXCIuL2luZGV4Lmh0bWxcIixcclxuICAgICAgICBcIi4vc3JjLyoqLyoue3N2ZWx0ZSxqcyx0cyxqc3gsdHN4fVwiLFxyXG4gICAgICBdLFxyXG4gIHRoZW1lOiB7XHJcbiAgICBleHRlbmQ6IHtcclxuICAgICAgICBjb2xvcnM6IHtcclxuICAgICAgICAgICAgJ3ByaW1hcnknOiAnIzI1MjUyNScsXHJcbiAgICAgICAgICAgICdzZWNvbmRhcnknOiAnIzNDM0MzQycsXHJcbiAgICAgICAgICAgICdhY2NlbnQnOiAnIzg2ODVlZicsXHJcblxyXG4gICAgICAgICAgICAnc3VjY2Vzcyc6ICcjN0ZFQjlEJyxcclxuICAgICAgICAgICAgJ2Vycm9yJzogJyNFNTI4M0UnLFxyXG5cclxuICAgICAgICAgICAgJ3R4dC1wcmltYXJ5JzogJyNmYWY3ZmYnLFxyXG4gICAgICAgICAgICAndHh0LXNlY29uZGFyeSc6ICcjMmIyYjJiJyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtdLFxyXG59XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtXLFNBQVMsb0JBQW9CO0FBQy9YLFNBQVMsY0FBYzs7O0FDRGlWLE9BQU8sY0FBYztBQUM3WCxPQUFPLGtCQUFrQjs7O0FDV3pCLElBQU8sMEJBQVE7QUFBQSxFQUNYLFNBQVM7QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNKLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNKLFdBQVc7QUFBQSxRQUNYLGFBQWE7QUFBQSxRQUNiLFVBQVU7QUFBQSxRQUVWLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUVULGVBQWU7QUFBQSxRQUNmLGlCQUFpQjtBQUFBLE1BQ3JCO0FBQUEsSUFDSjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQztBQUNaOzs7QUQ3QkEsSUFBTyx5QkFBUTtBQUFBLEVBQ2IsU0FBUyxDQUFDLFNBQVMsdUJBQWMsR0FBRyxZQUFZO0FBQ2xEOzs7QURIQSxTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsS0FBSztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsT0FBTztBQUFBO0FBQUEsRUFFakIsQ0FBQyxDQUFDO0FBQUEsRUFDRixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFdBQVcsUUFBUSxjQUFjO0FBQUEsTUFDakMsZUFBZSxRQUFRLGtCQUFrQjtBQUFBLE1BQ3pDLGNBQWMsUUFBUSxpQkFBaUI7QUFBQSxNQUN2QyxXQUFXLFFBQVEsY0FBYztBQUFBLE1BQ2pDLFVBQVUsUUFBUSxhQUFhO0FBQUEsTUFDL0IsWUFBWSxRQUFRLGVBQWU7QUFBQSxNQUNuQyxVQUFVLFFBQVEsYUFBYTtBQUFBLE1BQy9CLFFBQVEsUUFBUSxXQUFXO0FBQUEsSUFDN0I7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0YsT0FBTztBQUFBLElBQ0wsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUYsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
