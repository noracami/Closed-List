# 檢核點 5 報告：歷史紀錄與每日滾動邏輯

## 狀態
✅ **已完成**

## 達成目標
成功為應用程式加入了「結束一天」的核心邏輯，並建立了歷史紀錄的查看功能。
*   在 `store` 中建立了 `endOfDay` 函式，用於處理每日的狀態變遷。
*   `endOfDay` 函式能將當天的任務列表存檔到歷史紀錄中。
*   `endOfDay` 函式能將未完成的任務和「明天待辦」的任務，自動滾動到新的一天。
*   在主介面新增了「結束今天」按鈕來觸發此功能。
*   建立了 `/history` 頁面和 `HistoryViewer` 組件，用於顯示所有已存檔的歷史清單。
*   在主頁面和歷史頁面之間新增了互相導航的連結，提升了使用體驗。

## 遭遇的困難與解決方案

### 困難 1: `TypeError: tasksForToday.filter is not a function`
*   **問題描述**: 在 `endOfDay` 函式中，對從 `store` 讀取出的 `tasksForToday` 變數使用 `.filter()` 方法時，程式崩潰。
*   **原因**: 與之前類似，`localStorage` 中的資料損壞，導致 `persistentAtom` 讀取到了一個非陣列的值。雖然 UI 組件中已加入防禦性檢查，但在 `store` 的 `action` 函式中卻沒有。
*   **解決方案**: 在 `endOfDay` 函式內部，對所有從 `store.get()` 讀取出的變數，都加入了 `Array.isArray()` 的防禦性檢查。

### 困難 2: `SyntaxError: ... does not provide an export named 'Task'`
*   **問題描述**: 在 `HistoryViewer.tsx` 組件中，無法導入 `Task` 型別，即使 `tasks.ts` 檔案中明確有 `export` 關鍵字。
*   **原因**: 這是一個在 SSR 框架中常見的模組解析問題。當一個模組只被用作 TypeScript 的「型別」時，如果使用值的導入方式 (`import { Task }`)，Vite 在打包處理時可能會出錯。
*   **解決方案**: 將 `HistoryViewer.tsx` 中對 `Task` 和 `DailyList` 的導入方式，從 `import { pastDailyLists, Task }` 修改為 `import type { Task, DailyList }`，明確告知編譯器這只是一個型別導入。

### 困難 3: `Hydration failed` (混合失敗) 錯誤
*   **問題描述**: 在執行「結束今天」並重新整理頁面後，瀏覽器控制台報錯 `Hydration failed`。
*   **原因**: 這是典型的 SSR/CSR 內容不匹配問題。伺服器在渲染 HTML 時，無法得知 `localStorage` 中的狀態，因此渲染出的是「初始狀態」的 HTML。而客戶端的 React 在接管頁面後，讀取了 `localStorage` 中「結束今天後」的狀態，發現與伺服器給的內容不一致，因此報錯。
*   **解決方案**: 在 `TaskManager.tsx` 和 `HistoryViewer.tsx` 這兩個依賴客戶端儲存的組件中，採用了「僅客戶端渲染」模式：
    1.  加入 `const [hasMounted, setHasMounted] = useState(false);` 狀態。
    2.  使用 `useEffect(() => { setHasMounted(true); }, []);`，因為 `useEffect` 只在客戶端執行。
    3.  在 `return` 敘述前加入判斷：`if (!hasMounted) { return null; }`。這確保了在伺服器端和客戶端初次渲染時，該組件不輸出任何內容，從而避免了不匹配。

### 困難 4: `Unexpected end of JSON input` 與 `[object Object]` 資料損壞
*   **問題描述**: 在修正上述問題後，又出現了 `JSON.parse` 無法解析空字串，以及 `localStorage` 中儲存的值變為 `[object Object]` 的問題。
*   **原因**: `@nanostores/persistent` 的預設序列化機制在處理巢狀物件和空值時不夠穩健。
*   **解決方案**:
    1.  建立一個更穩健的自訂 `decoder` 函式，它使用 `try-catch` 來處理無效的 JSON，並在遇到 `null` 或空字串時返回初始值。
    2.  為 `store` 中所有的 `persistentAtom` 明確指定 `encode: JSON.stringify` 和 `decode: customDecoder`，強制使用我們自訂的、更可靠的序列化/反序列化邏輯。

## 關鍵學習點
*   在混合式框架 (如 Astro) 中，任何依賴客戶端狀態（特別是 `localStorage`）的組件，都必須謹慎處理 SSR/CSR 的內容一致性問題。「僅客戶端渲染」模式 (`useEffect` + `hasMounted`) 是解決此類問題的有效手段。
*   資料持久化層的序列化/反序列化邏輯需要非常穩健，能應對各種邊界情況（如空值、格式錯誤等），否則會成為整個應用的不穩定因素。
*   在處理 TypeScript 的模組導入時，嚴格區分「值導入」和「型別導入」(`import type`)，可以避免一些難以察覺的打包和解析錯誤。
