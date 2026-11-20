# Nihe｜客製化臉部養護

- [顧客頁](https://jakeuj.com/Nihe/)可查看護理價目、試算搭配及下載店卡 QR Code。
- 店主工具（`/Nihe/studio/`）網站上不放入口，網址只私下提供給店主。可建立護理推薦卡與活動卡，在此瀏覽器保存草稿，並分享顧客可直接開啟的連結與 QR Code。
- 分享卡會保留當時的價格與文字。網址包含卡片內容，請填寫可公開分享的資料。要修改卡片，請重新產生並分享新的連結。

## 開發與維護

使用 Node.js 24，先執行 `npm ci`，再執行 `npm run dev`，開啟終端機顯示的 `/Nihe/` 網址。使用 `npm test` 驗證卡片格式與截止日，使用 `npm run build` 產生 `dist/`。推送至 `main` 後，GitHub Actions 會建置並發布 GitHub Pages。

主護理、加購及儲值方案集中於 [src/catalog.js](src/catalog.js)，以新版 DM 為準。續約禮、營業時間、預約小叮嚀、店址及 LINE 預約方式位於 [index.html](index.html)；營業時間沿用舊版官方帳號公告並標示確認中。依店主意願不放 Instagram、Facebook 等社群連結。正式上線時可更新這兩處，並重新檢視頁面的搜尋引擎索引設定。

## 圖像素材

兩張照片由 Codex 內建 ImageGen 生成，使用原 DM 的色調與植物意象作為參考。

<details>
<summary>首頁養護照與情境照提示詞</summary>

- [首頁養護照](public/media/facial-care.webp) — Use case: photorealistic-natural. Create one landscape 4:3 editorial skincare photograph for the warm gold and cream website of a Taiwanese facial care studio. Close-up in side profile of an adult East Asian woman reclining in visible cream terry spa linens, eyes gently closed and peaceful, with a soft ivory terry headband in her dark hair. Her head and elegant profile are the clear visual center in the right-middle of the composition, one natural therapist hand with fingers gently resting at her temple, understated and realistic skincare ritual. Modest spa linens, tasteful and approachable. Dappled honey sunlight through out-of-focus leaves, shadowed warm amber and champagne background, quiet terracotta highlights, soft cream linen texture, real skin texture, high-end magazine photography with subtle fine grain, natural color. Tight still life composition holding up to a central square crop, cinematic but natural. No text, logos, jewelry, bottles in foreground, graphic framing, or watermarks. The attached DM is reference for color and mood only.
- [儲值區情境照](public/media/spa-linen.webp) — Use case: photorealistic-natural. Create one wide landscape 3:2 editorial still-life photograph to pair with a Taiwanese facial care studio website. Cream linen towels beside a shallow ivory ceramic facial bowl with clear water, a small stem of dried golden leaves and softly blurred window shadows on travertine. Frame the items intentionally in lower center with warm golden glow and rich shadow, gently monochromatic amber, caramel, champagne, cream palette. Realistic materials, tactile linen texture, subtle fine grain, sophisticated daylight beauty photography, no people, minimal spa atmosphere. No text, brand, product labels, logo or watermark. The original flyer is reference only for colors and botanical details.

</details>
