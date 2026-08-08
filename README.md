# 系统设计知识库 (System Design Knowledge Base)

基于 [The System Design Primer](https://github.com/donnemartin/system-design-primer)（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，作者 Donne Martin）改编搭建的中英双语知识库博客。

- **框架**：[VitePress](https://vitepress.dev)
- **语言**：简体中文（主站）+ English
- **部署**：GitHub Pages + GitHub Actions 自动发布
- **搜索**：VitePress 内置本地全文搜索

## 目录结构

```
docs/
├── .vitepress/config.mts   # 站点配置（i18n / 导航 / 侧边栏 / 搜索）
├── public/images/          # 架构图等静态资源
├── index.md                # 首页（简体中文，root locale）
├── guide/                  # 入门指南（从这里开始 / 学习指引 / 面试答题思路）
├── topics/                 # 16 个系统设计主题
├── interview/              # 8 道系统设计面试题与解答
└── en/                     # English（与中文目录同构）
```

## 本地开发

```bash
npm install
npm run docs:dev
```

## 构建与预览

```bash
npm run docs:build     # 产物输出到 docs/.vitepress/dist
npm run docs:preview   # 本地预览构建产物
```

## 部署

推送 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages：

<https://darven-cs.github.io/system-design-knowledge-base/>

## 许可

本站内容改编自 [The System Design Primer](https://github.com/donnemartin/system-design-primer)，遵循 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。
