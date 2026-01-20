# 檢核點 4 報告：新任務與緊急任務處理

## 狀態
✅ **已完成**

## 達成目標
成功為應用程式實現了「封閉式清單」方法中，關於處理當天中途出現任務的兩個關鍵功能：
*   **「明天待辦 (收件匣)」**：
    *   提供一個輸入框，允許使用者將新任務快速添加到「收件匣」中。
    *   收件匣中的任務以淡化樣式顯示，符合「不干擾今日清單」的原則。
    *   任務保存到 `localStorage` 中的 `tomorrowInbox`。
*   **「緊急插入」功能**：
    *   提供一個「緊急插入」按鈕。點擊後，使用者可以輸入一個任務，該任務會被直接添加到「今日清單」的頂部。
    *   緊急任務會被標記為 `isUrgent: true`，並在 UI 上以紅色文字和 `[緊急]` 標籤醒目顯示。

## 遭遇的困難與解決方案
*   **困難 1**: `TypeError: tasks.map is not a function`
    *   **問題描述**: 在完成檢核點 3 和 4 的實作後，運行應用程式時，控制台報錯 `TypeError: tasks.map is not a function`。
    *   **原因**: 這是因為 `currentDayTasks` 或 `tomorrowInbox` 從 `localStorage` 讀取到的值不是一個陣列，導致 `React` 組件嘗試對非陣列值呼叫 `.map()` 方法而崩潰。這通常發生在 `localStorage` 中的資料格式不正確或被意外修改時。
    *   **解決方案**:
        1.  指導使用者手動清除瀏覽器 `localStorage` 中與應用程式相關的鍵 (`currentTasks`, `tomorrowInbox`, `pastLists`)，讓 `persistentAtom` 可以重新用預設的空陣列初始化狀態。
        2.  在 `TaskManager.tsx` 組件中，加入了防禦性程式碼 `const tasks = Array.isArray(tasksFromStore) ? tasksFromStore : [];`，確保即使 `store` 返回的值不是陣列，應用程式也不會崩潰。

## 關鍵學習點
*   資料持久化時，`localStorage` 中的資料格式必須與應用程式期望的資料結構嚴格匹配。
*   在前端開發中，對來自外部來源（如 `localStorage`）的資料進行類型檢查和防禦性處理是非常重要的，以避免應用程式因資料異常而崩潰。
*   保持一致性和細心檢查，即使是看似簡單的初始化步驟，也可能因為環境差異或指令執行細節導致問題。
