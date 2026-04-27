# CMS Input Article Schema Design

## Summary

This design changes only the `從CMS輸入文章` module. The goal is to align the workflow editor node schema and settings UI with the provided product spec for importing article data from CMS.

This change does not modify:

- `AI自動分類與標籤`
- `輸出文字到 CMS`
- any other node types
- legacy workflow compatibility

## Scope

The existing `cmsInput` node remains the same node type at the graph level:

- `type` stays `cmsInput`
- canvas fields such as `id`, `position`, and `measured` stay part of the node shape

The node's `data` payload and settings UI will be updated to match the spec.

## Target Node Shape

The target persisted node shape is:

```json
{
  "id": "cmsInput-node",
  "type": "cmsInput",
  "position": { "x": 0, "y": 0 },
  "measured": { "width": 240, "height": 62 },
  "data": {
    "title": "從CMS輸入",
    "cmsConfigId": "UUID",
    "cmsName": "Readr CMS",
    "cmsList": "Posts",
    "cmsPostIds": "1-4,7-9,11,12,13",
    "cmsPostSlugs": "post-a,post-b",
    "sourceFields": {
      "title": true,
      "category": true,
      "content": true,
      "tags": true
    },
    "outputFields": {
      "title": "string",
      "categories": "array[string]",
      "content": "string",
      "tags": "array[string]"
    },
    "outputFormat": "json"
  }
}
```

## Schema Changes

The current `cmsInput` node data includes:

- `source`
- `entryId`
- `fields.title`
- `fields.content`
- `fields.author`
- `fields.category`
- `outputFormat`

The new `cmsInput` node data will include:

- `title`
- `cmsConfigId`
- `cmsName`
- `cmsList`
- `cmsPostIds`
- `cmsPostSlugs`
- `sourceFields.title`
- `sourceFields.category`
- `sourceFields.content`
- `sourceFields.tags`
- `outputFields`
- `outputFormat`

The following fields are removed:

- `source`
- `entryId`
- `fields`
- `fields.author`

The following field groups are renamed or split:

- `source` becomes `cmsConfigId`, `cmsName`, and `cmsList`
- `entryId` becomes `cmsPostIds` and `cmsPostSlugs`
- `fields` becomes `sourceFields`

## Settings UI Changes

The settings panel for `從CMS輸入文章` will be updated to expose only the spec-defined fields.

### Shown in UI

- `來源CMS名稱`
- `來源CMS List`
- `文章ID`
- `文章slug`
- `抓取欄位 / 標題`
- `抓取欄位 / 分類`
- `抓取欄位 / 內文`
- `抓取欄位 / 標籤`

### Removed from UI

- old generic CMS source selector
- old single `文章 ID 或 slug` input
- `作者` field toggle

### UI behavior assumptions

- `cmsList` is stored as `Posts`
- `cmsList` is not user-editable in this phase
- `outputFormat` is stored as `json`
- `outputFields` is stored in config rather than treated as editor-only derived data

## Post Selector Parsing

`cmsPostIds` and `cmsPostSlugs` are both persisted as raw strings.

For `cmsPostIds`, the editor will support range-like string input such as:

- `1,2,3,4,7,8,9`
- `1-4,7-9,11,12,13`

The config will preserve the input string. Parsing is delegated to utilities.

### Utility requirements

Add utility support for:

- splitting comma-delimited selectors
- trimming whitespace
- expanding numeric ranges such as `1-4`
- returning normalized string arrays

Example:

- input: `1-4,7-9,11,12,13`
- parsed result: `["1", "2", "3", "4", "7", "8", "9", "11", "12", "13"]`

`cmsPostSlugs` remains a raw comma-delimited string and does not need numeric range expansion semantics.

## Data Flow

This node is the upstream article source contract for later modules.

Its output contract is explicitly stored in:

```json
{
  "outputFields": {
    "title": "string",
    "categories": "array[string]",
    "content": "string",
    "tags": "array[string]"
  },
  "outputFormat": "json"
}
```

This design intentionally stores that contract in the node config even though the original spec notes backend confirmation is still pending.

## Non-Goals

- no changes to `aiCall` or AI node schema in this step
- no changes to `cmsOutput` schema in this step
- no compatibility layer for old saved workflows
- no automatic migration of old `cmsInput` payloads

## Verification

Implementation will be considered correct when:

- newly created `cmsInput` nodes use the new data shape
- settings UI only shows the new CMS article input fields
- saved workflow JSON for `cmsInput` matches the new schema
- `cmsPostIds` accepts comma lists and numeric range strings
- parser utilities return normalized expanded results for numeric range input
