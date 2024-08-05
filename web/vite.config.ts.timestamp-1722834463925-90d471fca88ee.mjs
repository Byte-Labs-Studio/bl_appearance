// vite.config.ts
import { defineConfig } from "file:///D:/Byte%20Labs/BL_Server/server/resources/[bl]/bl_appearance/web/node_modules/.pnpm/vite@4.4.9/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///D:/Byte%20Labs/BL_Server/server/resources/[bl]/bl_appearance/web/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@2.4.2_svelte@4.0.5_vite@4.4.9/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";

// postcss.config.js
import tailwind from "file:///D:/Byte%20Labs/BL_Server/server/resources/[bl]/bl_appearance/web/node_modules/.pnpm/tailwindcss@3.3.3/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///D:/Byte%20Labs/BL_Server/server/resources/[bl]/bl_appearance/web/node_modules/.pnpm/autoprefixer@10.4.16_postcss@8.4.30/node_modules/autoprefixer/lib/autoprefixer.js";

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcuanMiLCAidGFpbHdpbmQuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcQnl0ZSBMYWJzXFxcXEJMX1NlcnZlclxcXFxzZXJ2ZXJcXFxccmVzb3VyY2VzXFxcXFtibF1cXFxcYmxfYXBwZWFyYW5jZVxcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEJ5dGUgTGFic1xcXFxCTF9TZXJ2ZXJcXFxcc2VydmVyXFxcXHJlc291cmNlc1xcXFxbYmxdXFxcXGJsX2FwcGVhcmFuY2VcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9CeXRlJTIwTGFicy9CTF9TZXJ2ZXIvc2VydmVyL3Jlc291cmNlcy9bYmxdL2JsX2FwcGVhcmFuY2Uvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5pbXBvcnQgcG9zdGNzcyBmcm9tICcuL3Bvc3Rjc3MuY29uZmlnLmpzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3MsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbc3ZlbHRlKHtcbiAgICAgIC8qIHBsdWdpbiBvcHRpb25zICovXG4gICAgfSldLFxuICAgIGJhc2U6ICcuLycsIC8vIGZpdmVtIG51aSBuZWVkcyB0byBoYXZlIGxvY2FsIGRpciByZWZlcmVuY2VcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQGFzc2V0cyc6IHJlc29sdmUoXCIuL3NyYy9hc3NldHNcIiksXG4gICAgICAgICdAY29tcG9uZW50cyc6IHJlc29sdmUoXCIuL3NyYy9jb21wb25lbnRzXCIpLFxuICAgICAgICAnQHByb3ZpZGVycyc6IHJlc29sdmUoXCIuL3NyYy9wcm92aWRlcnNcIiksXG4gICAgICAgICdAc3RvcmVzJzogcmVzb2x2ZShcIi4vc3JjL3N0b3Jlc1wiKSxcbiAgICAgICAgJ0B1dGlscyc6IHJlc29sdmUoXCIuL3NyYy91dGlsc1wiKSxcbiAgICAgICAgJ0B0eXBpbmdzJzogcmVzb2x2ZShcIi4vc3JjL3R5cGluZ3NcIiksXG4gICAgICAgICdAZW51bXMnOiByZXNvbHZlKCcuL3NyYy9lbnVtcycpLFxuICAgICAgICAnQGxpYic6IHJlc29sdmUoJy4vc3JjL2xpYicpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiAzMDAwLFxuICAgICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICBvdXREaXI6ICcuLi9idWlsZCcsXG4gICAgICBhc3NldHNEaXI6ICcuLycsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIC8vIEJ5IG5vdCBoYXZpbmcgaGFzaGVzIGluIHRoZSBuYW1lLCB5b3UgZG9uJ3QgaGF2ZSB0byB1cGRhdGUgdGhlIG1hbmlmZXN0LCB5YXkhXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IGBbbmFtZV0uanNgLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBgW25hbWVdLmpzYCxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogYFtuYW1lXS5bZXh0XWBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgfSlcbiAgIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxCeXRlIExhYnNcXFxcQkxfU2VydmVyXFxcXHNlcnZlclxcXFxyZXNvdXJjZXNcXFxcW2JsXVxcXFxibF9hcHBlYXJhbmNlXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQnl0ZSBMYWJzXFxcXEJMX1NlcnZlclxcXFxzZXJ2ZXJcXFxccmVzb3VyY2VzXFxcXFtibF1cXFxcYmxfYXBwZWFyYW5jZVxcXFx3ZWJcXFxccG9zdGNzcy5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0J5dGUlMjBMYWJzL0JMX1NlcnZlci9zZXJ2ZXIvcmVzb3VyY2VzL1tibF0vYmxfYXBwZWFyYW5jZS93ZWIvcG9zdGNzcy5jb25maWcuanNcIjtpbXBvcnQgdGFpbHdpbmQgZnJvbSAndGFpbHdpbmRjc3MnO1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xuaW1wb3J0IHRhaWx3aW5kQ29uZmlnIGZyb20gJy4vdGFpbHdpbmQuY29uZmlnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwbHVnaW5zOiBbdGFpbHdpbmQodGFpbHdpbmRDb25maWcpLCBhdXRvcHJlZml4ZXJdLFxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxCeXRlIExhYnNcXFxcQkxfU2VydmVyXFxcXHNlcnZlclxcXFxyZXNvdXJjZXNcXFxcW2JsXVxcXFxibF9hcHBlYXJhbmNlXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQnl0ZSBMYWJzXFxcXEJMX1NlcnZlclxcXFxzZXJ2ZXJcXFxccmVzb3VyY2VzXFxcXFtibF1cXFxcYmxfYXBwZWFyYW5jZVxcXFx3ZWJcXFxcdGFpbHdpbmQuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9CeXRlJTIwTGFicy9CTF9TZXJ2ZXIvc2VydmVyL3Jlc291cmNlcy9bYmxdL2JsX2FwcGVhcmFuY2Uvd2ViL3RhaWx3aW5kLmNvbmZpZy5qc1wiOy8qKiBAdHlwZSB7aW1wb3J0KCd0YWlsd2luZGNzcycpLkNvbmZpZ30gKi9cblxuXG5cbi8vIC0tcHJpbWFyeTogIzJjMmMyYztcbi8vIC0tc2Vjb25kYXJ5OiAjNDI0MDUwO1xuLy8gLS1hY2NlbnQ6ICM4Njg1ZWY7XG5cbi8vIC0tdGV4dC1wcmltYXJ5OiAjZmFmN2ZmO1xuLy8gLS10ZXh0LXNlY29uZGFyeTogIzJiMmIyYjtcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY29udGVudDogW1xuICAgICAgICBcIi4vaW5kZXguaHRtbFwiLFxuICAgICAgICBcIi4vc3JjLyoqLyoue3N2ZWx0ZSxqcyx0cyxqc3gsdHN4fVwiLFxuICAgICAgXSxcbiAgdGhlbWU6IHtcbiAgICBleHRlbmQ6IHtcbiAgICAgICAgY29sb3JzOiB7XG4gICAgICAgICAgICAncHJpbWFyeSc6ICcjMjUyNTI1JyxcbiAgICAgICAgICAgICdzZWNvbmRhcnknOiAnIzNDM0MzQycsXG4gICAgICAgICAgICAnYWNjZW50JzogJyM4Njg1ZWYnLFxuXG4gICAgICAgICAgICAnc3VjY2Vzcyc6ICcjN0ZFQjlEJyxcbiAgICAgICAgICAgICdlcnJvcic6ICcjRTUyODNFJyxcblxuICAgICAgICAgICAgJ3R4dC1wcmltYXJ5JzogJyNmYWY3ZmYnLFxuICAgICAgICAgICAgJ3R4dC1zZWNvbmRhcnknOiAnIzJiMmIyYicsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW10sXG59XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFgsU0FBUyxvQkFBb0I7QUFDM1osU0FBUyxjQUFjOzs7QUNENlcsT0FBTyxjQUFjO0FBQ3paLE9BQU8sa0JBQWtCOzs7QUNXekIsSUFBTywwQkFBUTtBQUFBLEVBQ1gsU0FBUztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0osT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ0osV0FBVztBQUFBLFFBQ1gsYUFBYTtBQUFBLFFBQ2IsVUFBVTtBQUFBLFFBRVYsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBRVQsZUFBZTtBQUFBLFFBQ2YsaUJBQWlCO0FBQUEsTUFDckI7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDO0FBQ1o7OztBRDdCQSxJQUFPLHlCQUFRO0FBQUEsRUFDYixTQUFTLENBQUMsU0FBUyx1QkFBYyxHQUFHLFlBQVk7QUFDbEQ7OztBREhBLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixLQUFLO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxPQUFPO0FBQUE7QUFBQSxFQUVqQixDQUFDLENBQUM7QUFBQSxFQUNGLE1BQU07QUFBQTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsV0FBVyxRQUFRLGNBQWM7QUFBQSxNQUNqQyxlQUFlLFFBQVEsa0JBQWtCO0FBQUEsTUFDekMsY0FBYyxRQUFRLGlCQUFpQjtBQUFBLE1BQ3ZDLFdBQVcsUUFBUSxjQUFjO0FBQUEsTUFDakMsVUFBVSxRQUFRLGFBQWE7QUFBQSxNQUMvQixZQUFZLFFBQVEsZUFBZTtBQUFBLE1BQ25DLFVBQVUsUUFBUSxhQUFhO0FBQUEsTUFDL0IsUUFBUSxRQUFRLFdBQVc7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDRixPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
