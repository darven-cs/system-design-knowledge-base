import { defineConfig } from 'vitepress'

// GitHub Pages 项目路径（与仓库名保持一致）
const base = '/system-design-knowledge-base/'

// 简体中文（root locale）导航与侧边栏
const zh = {
  nav: [
    { text: '学习指引', link: '/guide/' },
    { text: '系统设计主题', link: '/topics/' },
    { text: '面试题与解答', link: '/interview/' },
    { text: '面向对象设计', link: '/ood/' },
  ],
  sidebar: {
    '/guide/': [
      {
        text: '入门指南',
        items: [
          { text: '从这里开始', link: '/guide/' },
          { text: '学习指引', link: '/guide/study-guide' },
          { text: '面试答题思路', link: '/guide/interview-approach' },
        ],
      },
    ],
    '/topics/': [
      {
        text: '系统设计主题',
        items: [
          { text: '主题总览', link: '/topics/' },
          { text: '性能与可扩展性', link: '/topics/performance-vs-scalability' },
          { text: '延迟与吞吐量', link: '/topics/latency-vs-throughput' },
          { text: '可用性与一致性', link: '/topics/availability-vs-consistency' },
          { text: '一致性模式', link: '/topics/consistency-patterns' },
          { text: '可用性模式', link: '/topics/availability-patterns' },
          { text: '域名系统 (DNS)', link: '/topics/dns' },
          { text: '内容分发网络 (CDN)', link: '/topics/cdn' },
          { text: '负载均衡器', link: '/topics/load-balancer' },
          { text: '反向代理', link: '/topics/reverse-proxy' },
          { text: '应用层', link: '/topics/application-layer' },
          { text: '数据库', link: '/topics/database' },
          { text: '缓存', link: '/topics/cache' },
          { text: '异步', link: '/topics/asynchronism' },
          { text: '通信', link: '/topics/communication' },
          { text: '安全', link: '/topics/security' },
          { text: '附录', link: '/topics/appendix' },
        ],
      },
    ],
    '/interview/': [
      {
        text: '面试题与解答',
        items: [
          { text: '题目总览', link: '/interview/' },
          { text: '设计 Pastebin / Bit.ly', link: '/interview/pastebin' },
          { text: '设计 Twitter 时间线', link: '/interview/twitter-timeline-search' },
          { text: '设计网页爬虫', link: '/interview/web-crawler' },
          { text: '设计 Mint.com', link: '/interview/mint' },
          { text: '社交网络数据结构', link: '/interview/social-network-data-structures' },
          { text: '搜索引擎 KV 存储', link: '/interview/key-value-store' },
          { text: 'Amazon 销售排名', link: '/interview/amazon-sales-ranking' },
          { text: '百万用户级系统', link: '/interview/scale-from-zero-to-millions' },
        ],
      },
    ],
    '/ood/': [
      {
        text: '面向对象设计',
        items: [{ text: '题目总览', link: '/ood/' }],
      },
    ],
  },
}

// English locale 导航与侧边栏
const en = {
  nav: [
    { text: 'Guide', link: '/en/guide/' },
    { text: 'Topics', link: '/en/topics/' },
    { text: 'Interviews', link: '/en/interview/' },
    { text: 'OOD', link: '/en/ood/' },
  ],
  sidebar: {
    '/en/guide/': [
      {
        text: 'Getting Started',
        items: [
          { text: 'Start Here', link: '/en/guide/' },
          { text: 'Study Guide', link: '/en/guide/study-guide' },
          { text: 'Interview Approach', link: '/en/guide/interview-approach' },
        ],
      },
    ],
    '/en/topics/': [
      {
        text: 'System Design Topics',
        items: [
          { text: 'Overview', link: '/en/topics/' },
          { text: 'Performance vs Scalability', link: '/en/topics/performance-vs-scalability' },
          { text: 'Latency vs Throughput', link: '/en/topics/latency-vs-throughput' },
          { text: 'Availability vs Consistency', link: '/en/topics/availability-vs-consistency' },
          { text: 'Consistency Patterns', link: '/en/topics/consistency-patterns' },
          { text: 'Availability Patterns', link: '/en/topics/availability-patterns' },
          { text: 'Domain Name System', link: '/en/topics/dns' },
          { text: 'Content Delivery Network', link: '/en/topics/cdn' },
          { text: 'Load Balancer', link: '/en/topics/load-balancer' },
          { text: 'Reverse Proxy', link: '/en/topics/reverse-proxy' },
          { text: 'Application Layer', link: '/en/topics/application-layer' },
          { text: 'Database', link: '/en/topics/database' },
          { text: 'Cache', link: '/en/topics/cache' },
          { text: 'Asynchronism', link: '/en/topics/asynchronism' },
          { text: 'Communication', link: '/en/topics/communication' },
          { text: 'Security', link: '/en/topics/security' },
          { text: 'Appendix', link: '/en/topics/appendix' },
        ],
      },
    ],
    '/en/interview/': [
      {
        text: 'Interview Q&A',
        items: [
          { text: 'Overview', link: '/en/interview/' },
          { text: 'Design Pastebin / Bit.ly', link: '/en/interview/pastebin' },
          { text: 'Design Twitter Timeline', link: '/en/interview/twitter-timeline-search' },
          { text: 'Design a Web Crawler', link: '/en/interview/web-crawler' },
          { text: 'Design Mint.com', link: '/en/interview/mint' },
          { text: 'Social Network Data Structures', link: '/en/interview/social-network-data-structures' },
          { text: 'KV Store for a Search Engine', link: '/en/interview/key-value-store' },
          { text: 'Amazon Sales Ranking', link: '/en/interview/amazon-sales-ranking' },
          { text: 'Scale to Millions of Users', link: '/en/interview/scale-from-zero-to-millions' },
        ],
      },
    ],
    '/en/ood/': [
      {
        text: 'Object-Oriented Design',
        items: [{ text: 'Overview', link: '/en/ood/' }],
      },
    ],
  },
}

export default defineConfig({
  base,
  lastUpdated: true,

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: '系统设计知识库',
      description: '学习如何设计大型可扩展系统 — 基于 The System Design Primer 的中英双语知识库',
      themeConfig: {
        ...zh,
        search: {
          provider: 'local',
          options: {
            miniSearch: {
              searchOptions: { boost: { title: 2, text: 1 }, fuzzy: 0.2 },
            },
          },
        },
        footer: {
          message:
            '内容改编自 <a href="https://github.com/donnemartin/system-design-primer">The System Design Primer</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
          copyright: 'Copyright © 2017 Donne Martin',
        },
        docFooter: { prev: '上一篇', next: '下一篇' },
        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        outline: { label: '本页目录', level: [2, 3] },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/darven-cs/system-design-knowledge-base' },
        ],
        lastUpdated: { text: '更新于', formatOptions: { dateStyle: 'short', timeStyle: 'medium' } },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'System Design Primer',
      description: 'Learn how to design large-scale systems — bilingual knowledge base based on The System Design Primer',
      themeConfig: {
        ...en,
        search: {
          provider: 'local',
        },
        footer: {
          message:
            'Content adapted from <a href="https://github.com/donnemartin/system-design-primer">The System Design Primer</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
          copyright: 'Copyright © 2017 Donne Martin',
        },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        outline: { label: 'On this page', level: [2, 3] },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/darven-cs/system-design-knowledge-base' },
        ],
        lastUpdated: { text: 'Last updated', formatOptions: { dateStyle: 'short', timeStyle: 'medium' } },
      },
    },
  },
})
