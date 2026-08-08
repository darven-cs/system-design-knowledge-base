#!/usr/bin/env node
/**
 * 内容拆分脚本
 * 将《The System Design Primer》的 README.md（en）与 README-zh-Hans.md（zh）
 * 按章节拆分为 VitePress 知识库页面，替换占位 stub。
 *
 * 用法: node scripts/split-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
// 源仓库目录（可通过环境变量覆盖）
const PRIMER = process.env.PRIMER || join(ROOT, '..')
const DOCS = join(ROOT, 'docs')

const GH_BLOB = 'https://github.com/donnemartin/system-design-primer/blob/master'
const GH_TREE = 'https://github.com/donnemartin/system-design-primer/tree/master'

// ---------- 章节映射：中文（root locale）----------
const zhMap = {
  目的: { kind: 'meta', target: 'guide/index.md' },
  抽认卡: { kind: 'meta', target: 'guide/study-guide.md' },
  贡献: { kind: 'skip' },
  系统设计主题的索引: { kind: 'skip' },
  学习指引: { kind: 'page', target: 'guide/study-guide.md' },
  如何处理一个系统设计的面试题: { kind: 'page', target: 'guide/interview-approach.md' },
  系统设计的面试题和解答: { kind: 'interview' },
  面向对象设计的面试问题及解答: { kind: 'page', target: 'ood/index.md' },
  '系统设计主题：从这里开始': { kind: 'page', target: 'guide/index.md' },
  性能与可扩展性: { kind: 'page', target: 'topics/performance-vs-scalability.md' },
  延迟与吞吐量: { kind: 'page', target: 'topics/latency-vs-throughput.md' },
  可用性与一致性: { kind: 'page', target: 'topics/availability-vs-consistency.md' },
  一致性模式: { kind: 'page', target: 'topics/consistency-patterns.md' },
  可用性模式: { kind: 'page', target: 'topics/availability-patterns.md' },
  域名系统: { kind: 'page', target: 'topics/dns.md' },
  '内容分发网络（CDN）': { kind: 'page', target: 'topics/cdn.md' },
  负载均衡器: { kind: 'page', target: 'topics/load-balancer.md' },
  '反向代理（web 服务器）': { kind: 'page', target: 'topics/reverse-proxy.md' },
  应用层: { kind: 'page', target: 'topics/application-layer.md' },
  数据库: { kind: 'page', target: 'topics/database.md' },
  缓存: { kind: 'page', target: 'topics/cache.md' },
  异步: { kind: 'page', target: 'topics/asynchronism.md' },
  通讯: { kind: 'page', target: 'topics/communication.md' },
  安全: { kind: 'page', target: 'topics/security.md' },
  附录: { kind: 'page', target: 'topics/appendix.md' },
  正在完善中: { kind: 'skip' },
  致谢: { kind: 'skip' },
  联系方式: { kind: 'skip' },
  许可: { kind: 'skip' },
}

// 英文章节映射
const enMap = {
  Motivation: { kind: 'meta', target: 'guide/index.md' },
  'Anki flashcards': { kind: 'meta', target: 'guide/study-guide.md' },
  Contributing: { kind: 'skip' },
  'Index of system design topics': { kind: 'skip' },
  'Study guide': { kind: 'page', target: 'guide/study-guide.md' },
  'How to approach a system design interview question': { kind: 'page', target: 'guide/interview-approach.md' },
  'System design interview questions with solutions': { kind: 'interview' },
  'Object-oriented design interview questions with solutions': { kind: 'page', target: 'ood/index.md' },
  'System design topics: start here': { kind: 'page', target: 'guide/index.md' },
  'Performance vs scalability': { kind: 'page', target: 'topics/performance-vs-scalability.md' },
  'Latency vs throughput': { kind: 'page', target: 'topics/latency-vs-throughput.md' },
  'Availability vs consistency': { kind: 'page', target: 'topics/availability-vs-consistency.md' },
  'Consistency patterns': { kind: 'page', target: 'topics/consistency-patterns.md' },
  'Availability patterns': { kind: 'page', target: 'topics/availability-patterns.md' },
  'Domain name system': { kind: 'page', target: 'topics/dns.md' },
  'Content delivery network': { kind: 'page', target: 'topics/cdn.md' },
  'Load balancer': { kind: 'page', target: 'topics/load-balancer.md' },
  'Reverse proxy (web server)': { kind: 'page', target: 'topics/reverse-proxy.md' },
  'Application layer': { kind: 'page', target: 'topics/application-layer.md' },
  Database: { kind: 'page', target: 'topics/database.md' },
  Cache: { kind: 'page', target: 'topics/cache.md' },
  Asynchronism: { kind: 'page', target: 'topics/asynchronism.md' },
  Communication: { kind: 'page', target: 'topics/communication.md' },
  Security: { kind: 'page', target: 'topics/security.md' },
  Appendix: { kind: 'page', target: 'topics/appendix.md' },
  'Under development': { kind: 'skip' },
  Credits: { kind: 'skip' },
  'Contact info': { kind: 'skip' },
  License: { kind: 'skip' },
}

// ---------- 面试题 h3 -> 页面名 ----------
const zhInterview = {
  '设计 Pastebin.com (或者 Bit.ly)': 'pastebin',
  '设计 Twitter 时间线和搜索 (或者 Facebook feed 和搜索)': 'twitter-timeline-search',
  '设计一个网页爬虫': 'web-crawler',
  '设计 Mint.com': 'mint',
  '为一个社交网络设计数据结构': 'social-network-data-structures',
  '为搜索引擎设计一个 key-value 储存': 'key-value-store',
  '设计按类别分类的 Amazon 销售排名': 'amazon-sales-ranking',
  '在 AWS 上设计一个百万用户级别的系统': 'scale-from-zero-to-millions',
}
const enInterview = {
  'Design Pastebin.com (or Bit.ly)': 'pastebin',
  'Design the Twitter timeline and search (or Facebook feed and search)': 'twitter-timeline-search',
  'Design a web crawler': 'web-crawler',
  'Design Mint.com': 'mint',
  'Design the data structures for a social network': 'social-network-data-structures',
  'Design a key-value store for a search engine': 'key-value-store',
  "Design Amazon's sales ranking by category feature": 'amazon-sales-ranking',
  'Design a system that scales to millions of users on AWS': 'scale-from-zero-to-millions',
}

// solutions/system_design/<dir> -> 本站面试页（locale 相对路径）
const solutionMap = {
  pastebin: 'interview/pastebin',
  twitter: 'interview/twitter-timeline-search',
  web_crawler: 'interview/web-crawler',
  mint: 'interview/mint',
  social_graph: 'interview/social-network-data-structures',
  query_cache: 'interview/key-value-store',
  sales_rank: 'interview/amazon-sales-ranking',
  scaling_aws: 'interview/scale-from-zero-to-millions',
}

// 被跳过的目录章节 -> 站内目标（locale 相对）或原仓库链接
const zhSpecial = {
  系统设计主题的索引: 'topics/',
  贡献: `${GH_BLOB}/CONTRIBUTING.md`,
}
const enSpecial = {
  'index-of-system-design-topics': 'topics/',
  contributing: `${GH_BLOB}/CONTRIBUTING.md`,
}

// ---------- GitHub 风格 slug（兼容 CJK）----------
function slugify(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

// ---------- 章节解析 ----------
function splitSections(text) {
  const lines = text.split('\n')
  const sections = []
  let current = null
  for (const line of lines) {
    const m = line.match(/^(#{1,4})\s+(.+?)\s*$/)
    if (m && m[1].length === 2) {
      if (current) sections.push(current)
      current = { title: m[2], lines: [line] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
}

function splitInterview(section) {
  const parts = []
  let current = { title: null, lines: [] }
  for (const line of section.lines) {
    const m = line.match(/^###\s+(.+?)\s*$/)
    if (m) {
      if (current.title !== null || current.lines.length > 0) parts.push(current)
      current = { title: m[1], lines: [line] }
    } else {
      current.lines.push(line)
    }
  }
  parts.push(current)
  return parts
}

// 标题降级：起始标题 level -> '#'
function demote(lines, startLevel) {
  return lines.map((line) => {
    const m = line.match(/^(#{1,6})\s+(.*)$/)
    if (!m) return line
    const newLvl = Math.max(1, Math.min(1 + (m[1].length - startLevel), 6))
    return '#'.repeat(newLvl) + ' ' + m[2]
  })
}

// ---------- 锚点地图 ----------
function buildAnchorMap(sections, map, interviewMap, special) {
  const amap = {}
  const add = (slug, page, isPageTitle) => {
    if (!slug) return
    if (special[slug]) return
    if (!amap[slug]) amap[slug] = []
    amap[slug].push({ page, isPageTitle })
  }
  for (const sec of sections) {
    const cfg = map[sec.title]
    if (!cfg || cfg.kind === 'skip') continue
    if (cfg.kind === 'interview') {
      add(slugify(sec.title), 'interview/index.md', true)
      const parts = splitInterview(sec)
      for (const part of parts.slice(1)) {
        const slug = interviewMap[part.title]
        if (!slug) continue
        add(slugify(part.title), `interview/${slug}.md`, true)
        for (const line of part.lines.slice(1)) {
          const m = line.match(/^(#{4,6})\s+(.+?)\s*$/)
          if (m) add(slugify(m[2]), `interview/${slug}.md`, false)
        }
      }
      continue
    }
    for (const line of sec.lines) {
      const m = line.match(/^(#{1,4})\s+(.+?)\s*$/)
      if (m) add(slugify(m[2]), cfg.target, m[1].length === 2)
    }
  }
  return amap
}

// ---------- 链接重写 ----------
let anchorMap = {}
let locale = 'zh'

const loc = (path) => (locale === 'en' ? `/en/${path}` : `/${path}`)

function rewriteUrl(url, pagePath) {
  const t = url.trim()
  if (/^[a-z]+:\/\//i.test(t) || t.startsWith('mailto:')) return t
  if (/^\.\.?\//.test(t)) {
    // 相对路径（可能是图片或其他文件）
    if (t.startsWith('../')) return `${GH_BLOB}/${t}`
    const clean = t.replace(/^\.\//, '')
    if (clean.startsWith('images/')) return '/images/' + clean.slice('images/'.length)
    return `${GH_BLOB}/${clean}`
  }
  if (t.startsWith('/')) {
    if (t.startsWith('/images/')) return t
    return t // 已是绝对站内路径
  }
  if (t.startsWith('#')) {
    const slug = t.slice(1)
    if (special(slug)) {
      const v = special(slug)
      return v.startsWith('http') ? v : loc(v)
    }
    const entries = anchorMap[slug]
    if (!entries) return t // 未知锚点，稍后转粗体
    const local = entries.filter((e) => e.page === pagePath)
    if (local.length) return t
    const pages = [...new Set(entries.map((e) => e.page))]
    if (pages.length === 1) {
      const e = entries[0]
      const base = e.page.replace(/\.md$/, '')
      return e.isPageTitle ? loc(base) : `${loc(base)}#${slug}`
    }
    return t
  }
  if (t.startsWith('images/')) return '/images/' + t.slice('images/'.length)
  // Anki 闪卡直接链回原仓库（避免 VitePress 对 .apkg 追加 .html 导致下载失效）
  if (t.startsWith('resources/flash_cards/')) return `${GH_TREE}/resources/flash_cards/${t.slice('resources/flash_cards/'.length)}`
  if (t.startsWith('resources/')) return '/images/' + t.slice('resources/'.length)
  if (t.startsWith('solutions/')) {
    const m = t.match(/^solutions\/system_design\/([^/]+)\/README/i)
    if (m && solutionMap[m[1]]) {
      // 面试题页内指向完整方案 -> 原仓库；索引页 -> 本站
      return pagePath.includes('interview/index.md') ? loc(solutionMap[m[1]]) : `${GH_BLOB}/${t}`
    }
    if (t.startsWith('solutions/object_oriented_design/')) return `${GH_BLOB}/${t}`
    return `${GH_TREE}/${t}`
  }
  if (/\.(md|ipynb|png|jpe?g|gif|svg|apkg)$/i.test(t)) return `${GH_BLOB}/${t}`
  return t
}

function special(slug) {
  return locale === 'zh' ? zhSpecial[slug] : enSpecial[slug]
}

// 非 void HTML 元素（不能自闭合）
const VOID_ELEMENTS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'])

function rewriteLine(line, pagePath) {
  let s = line
  // 给 HTML 标签内未加引号的属性值补引号（原 README 存在大量如 href=https://... 的写法）
  s = s.replace(/<[^>]+>/g, (tag) => {
    return tag.replace(/(\s[a-zA-Z_:][\w.:-]*)=([^\s"'<>`]+)/g, '$1="$2"')
  })
  // 非 void 元素自闭合（如 <a href="..."/>，原仓库存在此 bug）转为普通开标签
  s = s.replace(/<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*?)?)\/>/g, (m, name, attrs) => {
    return VOID_ELEMENTS.has(name.toLowerCase()) ? m : `<${name}${attrs}>`
  })
  // HTML <img src="...">（README 中大量使用）
  s = s.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/gi, (m, pre, src, post) => {
    return `<img${pre}src="${rewriteUrl(src, pagePath)}"${post}>`
  })
  s = s.replace(/\]\(([^)]+)\)/g, (m, url) => `](${rewriteUrl(url, pagePath)})`)
  s = s.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, (m, text, slug) => {
    const valid = anchorMap[slug] || special(slug)
    return valid ? m : `**${text}**`
  })
  return s
}

function rewriteLinks(text, pagePath) {
  const out = []
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      out.push(line)
      continue
    }
    out.push(inFence ? line : rewriteLine(line, pagePath))
  }
  return out.join('\n')
}

// ---------- 面试索引页 ----------
function buildInterviewIndex(introText, parts, interviewMap) {
  const list = parts
    .map((part) => {
      const slug = interviewMap[part.title]
      return slug ? `- [${part.title}](${loc('interview/' + slug)})` : null
    })
    .filter(Boolean)
    .join('\n')
  const clean = introText
    .split('\n')
    .filter((l) => !l.includes('|')) // 丢弃原表格，用生成列表替代
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return clean + '\n\n' + list + '\n'
}

// ---------- 指南页组装 ----------
function assemble(target, contributions) {
  const page = contributions.find((c) => c.type === 'page')
  const meta = contributions.find((c) => c.type === 'meta')
  if (target.endsWith('guide/index.md')) {
    if (page && meta) {
      const p = page.text.trim()
      const nl = p.indexOf('\n')
      const h1 = nl >= 0 ? p.slice(0, nl) : p
      const rest = nl >= 0 ? p.slice(nl + 1).trim() : ''
      return h1 + '\n\n' + meta.text.trim() + (rest ? '\n\n' + rest : '') + '\n'
    }
    return (page ? page.text : '') + (meta ? '\n\n' + meta.text : '')
  }
  if (target.endsWith('guide/study-guide.md')) {
    // 页面正文在前，Anki 抽认卡（meta）追加在后
    const pageText = page ? page.text.trim() : ''
    const metas = contributions.filter((c) => c.type === 'meta').map((c) => c.text.trim()).filter(Boolean)
    return [pageText, ...metas].filter(Boolean).join('\n\n') + '\n'
  }
  return contributions
    .map((c) => c.text.trim())
    .filter(Boolean)
    .join('\n\n') + '\n'
}

// ---------- 主流程 ----------
function runSplit(lang, sourceFile, map, interviewMap, spec) {
  locale = lang
  const dir = lang === 'en' ? join(DOCS, 'en') : DOCS
  const src = readFileSync(join(PRIMER, sourceFile), 'utf8')
  const sections = splitSections(src)
  anchorMap = buildAnchorMap(sections, map, interviewMap, spec)

  const targetContribs = {} // target -> [{type, text}]
  const warnings = []
  const skipped = []

  for (const sec of sections) {
    const cfg = map[sec.title]
    if (!cfg) {
      warnings.push(`未映射章节: ${sec.title}`)
      continue
    }
    if (cfg.kind === 'skip') {
      skipped.push(sec.title)
      continue
    }
    if (cfg.kind === 'meta') {
      const text = rewriteLinks(demote(sec.lines, 1).join('\n'), cfg.target)
      ;(targetContribs[cfg.target] ||= []).push({ type: 'meta', text })
    } else if (cfg.kind === 'page') {
      const text = rewriteLinks(demote(sec.lines, 2).join('\n'), cfg.target)
      ;(targetContribs[cfg.target] ||= []).push({ type: 'page', text })
    } else if (cfg.kind === 'interview') {
      const parts = splitInterview(sec)
      // 索引页（parts[0].lines 已含章节标题行）
      const introText = rewriteLinks(demote(parts[0].lines, 2).join('\n'), 'interview/index.md')
      ;(targetContribs['interview/index.md'] ||= []).push({
        type: 'interview',
        text: buildInterviewIndex(introText, parts.slice(1), interviewMap),
      })
      // 各子题页
      for (const part of parts.slice(1)) {
        const slug = interviewMap[part.title]
        if (!slug) {
          warnings.push(`未映射面试题: ${part.title}`)
          continue
        }
        const text = rewriteLinks(demote(part.lines, 3).join('\n'), `interview/${slug}.md`)
        ;(targetContribs[`interview/${slug}.md`] ||= []).push({ type: 'page', text })
      }
    }
  }

  // 写入文件
  const generated = []
  for (const [target, contribs] of Object.entries(targetContribs)) {
    let final
    if (contribs.length === 1) {
      final = contribs[0].text.trim() + '\n'
    } else {
      final = assemble(target, contribs)
    }
    const outPath = join(dir, target)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, final)
    generated.push(`${lang}: ${target}`)
  }

  return { warnings, skipped, generated }
}

// 复制 study_guide.png（防御性，避免资源缺失）
const studyGuideSrc = join(PRIMER, 'resources', 'study_guide.png')
if (existsSync(studyGuideSrc)) {
  mkdirSync(join(DOCS, 'public', 'images'), { recursive: true })
  copyFileSync(studyGuideSrc, join(DOCS, 'public', 'images', 'study_guide.png'))
}

console.log('==== 中文拆分 ====')
const zh = runSplit('zh', 'README-zh-Hans.md', zhMap, zhInterview, zhSpecial)
console.log(`生成 ${zh.generated.length} 个文件, 跳过 ${zh.skipped.length} 个章节`)
if (zh.warnings.length) console.log('警告:\n' + zh.warnings.join('\n'))
console.log('跳过章节: ' + zh.skipped.join(', '))

console.log('\n==== 英文拆分 ====')
const en = runSplit('en', 'README.md', enMap, enInterview, enSpecial)
console.log(`生成 ${en.generated.length} 个文件, 跳过 ${en.skipped.length} 个章节`)
if (en.warnings.length) console.log('警告:\n' + en.warnings.join('\n'))
console.log('跳过章节: ' + en.skipped.join(', '))

console.log('\n拆分完成 ✅')
