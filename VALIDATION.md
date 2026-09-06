# 第一版驗證紀錄

日期：2026-09-06。環境：Windows、Node.js 24、Chromium／Playwright。

## 已驗證

- `npm run build`：TypeScript 檢查及 Vite 正式建置成功。
- 桌面真實鍵盤事件：角色換色、倒數、移動、跳躍、兩個檢查點、抵達終點、結算及重玩。
- 起點掉落回到 z=5；第一檢查點掉落回到 z=-28，保留檢查點及持續計時。
- 鍵盤移動速度 7.2，Shift 衝刺速度 11 世界單位／秒。
- 手機觸控模擬：搖桿、衝刺、跳躍三指同時操作；取消觸控後輸入歸零。
- 觸控完整賽道：抵達兩個檢查點並通關，測試局 12.12 秒、0 次重生。
- 手機 390×844、844×390，平板 768×1024、1024×768：遊戲畫布填滿視窗，觸控元件未超出邊界，無水平溢出。
- 觸控測試未出現 JavaScript 執行錯誤。

## 測試界線

手機和平板是 Chromium 的觸控與視窗模擬，以 CDP 發送觸控事件；尚未在實體 iPhone、iPad 或 Android 裝置測試。實機 GPU 效能、Safari 特有行為與跨裝置 Wi-Fi／防火牆連線仍需實機確認。

## 本機證據

- `output/playwright/full-run.log`：桌面通關快照。
- `output/playwright/touch-run.log`：觸控操作、通關與四種版面量測。
- `output/playwright/checkpoint.png`：第一檢查點重生。
- `output/playwright/finish.png`、`phone-finish.png`：通關結算。
- `output/playwright/phone-portrait.png`、`phone-landscape.png`、`tablet-portrait.png`、`tablet-landscape.png`：畫面截圖。

測試腳本只讀取開發模式快照，角色移動經由鍵盤或觸控事件執行，沒有直接改寫位置或呼叫通關函式。
