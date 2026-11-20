# Nihe｜客製化臉部養護

- [顧客頁](https://jakeuj.com/Nihe/)可查看護理價目、試算搭配及下載店卡 QR Code。
- 店主工具（`/Nihe/studio/`）網站上不放入口，網址只私下提供給店主。可建立護理推薦卡與活動卡，在此瀏覽器保存草稿，並分享顧客可直接開啟的連結與 QR Code。
- 分享卡會保留當時的價格與文字。網址包含卡片內容，請填寫可公開分享的資料。要修改卡片，請重新產生並分享新的連結。

## 開發與維護

使用 Node.js 24，先執行 `npm ci`，再執行 `npm run dev`，開啟終端機顯示的 `/Nihe/` 網址。使用 `npm test` 驗證卡片格式與截止日，使用 `npm run build` 產生 `dist/`。推送至 `main` 後，GitHub Actions 會建置並發布 GitHub Pages。

主護理、加購及儲值方案集中於 [src/catalog.js](src/catalog.js)，以新版 DM 為準。續約禮、營業時間、預約小叮嚀、店址及 LINE 預約方式位於 [index.html](index.html)；營業時間不固定（店主利用業餘時間接客），網站只寫依預約安排、以 LINE 回覆為準。依店主意願不放 Instagram、Facebook 等社群連結。正式上線時可更新這兩處，並重新檢視頁面的搜尋引擎索引設定。

## 圖像素材

首頁養護照和儲值情境照由 Codex 內建 ImageGen 生成，使用原 DM 的色調與植物意象作為參考。[Nihe 標誌](public/media/nihe-logo.png)與[店主肖像插畫](public/media/nihe-owner.webp)同樣由內建 ImageGen 製作。[分頁圖示](public/media/nihe-icon.png)取自標誌的葉片。

<details>
<summary>首頁養護照與情境照提示詞</summary>

- [首頁養護照](public/media/facial-care.webp) — Use case: photorealistic-natural. Create one landscape 4:3 editorial skincare photograph for the warm gold and cream website of a Taiwanese facial care studio. Close-up in side profile of an adult East Asian woman reclining in visible cream terry spa linens, eyes gently closed and peaceful, with a soft ivory terry headband in her dark hair. Her head and elegant profile are the clear visual center in the right-middle of the composition, one natural therapist hand with fingers gently resting at her temple, understated and realistic skincare ritual. Modest spa linens, tasteful and approachable. Dappled honey sunlight through out-of-focus leaves, shadowed warm amber and champagne background, quiet terracotta highlights, soft cream linen texture, real skin texture, high-end magazine photography with subtle fine grain, natural color. Tight still life composition holding up to a central square crop, cinematic but natural. No text, logos, jewelry, bottles in foreground, graphic framing, or watermarks. The attached DM is reference for color and mood only.
- [儲值區情境照](public/media/spa-linen.webp) — Use case: photorealistic-natural. Create one wide landscape 3:2 editorial still-life photograph to pair with a Taiwanese facial care studio website. Cream linen towels beside a shallow ivory ceramic facial bowl with clear water, a small stem of dried golden leaves and softly blurred window shadows on travertine. Frame the items intentionally in lower center with warm golden glow and rich shadow, gently monochromatic amber, caramel, champagne, cream palette. Realistic materials, tactile linen texture, subtle fine grain, sophisticated daylight beauty photography, no people, minimal spa atmosphere. No text, brand, product labels, logo or watermark. The original flyer is reference only for colors and botanical details.

</details>

<details>
<summary>Nihe 標誌與店主肖像提示詞</summary>

**Nihe 標誌**

```text
Use case: logo-brand.
Asset type: one production-ready horizontal masthead logo for a Taiwanese facial-care studio, on true transparent alpha.
Design a refined logotype with a small independent abstract leaf emblem on its left. The emblem is a single elegant droplet-like folded leaf with a curved vein indicated in negative space. It is an intuitive botanical symbol with no letter shapes. The mark is 60% as tall as the capital N and vertically centered beside the wordmark, with a clear gap. Set the brand in sturdy medium-weight editorial serif lettering with slightly soft, curved terminals. The only text is exactly four letters “Nihe” (uppercase N, lowercase i, lowercase h, lowercase e), once. Ensure the N is the first letter with no separate stroke or extra glyph before it. Emblem and letters in solid dark cocoa #663A26. The result should feel warm and approachable next to a cream-and-honey website palette. Give enough outer margin for cropping. Render only the 2D logo asset, without a border, backdrop, typography samples, tags, periods, gradients, mockups or shadows.
```

**店主肖像插畫**

```text
Use case: style-transfer.
Asset type: vertical editorial portrait illustration for the “關於 Nihe” section of a warm cream-and-cocoa Taiwanese facial care website.
Input images: Image 1 is the portrait to transform, used for broad cues of dark hair and a warm beauty studio. Image 2 is a supporting reference only for tactile warmth and soft amber light. Remove the strong reds, retro fashion, accessories, backdrop and signage of Image 2.
Primary request: transform the salon portrait into an understated semi-realistic painted illustration of an adult East Asian female facial-care studio owner calmly arranging a folded cream towel. Protect likeness through a naturally averted pose viewed from the rear at three-quarter angle. Include just an indistinct sliver of cheek contour, with her nose, both eyes and mouth entirely hidden by head angle and slightly loosened dark hair. Use general hair and posture cues only, with no distinctive facial details, jewelry or other identifying features. Her hair is tied in a loose low bun. Dress her in a professional oat-colored, lightly textured wrap tunic. Warm, calm, welcoming and attentive.
Scene/backdrop: quiet light-filled facial-care studio with cream limewash, a soft diagonal honey-toned window shadow, folded cream linen and a small ceramic bowl. The cover frame should feel intimate and authentic without appearing like a depiction of a specific real location.
Style/medium: tactile fine-grained gouache and soft colored-pencil shading on lightly textured matte paper, polished editorial skincare illustration with slightly simplified forms. Muted honey, warm sand, ivory, cocoa and subtle dusty terracotta. Subtle natural light, credible hand anatomy, minimal composition. Vertical 4:5 frame, medium torso portrait at an angle with figure and folded towel comfortably inside the middle of the frame. Composition should also survive a center-square crop. No legible face, eye contact, medical coat, brand, text, watermark, extra people, glamorous posing or clinical props.
```

</details>
