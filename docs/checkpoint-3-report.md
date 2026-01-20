# 檢核點 3 報告：核心任務管理功能

## 狀態
✅ **已完成**

## 達成目標
成功地為應用程式加入了核心的互動功能。目前已實現：
*   一個可以讓使用者輸入並提交新任務的表單。
*   一個可以顯示今日任務列表的區塊。
*   點擊複選框可以將任務標記為「完成」（並顯示刪除線）。
*   所有任務狀態都會被自動保存到瀏覽器的 `localStorage` 中，重新整理頁面後資料不會遺失。

## 遭遇的困難與解決方案

### 困難：一系列的 `Cannot find module` 錯誤

在整合 Nanostores 進行狀態管理時，連續遇到了三個與「模組未找到」相關的錯誤。

*   **問題描述 1**: `Cannot find module '@nanostores/react'`
    *   **原因**: 在 React 組件 (`TaskManager.tsx`) 中使用了 `useStore` 這個 hook，但提供這個 hook 的 `@nanostores/react` 綁定套件沒有被安裝。

*   **問題描述 2**: `Cannot find module 'nanostores'`
    *   **原因**: 安裝了 React 綁定套件後，發現 `nanostores` 這個核心的基礎套件也從未被安裝。

*   **問題描述 3**: `Cannot find module '@nanostores/persistent'`
    *   **原因**: 在狀態管理檔案 (`tasks.ts`) 中使用了 `persistentAtom` 來實現資料持久化，但提供此功能的 `@nanostores/persistent` 子套件同樣沒有被安裝。

*   **最終解決方案**:
    1.  逐一根據錯誤訊息，安裝了 `@nanostores/react` 和 `nanostores`。
    2.  在遇到第三個錯誤後，意識到需要將所有 Nanostores 相關的依賴一次性安裝完整。
    3.  執行了以下合併後的指令，確保所有需要的 Nanostores 模組都被正確安裝：
        ```bash
        pnpm install nanostores @nanostores/react @nanostores/persistent
        ```

## 關鍵學習點
*   在使用像 Nanostores 這樣由多個套件組成的函式庫時，必須明確地安裝所有需要用到的部分，包括：
    *   **核心套件** (`nanostores`)
    *   **框架綁定** (`@nanostores/react`)
    *   **可選的功能性套件** (`@nanostores/persistent`)
*   不應假設安裝了某個子套件（如 `@nanostores/react`）就會自動安裝其對等的核心依賴。在 `pnpm` 或 `npm` 的現代版本中，`peerDependencies`（對等依賴）通常需要手動安裝。
