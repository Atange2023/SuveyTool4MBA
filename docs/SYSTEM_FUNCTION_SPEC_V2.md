# SuveyTool4MBA V2.0 System Function Specification

## 1. Product Positioning

SuveyTool4MBA V2.0 is a business research workflow tool for management users who need decision validation without learning formal statistics.

The current version is a front-end application that combines:

- local statistical processing
- workflow guidance
- external AI prompt collaboration

## 2. Target Users

- DBA users
- MBA users
- managers with strong business experience and weak statistical background
- users who need structured validation of business intuition

## 3. Current Main Functions

### 3.1 Homepage and Project Entry

- Open an example project
- Create a new project from scratch
- View workflow overview
- View future development roadmap

### 3.2 Story-to-Model Assistant

- Accepts a natural-language business problem description
- Generates a professional system prompt
- Supports copying the prompt to external AI tools
- Accepts pasted JSON response from external AI
- Parses returned title, description, constructs, hypotheses, and indicators
- Applies parsed output to the project

### 3.3 Project Design Workflow

- Edit project title and description
- Edit research question
- Manage constructs
- Manage hypotheses
- Manage indicator items

### 3.4 Survey Publish and Collection Step

- Displays survey state and deadline
- Displays a share link placeholder
- Shows response progress
- Acts as a workflow step before data QA and analysis

### 3.5 Traffic-Light Data QA

- Upload CSV survey data
- Parse numeric rows locally in browser
- Compute Cronbach's Alpha
- Compute AVE
- Show green/red quality cards
- Highlight weak items using item-total correlation
- Allow item removal and recalculation
- Preserve privacy messaging for local-only data processing

### 3.6 PLS-SEM Analysis

- Run local model analysis
- Generate path coefficients
- Generate reliability and validity results
- Generate bootstrap results
- Render charts and analysis views

### 3.7 Boardroom Report Assistance

- Translate statistical output into executive-facing report structure
- Generate AI-ready prompt text for external assistants
- Support copying prompts
- Present business-oriented explanation blocks for P-value, R², and Beta ranking

## 4. Current Technical Characteristics

- Pure front-end deployment
- Compatible with GitHub Pages
- Built with Vite + React + TypeScript
- Tailwind-based styling
- No hardcoded API keys
- No required backend for the current baseline product

## 5. Current Non-Implemented Planned Functions

- In-app OpenAI-compatible API access
- API key settings panel with localStorage persistence
- Automatic algorithm router for T-test / ANOVA / Chi-square
- Data-type sniffer
- Mediation / moderation dedicated analysis module
- Multi-group analysis
- Team collaboration
- Native survey hosting and collection

## 6. User Value

The current version helps users:

- turn business problems into research structure
- avoid raw statistical complexity
- validate managerial intuition with data
- prepare executive-facing interpretation with AI-assisted prompts

## 7. Current Product Boundaries

- The app does not yet provide full in-app LLM automation
- External AI tools are still required for some generation steps
- The publish-and-collect flow is not yet a complete online survey platform
- Some advanced statistical methods remain in roadmap status
