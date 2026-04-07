# SuveyTool4MBA

SuveyTool4MBA 是一个面向 DBA / MBA 用户的商业决策验证工作流工具。它帮助用户把业务痛点转化为结构化研究问题，完成问卷设计、数据体检、统计分析，并借助 AI 提示词协作生成更适合管理层理解的输出。

- Live site: https://atange2023.github.io/SuveyTool4MBA/
- GitHub Pages deploys from `main` via `.github/workflows/deploy-pages.yml`
- Stack: Vite + React + TypeScript + Tailwind CSS

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-qxs37xqd)

## 项目定位

SuveyTool4MBA V2.0 is currently positioned as:

`local browser analysis + external AI prompt collaboration`

This means:

- Raw business data stays in the browser
- Story-to-model and boardroom report flows currently use prompt generation and copy/paste with external AI tools
- Direct in-app LLM API automation is planned, but not yet implemented

## 文档导航

仓库文档分为两类：

### 1. 给人类用户与项目负责人看的文档

位于 [`docs/user/`](/tmp/SuveyTool4MBA-release/docs/user)

- [系统说明报告（打印版）](/tmp/SuveyTool4MBA-release/docs/user/SYSTEM_REPORT_V2.md)
  适合打印、汇报或一次性完整阅读，整合了系统概述、功能说明、使用流程和当前版本边界。
- [系统功能说明书](/tmp/SuveyTool4MBA-release/docs/user/SYSTEM_FUNCTION_SPEC_V2.md)
  介绍当前版本已经实现了什么、适合谁使用、当前能力边界是什么。
- [快速上手指南](/tmp/SuveyTool4MBA-release/docs/user/QUICK_START_GUIDE_V2.md)
  介绍第一次使用系统时的推荐路径，适合新用户快速体验。

### 2. 给继续接手开发的 AI agent / 开发协作方看的文档

位于 [`docs/agent/`](/tmp/SuveyTool4MBA-release/docs/agent)

- [项目交接说明](/tmp/SuveyTool4MBA-release/docs/agent/PROJECT_HANDOFF.md)
  解释项目当前真实状态、哪些功能已实现、哪些仍是规划中，避免后续 agent 误判产品定位。
- [开发协作规则](/tmp/SuveyTool4MBA-release/docs/agent/DEVELOPMENT_GUIDE.md)
  说明后续开发时必须遵守的约束，包括 GitHub Pages 兼容性、纯前端优先、不要误写产品文案、不要破坏部署配置等。

### 3. 文档总索引

- [文档目录说明](/tmp/SuveyTool4MBA-release/docs/README.md)

## 当前版本说明

当前版本更准确的产品定义是：

- 浏览器本地分析
- 外部 AI 提示词协作

这意味着当前系统已经支持：

- 新建项目 / 查看示例项目
- 故事转模型提示词工作流
- 研究设计与问卷编辑
- CSV 数据导入
- 红绿灯数据体检
- PLS-SEM 分析
- 董事会报告提示词生成

但当前系统尚未内建：

- 站内 OpenAI / DeepSeek API 自动调用
- 完整在线问卷收集系统
- 自动统计算法路由
- 团队协作能力

## 使用建议

如果你是：

- 用户：先看“系统说明报告（打印版）”或“快速上手指南”
- 产品负责人：先看“系统说明报告（打印版）”
- 新的 Bolt / AI agent / 开发接手方：先看“项目交接说明”与“开发协作规则”
