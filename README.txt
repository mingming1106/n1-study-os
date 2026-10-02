N1 Study OS V3.4 — Chinese Vocabulary Merge Edition

主要变化：
1. 保留 V3.3 的断点续学、SRS、本机进度、JSON 备份、假名 TTS 发音。
2. 网站优先读取 n1-vocab-zh.json；中文释义作为主释义，英文折叠为辅助。
3. 包含 GitHub Actions 工作流：首次上传后，GitHub 自动下载 OpenJLPT N1 词表与 Tomoshi 2026-09-02 开放中文 SQLite 数据，按 JMdict ID 合并，生成 n1-vocab-zh.json 与 vocab-coverage.json。
4. 单词页会显示实际中文覆盖数量与百分比。

数据来源与许可：
- OpenJLPT: CC BY-SA 4.0；N1 分级为社区估计，JLPT 官方不发布固定词表。
- Tomoshi Open Data / JMdict-derived Chinese glosses: CC BY-SA 4.0；需署名 EDRDG 与 Tomoshi (Y1Z)。
- 本项目对上述数据做的修改：筛选 OpenJLPT N1 词条，并按 JMdict entry ID 合并 Tomoshi 简体中文释义，生成网页专用 JSON。

首次上传到 GitHub：
请连同隐藏的 .github 文件夹一起上传。GitHub Actions 完成后，仓库根目录会自动多出 n1-vocab-zh.json 和 vocab-coverage.json。
