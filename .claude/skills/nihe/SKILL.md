---
name: nihe
description: Nihe 客製化臉部養護網站（jakeuj.com/Nihe）的內容來源、店主決定與維護流程。Use when changing Nihe prices, treatments, add-ons, stored-value plans, booking info (hours, address, payment, rules), the LINE contact, share cards or 店主工具, preparing go-live, or drafting a LINE message to the owner.
---

# Nihe

Vite 靜態網站，推到 `main` 後由 GitHub Actions 建置並發布到 https://jakeuj.com/Nihe/ 。檔案分工見 [README.md](../../../README.md)：價目在 `src/catalog.js`，其餘文案在 `index.html`。店主在對話與文案裡稱為「Nihe」。

## 資訊來源

依新舊排序，新的蓋過舊的：

1. **店主回覆**（透過使用者轉貼）
2. **新版 DM（2026）**：主護理、加購、儲值方案、使用期限、續約禮的唯一依據
3. **2022 LINE 官方帳號公告**：只沿用預約小叮嚀；舊營業時間、舊店址、舊服務項目（經絡、刮痧等）、葡眾產品、優惠預購都已過時

能沿用的先沿用、上線後再改；明顯不符現況的以最新來源為準。已有來源的內容直接採用，只向店主問真正缺的資訊——不對店主會主動說。

## 店主已決定（2026-11-20）

- 價目、四項加購 NT$500 皆正確；加購只有「淨透清肌」標時間；加購一定要搭配主護理。
- 儲值方案公開，期限照 DM，儲值金可多人共用。
- 店址：台中市東區十甲路396號。
- **營業時間不固定**：店主利用業餘時間接客，不會有固定時段。網站只寫「依預約安排，可預約的時段以 LINE 回覆為準」，措辭當作常態而非待補；這一項不用再問店主。
- 一定要預約（未預約店內可能沒人）；連續取消 3 次列黑名單，有證明者除外。
- 付款：現金、LINE Pay。轉帳只限熟客，不公開。
- 照片沿用 AI 生成圖，畫面上不出現「示意」字樣。
- 社群：不放 Instagram、Facebook（店主沒有經營）。唯一聯絡管道是 LINE 官方帳號 `@695nodop`。
- 網址先維持 jakeuj.com/Nihe；Google 收錄等店主通知。
- 店主工具（`/Nihe/studio/`）頁面上不放入口，網址只私下給店主。

## 改網站

1. 依上面的來源與決定修改；新的店主決定同步寫進「店主已決定」並更新日期。
2. `npm test` 與 `npm run build` 都通過。
3. 用 `.claude/launch.json` 的 `nihe-dev` 開預覽，網址是 `http://localhost:5173/Nihe/`。手機寬度 375px 時 `document.documentElement.scrollWidth` 等於 `innerWidth`；瀏覽器窗格的手機截圖常被裁切，以量測結果為準。
4. 使用者同意後 commit、push `main`，等 Pages workflow 成功，再用 `curl` 確認線上頁面出現新內容。

路徑寫法：`<img src>` 用 `/media/...`（Vite 會加上 base）；`<a href>` 要用 `%BASE_URL%media/...`，否則部署後會少 `/Nihe/`。

LINE QR 是用專案內的 `qrcode` 套件產生，換帳號時重產：

```js
QRCode.toFile('public/media/nihe-line-qr.png', 'https://line.me/R/ti/p/@695nodop', { width: 600, margin: 2 });
```

## 上線前清單

店主說可以開放搜尋時：

- `index.html`、`card/index.html` 移除 `noindex`；`studio/index.html` 保持 `noindex, nofollow`。
- `src/card-view.js` 卡片底部移除「展示版」。
- 換網域時一併更新 `src/catalog.js` 的 `homeUrl`、`index.html` 的 canonical 與 `og:*`、`card/index.html` 的 `og:image`，並重產 `public/media/nihe-qr.png`（顧客頁 QR）。

## 給店主的 LINE 訊息

純文字放在 ```` ```text ```` 區塊方便複製，不用 Markdown 粗體。繁體中文、口語、短句，先說做好了什麼，再用【】分組列出剩下要店主提供或決定的事；少量 emoji。技術名詞換成白話（例如店主工具＝「給你自己做推薦卡、活動卡的小工具」），需要店主選擇時直接附上建議，讓對方回「可以」就好。
