# CMS Output Text Design

**Goal:** 將現有 `cmsOutput` module 直接升級成符合「輸出文字到CMS」規格的新 schema 與設定面，同時保留既有 node type `cmsOutput`。

## Scope

這次不新增新 type，也不保留舊的 `cmsOutput` schema。

- `type` 繼續使用 `cmsOutput`
- `CmsOutputNodeData` 直接換成新版資料契約
- settings UI 改成設計稿中的固定 CMS / 固定 List / 回寫欄位 checkbox / CMS 狀態 radio
- 透過 loader 將舊 workflow 的 `cmsOutput` 轉成新版格式

## Data Contract

新的 `cmsOutput` node data 應為：

```ts
{
  id: "cmsOutputText-node",
  type: "cmsOutput",
  position: { x: 0, y: 0 },
  measured: { width: 240, height: 62 },
  data: {
    title: "輸出文字到CMS",
    cmsConfigId: string,
    cmsName: "Readr CMS",
    cmsList: "Posts",
    cmsPostIds: string,
    cmsPostSlugs: string,
    mappings: [
      {
        id: string,
        sourceField: string,
        targetField:
          | "title"
          | "recommendedTitle"
          | "content"
          | "summary"
          | "categories"
          | "tags"
          | "recommendedPoll",
      },
    ],
    mode: "overwrite" | "append",
    postStatus: "draft" | "published",
  },
}
```

`mode` 是整個 node 共用設定，不放在每筆 `mapping` 上。

## UI Design

設定面應對齊你提供的設計稿：

- 標題：`輸出文字到 CMS 設定`
- `cmsName`：disabled input，固定 `Readr CMS`
- `cmsList`：disabled input 或 disabled select，固定 `Posts`
- `回寫欄位`：checkbox 清單
- `CMS 狀態`：radio group

這一輪 UI 中不顯示：

- `cmsPostIds`
- `cmsPostSlugs`
- 自由編輯的 `mappings` row

這些欄位仍然存在於 schema，但先不暴露給使用者。

## Mapping Strategy

這條 workflow 目前真正需要支援的回寫欄位只有：

- `分類`
- `標籤`

因此本輪 `回寫欄位` checkbox 雖然可以顯示完整清單：

- 標題
- 建議標題
- 內文
- 重點摘要
- 分類
- 標籤
- 建議投票選項

但只有 `分類` 和 `標籤` 會實際產生 `mappings`：

- 勾選 `分類`
  - `sourceField: "{{ ai.categories }}"`
  - `targetField: "categories"`
- 勾選 `標籤`
  - `sourceField: "{{ ai.tags }}"`
  - `targetField: "tags"`

取消勾選就移除對應 mapping。

其餘欄位本輪先 disabled，不產生 mapping。

## Defaults

新建 `cmsOutput` node 的預設值應為：

```ts
{
  title: "輸出文字到CMS",
  cmsConfigId: "",
  cmsName: "Readr CMS",
  cmsList: "Posts",
  cmsPostIds: "",
  cmsPostSlugs: "",
  mappings: [],
  mode: "overwrite",
  postStatus: "draft",
}
```

## Loading And Saving

舊資料結構：

```ts
{
  title: string,
  cmsLocation: string,
  articleIdOrSlug: string,
  mappings: { id, sourceField, targetField }[],
  mode: "overwrite" | "append"
}
```

載入時需正規化成新 schema：

- `cmsLocation` -> `cmsName` / `cmsList` 的預設值
- `articleIdOrSlug` 不再沿用，改成空字串的 `cmsPostIds` / `cmsPostSlugs`
- 舊 `mappings` 保留，但 `targetField` 限制在新版允許集合內
- `postStatus` 缺值時補 `draft`

save path 不需額外轉換，只要 store 中的 node data 已符合新 schema，直接序列化即可。

## Seed And Demo Workflow

demo workflow 中現有 `cmsOutput` node 應同步改成新版 schema，且對應：

- `{{ ai.categories }}` -> `categories`
- `{{ ai.tags }}` -> `tags`

## Testing Strategy

這次一樣採嚴格 TDD，最低覆蓋包括：

- store defaults
- workflow loader normalization
- settings UI 行為
- save path request body
- seed workflow

其中 `回寫欄位` 要特別驗證：

- 勾 `分類` 會產生正確 mapping
- 勾 `標籤` 會產生正確 mapping
- 取消勾選會移除 mapping
- 其他欄位 disabled，不應產生 mapping
