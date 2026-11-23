# IELTS LLM Wiki 演進與檢查紀錄（Log）

## [2026-11-23] ingest | 初始 8 份原始資料建檔
- 完成 `1-map.pptx`、`小作文.pdf`、`小作文万能句式及词汇总结.pdf`、`2025小作文真题汇编.pdf`、`2025大作文真题汇编.pdf`、`SPEAKING 1 飞跃 31.pdf`、`SPEAKING 2 飞跃 29.pdf`、`雅思.docx` 之初次摘要與主題整合。

## [2026-11-23] lint | 初次健檢與問題發現
- `[fix]` 合併重複檔案：`小作文.pdf` 與 `小作文万能句式及词汇总结.pdf` 內容完全相同，合併為 `wiki/sources/writing-task1-phrases.md`。
- `[fix]` 勘誤紀錄：`2025大作文真题汇编.pdf` 第 24 頁（4/12）與第 26 頁（4/19）標題誤植為 4/5 數學題幹，已於 `writing-task2-2025.md` 標註實際範文主題（電腦技能、兒童自由度）。

## [2026-11-23] ingest | 官方基礎考情與獨立閱讀主題頁擴充
- 依據 `ielts.org` 官方資料建立 `wiki/topics/ielts-beginner-basics.md` 與 `wiki/topics/reading-strategy.md`（皆附可點擊官方 URL），讓聽力與閱讀各自擁有獨立且完整的 24 頁知識來源。
- 升級 `AGENTS.md` 採「現代藝廊展覽風（冷白＋濃黑＋克萊因藍）」與「7 單元 × 每單元 24 頁（共 168 頁）」互動家教簡報架構。

## [2026-11-23] lint | 結構化模板、術語白話化與雙向連結全面通過（Gate 1 PASS）
- 檢查全數 7 份 `wiki/sources/*.md` 與 7 份 `wiki/topics/*.md`：皆已補齊 YAML Frontmatter（`title/type/tags/updated/sources`）與必備章節。
- 檢查 `[[雙向連結]]` 密度：全數頁面皆具備 2 個以上有效雙向連結，無孤兒頁面。
- **Gate 1 狀態**：`PASS` — 已解鎖 `/build-slides` 產出 `slides/unit1.html` ～ `slides/unit7.html`。
