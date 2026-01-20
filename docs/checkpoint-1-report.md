# 檢核點 1 報告：專案初始化與基礎佈局

## 狀態
✅ **已完成**

## 達成目標
成功初始化了一個基於 Astro (v5.16.11)、React (v19.2.3)、Tailwind CSS (v4.1.18) 的網頁專案。建立了基礎的檔案結構、佈局，並確認了樣式框架的正常運作。

## 遭遇的困難與解決方案

### 困難 1: `pnpm create astro` 指令無法在非空目錄中執行
*   **問題描述**：在包含 `.git`、`README.md` 和 `checkpoints.md` 的根目錄中執行 `pnpm create astro@latest` 時，Astro 報錯 `Directory is not empty!`。
*   **解決方案**：
    1.  建立一個臨時子目錄 `tmp-astro`。
    2.  在 `tmp-astro` 中執行 `pnpm create astro@latest` 並完成所有互動式設定。
    3.  將 `tmp-astro` 中的所有內容移動到根目錄。
    4.  刪除 `tmp-astro`。

### 困難 2: Tailwind CSS 樣式未生效 (第一次嘗試修正)
*   **問題描述**：雖然執行了 `pnpm astro add tailwind`，但頁面上的 Tailwind CSS 樣式未生效。檢查 `astro.config.mjs` 發現 `@astrojs/tailwind` 被錯誤地配置為 Vite 插件 (`@tailwindcss/vite`)，而不是 Astro 整合。
*   **解決方案**：手動修正 `astro.config.mjs`，將 `tailwindcss` 的導入改為 `@astrojs/tailwind`，並將其添加到 `integrations` 陣列中。

### 困難 3: `Cannot find module '@astrojs/tailwind'` 錯誤
*   **問題描述**：修正 `astro.config.mjs` 後，運行 `pnpm dev` 報錯 `Cannot find module '@astrojs/tailwind'`。
*   **解決方案**：雖然之前執行過 `pnpm astro add tailwind`，但 `@astrojs/tailwind` 套件並未被正確安裝。手動執行 `pnpm install @astrojs/tailwind` 進行安裝。

### 困難 4: Tailwind CSS v4 與 `@astrojs/tailwind` 的兼容性問題
*   **問題描述**：安裝 `@astrojs/tailwind` 後，運行 `pnpm dev` 再次報錯：`It looks like you're trying to use tailwindcss directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package...`。這表示 `@astrojs/tailwind` 整合套件（版本 6.0.2）尚未完全兼容 Tailwind CSS v4。
*   **解決方案 (最終成功方案)**：經過文檔和討論查詢，確認了 Astro v5.2+ 支援 Tailwind CSS v4 的新整合方式，該方式不依賴舊的 `@astrojs/tailwind` 套件。
    1.  **移除舊的整合**：執行 `pnpm remove @astrojs/tailwind`。
    2.  **清理 `astro.config.mjs`**：手動修正 `astro.config.mjs`，移除 `import tailwind from '@astrojs/tailwind';` 和 `integrations: [tailwind()]` 相關內容，只保留 `react()` 整合。
    3.  **手動安裝 Tailwind v4 相關依賴**：執行 `pnpm install tailwindcss@latest @tailwindcss/postcss@latest @tailwindcss/vite@latest`，確保所有必要套件版本正確。
    4.  **手動配置 `astro.config.mjs`**：將 `astro.config.mjs` 修改為以下內容，使用 `@tailwindcss/vite` 作為 Vite 插件：
        ```javascript
        import { defineConfig } from 'astro/config';
        import react from '@astrojs/react';
        import tailwindcss from '@tailwindcss/vite'; // 導入新的 vite 插件

        export default defineConfig({
          integrations: [react()],
          vite: {
            plugins: [tailwindcss()], // 在 vite 插件中使用
          },
        });
        ```
    5.  **建立全域 CSS 檔案**：建立 `src/styles/global.css` 並寫入 `@import "tailwindcss";`。
    6.  **在佈局中引入全域 CSS**：在 `src/layouts/Layout.astro` 的 `<script>` 區塊中加入 `import '../styles/global.css';`。

## 關鍵學習點
*   即使是官方的 `astro add` 指令，也可能因版本兼容性問題而無法正確設定。
*   對於新版本的主流框架（如 Tailwind CSS v4），有時需要手動配置以確保其與其他框架（如 Astro）的整合正確。
*   明確的錯誤訊息是寶貴的線索，即使解決方案可能需要多個步驟。
*   在遇到問題時，查詢官方文檔和社群討論是找出解決方案的關鍵。
