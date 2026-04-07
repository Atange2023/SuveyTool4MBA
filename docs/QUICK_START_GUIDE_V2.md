# SuveyTool4MBA V2.0 Quick Start Guide

## 1. What This Tool Does

SuveyTool4MBA helps you turn a business problem into a structured research workflow, check data quality, run analysis, and prepare decision-facing conclusions.

The current version uses a mixed mode:

- the app handles local workflow and analysis
- external AI tools help with model generation and report writing through prompts

## 2. Recommended First-Time Path

1. Open the homepage
2. Click `新建我的项目`
3. Enter your business pain point in the `AI 建模助手`
4. Copy the generated prompt
5. Paste it into an AI assistant such as ChatGPT, DeepSeek, or Tongyi
6. Copy the returned JSON back into the app
7. Apply the parsed result to your project
8. Review and edit constructs, hypotheses, and indicator items
9. Prepare or import survey data
10. Run `数据体检`
11. Fix weak items if needed
12. Continue to `数据分析`
13. In the report step, copy the boardroom prompt into an external AI assistant if you need executive-style narrative output

## 3. Example User Scenario

You might start with a problem like:

`Why is our new CRM system adoption so low in the sales team?`

The system will help you turn that problem into:

- research variables
- hypotheses
- questionnaire items
- data quality diagnostics
- model-based decision evidence

## 4. Data Privacy

In the current architecture:

- raw uploaded business data stays in your browser
- only prompt text that you choose to copy is sent to external AI tools

## 5. What To Expect From The Current Version

The current version already supports:

- project creation from scratch
- example project exploration
- AI prompt generation for research setup
- data quality checking with traffic-light feedback
- local statistical analysis
- AI prompt generation for executive report writing

The current version does not yet fully support:

- direct built-in LLM API calls
- complete in-app survey collection
- advanced automated statistical routing

## 6. Best Practice Tips

- Start with a clear business problem, not a technical statistical question
- Keep construct names simple and business-friendly
- Review AI-generated JSON before applying it
- Upload clean CSV files with numeric values only
- Use the data QA step before trusting analysis output
- Treat boardroom report output as an AI-assisted draft that still needs managerial judgment
