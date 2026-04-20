# AI Classifier Tagger Design

**Goal:** 新增一個獨立於既有 `aiCall` 的 `aiClassifierTagger` module，讓 workflow builder 能新增、載入、編輯、保存符合規格書的「AI自動分類與標籤」節點。

## Scope

這次只新增 `aiClassifierTagger` module，不修改既有 `aiCall` 的 schema、設定 UI、或既有 workflow 的行為。

使用者在 module list 中會同時看到：

- `呼叫 AI`
- `AI自動分類與標籤`

## Data Contract

新 node 的資料契約固定如下：

```ts
{
  id: "aiClassifierTagger-node",
  type: "aiClassifierTagger",
  position: { x: 0, y: 0 },
  measured: { width: 240, height: 62 },
  data: {
    title: "AI自動分類與標籤",
    model: "gemini-1.5-flash",
    inputFields: {
      title: "source.title",
      content: "source.content",
    },
    promptTemplate:
      "你是一個新聞編輯助理，請根據文章內容產出分類與標籤。\n\n請嚴格依照以下 JSON 格式輸出，且不要加入任何說明文字：\n\n{\n  \"categories\": [\"string\"],\n  \"tags\": [\"string\"]\n}\n\n文章標題：{{title}}\n文章內文：{{content}}\n\n請產出 {{categoryAmount}} 個分類與 {{tagAmount}} 個標籤。",
    categoryAmount: 1,
    tagAmount: 3,
    responseFormat: {
      type: "json",
      schema: {
        categories: "array[string]",
        tags: "array[string]",
      },
    },
    outputFields: {
      categories: "array[string]",
      tags: "array[string]",
    },
  },
}
```

## Architecture

採用平行新增，而不是改寫 `aiCall`：

- 新 node component：渲染 `aiClassifierTagger`
- 新 zustand slice：只處理 `aiClassifierTagger` 的新增與更新
- 新 settings component：只編輯這個 node 的專用欄位
- `workflow-loader` 新增 normalization
- `flow-editor`、`module-list`、`node-setting-sidebar` 新增 wiring

這樣能避免既有 `aiCall` 被專用 schema 汙染，也讓後續 `AI自動分類與標籤` 的演進維持在獨立模組內。

## UI Design

### Module List

AI 模組區塊新增一張卡片：

- 標題：`AI自動分類與標籤`
- 說明：專用於文章分類與標籤產生
- icon：沿用 Sparkles 視覺體系即可

既有 `呼叫 AI` 繼續保留。

### Node Card

畫布上的 node card 沿用 `aiCall` 的視覺語系即可，避免額外設計噪音。主要差異只在 title 顯示 `AI自動分類與標籤`。

### Settings Panel

這個 node 的設定畫面只暴露規格中真正可調整的欄位：

- `模型版本`
- `inputFields.title`
- `inputFields.content`
- `Prompt模板`
- `產生分類數量`
- `產生標籤數量`

以下欄位要寫進 schema，但不讓使用者在 UI 編輯：

- `responseFormat`
- `outputFields`

原因是這兩塊在規格中屬於固定輸出契約，不應由使用者自由改動。

## Loading And Saving

`workflow-loader` 需要在 `node.type === "aiClassifierTagger"` 時，把任意輸入資料正規化成新 schema 的完整 `data`。缺欄位時補預設值。

workflow save path 不需要額外 special-case；只要 store 內的 node data 已符合 schema，序列化後就能直接保存。

## Seed And Demo Workflow

`prisma/seed.js` 的 demo article classification workflow 需要改成使用 `aiClassifierTagger`，讓 demo 流程與 PM 規格一致。

相對應測試也要從檢查 `aiCall` 改成檢查 `aiClassifierTagger`。

## Testing Strategy

這次嚴格採用 TDD，所有 production code 都必須由 failing test 驅動。

最低測試覆蓋：

- store slice：新增 node default schema 正確
- loader：能 normalize `aiClassifierTagger`
- settings UI：能顯示並更新專用欄位
- module list：能觸發新增新 node
- seed workflow：demo graph 改成使用 `aiClassifierTagger`

每個行為都遵守：

1. 先寫 failing test
2. 跑單一測試確認是紅燈
3. 寫最小實作
4. 重新跑測試確認轉綠
5. 再進下一個行為
