# 蛋仔出發！

以 Three.js、TypeScript、Vite 製作的原創蛋形角色 3D 障礙賽。瀏覽器直接遊玩，純前端、繁體中文介面。

[線上遊玩](https://kevintsai1202.github.io/egg-party/)

## 本機啟動

需要 Node.js 22.12+ 或 24 LTS。

```powershell
npm install
npm run dev
```

開啟終端顯示的網址，預設為 http://127.0.0.1:5173。

## 操作

| 按鍵 | 動作 |
| --- | --- |
| WASD / 方向鍵 | 移動，W 朝終點方向 |
| 空白鍵 | 跳躍，落地後可再次跳躍 |
| Shift + 移動鍵 | 衝刺 |
| 畫面「重新開始」 | 重設本局並重新倒數 |

選好角色顏色後點擊「開始冒險」。賽道的空隙需要跳過，旋轉糖果棒可跳躍閃避；掉落時回到最近的檢查點，計時繼續。抵達棋盤終點線後顯示名次、時間與重生次數。

電腦對手為路線驅動的模擬角色，並非網路玩家。

## 手機與平板

支援觸控裝置的直向與橫向遊玩。開始後自動展開為全視窗場景：左側搖桿拖曳移動，右側「跳躍」點按起跳，「按住衝刺」持續加速，可多指同時操作。放開或取消觸點即停止對應輸入；返回大廳可重新選色。

電腦啟動區域網路服務：

```powershell
node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173
```

手機與電腦連接相同 Wi-Fi，以手機瀏覽器開啟 `http://電腦的區域網路IP:5173`。若連線失敗，檢查 Windows 防火牆是否允許 Node.js 的私人網路連線。正式使用可將 `dist` 部署至 HTTPS 靜態網站。

需要支援 WebGL 2 的現代瀏覽器。觸控裝置的像素倍率上限為 1.5、陰影解析度為 1024，實際效能依裝置而異。

音效預設關閉，可用頁首按鈕開啟。切到背景分頁時暫停比賽並清除按鍵狀態。重新整理頁面不保留成績。

## 建置與部署

```powershell
npm run build
npm run preview
```

將 `dist` 目錄部署至靜態網站服務。Three.js 會隨建置打包；角色、場景和短音效均由程式產生，不需外部模型。Google Fonts 載入失敗時會使用系統字型。

GitHub Pages 使用 `.github/workflows/deploy.yml` 自動建置。推送到 `main` 或手動執行 workflow 即會發布，Vite 的相對資源路徑支援 `/egg-party/` 子目錄。

## 結構

- `SPEC.md`：已確認的第一版規格。
- `src/main.ts`：場景、角色、碰撞、狀態機及介面互動。
- `src/style.css`：繁中介面與響應式樣式。
- `src/touch-controls.ts`：支援多點操作與取消事件的虛擬搖桿和動作按鈕。
- `public/egg.svg`：原創蛋形圖示。
- `output/playwright/`：本機瀏覽器驗證紀錄與截圖，不納入版本控制。

開發模式的 `window.eggSnapshot` 提供唯讀狀態快照，用於鍵盤實測觀察；正式建置不包含此介面。
