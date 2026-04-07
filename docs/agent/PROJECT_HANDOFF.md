# Project Handoff For AI Agents

## Project Summary

SuveyTool4MBA is a business research workflow tool for DBA / MBA users who have strong business intuition but weak statistical background.

The product should not be treated as a generic statistics dashboard. It is a workflow tool that helps users move from business pain point to research structure, questionnaire design, data QA, model analysis, and executive-facing interpretation.

## Current Product Positioning

The current shipped version is:

`local browser analysis + external AI prompt collaboration`

This means:

- Story-to-model is prompt-based, not direct in-app LLM automation
- Boardroom report is prompt-based, not direct in-app LLM automation
- Raw uploaded business data should remain local in browser whenever possible

Do not rewrite product copy to claim full in-app AI automation unless that functionality is actually implemented.

## Implemented Capabilities

1. Homepage with new-project and example-project entry
2. Story-to-model prompt generation and JSON paste-back workflow
3. Research design editing
4. CSV upload and traffic-light QA
5. PLS-SEM analysis
6. Prompt-based boardroom report assistance
7. GitHub Pages deployment

## Planned But Not Yet Implemented

1. In-app OpenAI-compatible API integration
2. API key settings panel
3. Automatic statistical router
4. Data type sniffer
5. Multi-group analysis
6. Mediation / moderation workflows
7. Team collaboration
8. Native survey collection platform

## Documentation For Agents

Read these first:

- [Development guide](/tmp/SuveyTool4MBA-release/docs/agent/DEVELOPMENT_GUIDE.md)
- [User system spec](/tmp/SuveyTool4MBA-release/docs/user/SYSTEM_FUNCTION_SPEC_V2.md)

## Product Copy Rules

- Say "AI prompt collaboration" for current prompt-based flows
- Do not say "the system fully auto-generates everything" unless it becomes true
- Keep business-friendly language
- Keep roadmap items clearly separated from shipped features
