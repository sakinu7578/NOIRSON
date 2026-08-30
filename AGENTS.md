# NOIRSON Web Project — Agent Instructions

## 1. Project Overview

NOIRSON is a LOFI / Chill / Neo Soul music sharing platform.

This project is being developed as a portfolio project for a full-stack engineer course.

The website should focus on music discovery, visual atmosphere, and a clean modern experience.

The project will be developed progressively rather than building the entire system at once.

---

## 2. Current Development Stage

The project is currently starting from zero.

Current priority:

1. HTML
2. CSS
3. JavaScript

Later stages may introduce:

4. React
5. Java
6. Spring Boot
7. MySQL
8. API integration
9. Deployment

Do not introduce later-stage technologies unless explicitly requested.

For example, do not add React, Spring Boot, databases, authentication, payment systems, or unnecessary packages during the initial HTML/CSS stage.

---

## 3. Design Direction

The visual identity should generally follow:

* LOFI
* Chill
* Neo Soul
* Music-focused
* Dark and atmospheric
* Modern
* Minimal but not empty
* Stylish rather than overly corporate
* Comfortable visual hierarchy
* Strong use of imagery and typography

Avoid:

* Generic corporate website styles
* Excessive gradients
* Excessive animations
* Overly complicated layouts
* Generic AI-generated landing page patterns
* Excessive use of cards
* Unnecessary UI elements

The design should feel like a music brand rather than a typical software company website.

---

## 4. Development Principles

Prioritize:

* Simple code
* Clear structure
* Readability
* Maintainability
* Responsive design
* Semantic HTML
* Reusable CSS
* Progressive development

Do not add complexity unless it provides a clear benefit.

When multiple implementation methods are possible, prefer the simplest practical solution.

Do not unnecessarily rewrite existing code.

Before making major structural changes, inspect the existing project first.

---

## 5. Coding Rules

### HTML

Use semantic HTML where appropriate.

Prefer:

* header
* nav
* main
* section
* article
* footer

Avoid creating unnecessary nested div elements.

### CSS

Keep styles organized and readable.

Prefer reusable classes over repeating the same declarations.

Do not introduce a CSS framework unless explicitly requested.

### JavaScript

Keep JavaScript separated from HTML when practical.

Do not introduce unnecessary libraries.

Only add functionality that is required by the current project stage.

### React

React will be introduced later.

Do not convert the project to React unless explicitly requested.

---

## 6. Working With the User

The user is learning full-stack development while building this project.

Therefore:

* Do not hide important implementation details.
* Explain significant changes briefly.
* Prefer understandable solutions over unnecessarily advanced solutions.
* If a solution is unusually complex, explain why.
* Do not assume the user already understands advanced concepts.

When modifying files, report:

1. Which files were changed
2. What was changed
3. Why it was changed
4. Any testing or verification performed

---

## 7. File Management

Keep the project structure organized.

Suggested structure:

NOIRSON_web/
├── AGENTS.md
├── README.md
├── docs/
│   ├── project.md
│   ├── design.md
│   └── progress.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/

Do not create unnecessary folders or files.

---

## 8. Git

The project uses Git and GitHub for version control.

GitHub repository:

NOIRSON_web

GitHub account:

sakinu7578

Before making commits, do not modify Git configuration unless explicitly requested.

Do not perform destructive Git operations such as:

* git reset --hard
* force push
* deleting branches
* rewriting commit history

unless explicitly requested by the user.

Keep commits reasonably focused and descriptive.

---

## 9. Important Rule

Do not attempt to build the entire NOIRSON system in one step.

Build the project incrementally.

When the user asks for a specific feature, modify only what is necessary for that feature unless a larger architectural change is genuinely required.

The goal is a functional, understandable, expandable portfolio project — not maximum technical complexity.
