# Marketing Website Frontend Engineering Constitution

Version 1.0

---

# Purpose

This document defines the engineering standards for the marketing website.

The objective is to keep the application:

- Predictable
- Type-safe
- Easy to understand
- Easy to extend
- Fast
- Maintainable for years
- Consistent for both engineers and AI-assisted development

Whenever implementation speed conflicts with architectural quality, architectural quality takes precedence.

---

# Build

Always make sure that typecheck and lint is clean and at no point you should consider the work as done with outstanding errors or warnings from typecheck or lint commands. 

# Engineering Principles

Every engineering decision should follow this priority order:

1. Correctness
2. Existing Architecture
3. Type Safety
4. Readability
5. Simplicity
6. Performance

Never optimize speculative bottlenecks.

---

# Architectural Philosophy

The application is a collection of independent features built around clear architectural boundaries.

Every layer has one responsibility.

Every responsibility has one owner.

Every piece of state has one source of truth.

Favor maintainability over short-term convenience.

---

# Core Architectural Rules

## Single Responsibility

Each module should have one clear responsibility.

Examples:

- Components render UI.
- Hooks encapsulate reusable stateful logic.
- Services communicate with external APIs.
- Providers expose global capabilities.
- Utilities contain generic helper functions.

Avoid components that mix unrelated responsibilities.

---

## Single Source of Truth

Every piece of state should have one owner.

| State | Owner |
|--------|-------|
| Server data | TanStack Query |
| Form state | React Hook Form |
| Navigation state | URL |
| Shared UI state | Zustand |
| Local UI state | useState |
| Derived values | Computed during render |

Never duplicate state.

---

## Dependency Direction

Dependencies always flow downward.

```
Pages
    ↓
Features
    ↓
Hooks
    ↓
Services
    ↓
External APIs / CMS
```

Lower layers must never depend on higher layers.

---

## Feature Isolation

Features should remain independent.

If functionality is shared, move it into:

- `components/common`
- `lib`
- `shared`

Avoid importing one feature directly into another.

---

## Backend Ownership

The backend or CMS owns content and business rules.

The frontend owns presentation.

Never invent backend behavior.

---

# AI Development Principles

Before writing code:

- Understand the existing architecture.
- Reuse existing patterns whenever possible.
- Avoid duplicate abstractions.
- Ask for clarification when requirements are unclear.
- Write production-quality code from the start.

---

# Development Workflow

Every task follows the same process.

### 1. Understand

- Inspect existing architecture.
- Review related components.
- Understand existing patterns.

### 2. Reuse

Before creating anything new:

- Does it already exist?
- Can an existing component or hook be extended?
- Can composition solve the problem?

### 3. Implement

Follow existing conventions.

Do not introduce:

- New folder structures
- New state management libraries
- New architectural patterns

without approval.

### 4. Validate

Every change should pass:

```bash
npm run typecheck
npm run lint
npm run build
```

---

# Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Server State | TanStack Query |
| Client State | Zustand |
| Forms | React Hook Form |
| Validation | Zod |

---

# Project Structure

```
src/
├── app/
├── components/
│   ├── ui/
│   ├── common/
│   └── layout/
├── features/
├── hooks/
├── lib/
├── providers/
├── services/
├── config/
├── types/
└── styles/
```

Avoid creating new top-level folders without architectural justification.

---

# Directory Responsibilities

## app/

Contains only App Router files.

Keep pages focused on composition rather than business logic.

---

## components/

### ui/

Reusable design system components.

### common/

Reusable application components.

### layout/

Layout components such as:

- Navbar
- Footer
- Hero layout
- Section wrappers

Layout components define structure, not business logic.

---

## features/

Each feature owns:

- Components
- Hooks
- Services
- Schemas
- Types
- Utilities

Example:

```
features/
    pricing/
    blog/
    contact/
    testimonials/
```

---

## hooks/

Reusable hooks shared across features.

---

## services/

External integrations such as:

- CMS
- Analytics
- Email providers
- API wrappers

---

## lib/

Generic helper utilities.

Examples:

- formatDate
- debounce
- slug helpers

Business-specific logic should not live here.

---

## config/

Centralized configuration.

Examples:

- Environment variables
- Feature flags
- Site metadata

Never access `process.env` outside this directory.

---

# React Architecture

## Server Components First

Default to Server Components.

Only use `"use client"` when required for:

- Event handlers
- Browser APIs
- Forms
- useState
- useEffect
- Interactive UI

Keep client boundaries as small as possible.

---

## Component Philosophy

Components render UI.

Avoid placing networking, data transformation, or business workflows inside components.

Aim for focused components under ~200 lines whenever practical.

---

## Hooks

Hooks encapsulate reusable stateful logic.

Only extract a hook when logic is reused or significantly improves readability.

---

## State Management

Use:

- TanStack Query for server data
- React Hook Form for forms
- Zustand for shared UI state
- useState for local state

Never synchronize multiple state systems.

---

## useEffect

Treat `useEffect` as a last resort.

Prefer:

- Derived values
- Event handlers
- Server Components
- React Query
- React Hook Form

---

# Data Fetching

Network requests belong inside services.

Example flow:

```
Component
    ↓
useQuery
    ↓
Service
    ↓
CMS / API
```

Avoid calling `fetch()` directly inside UI components.

---

# Forms

All forms should use:

- React Hook Form
- Zod validation

Submission flow:

```
User Input
    ↓
React Hook Form
    ↓
Zod
    ↓
Service
    ↓
Backend
```

---

# Type Safety

TypeScript is mandatory.

Never use:

- any
- as any
- @ts-ignore
- Non-null assertions to silence errors

Fix the underlying issue instead of bypassing the type system.

---

# Error Handling

Never swallow errors.

Handle expected failures gracefully.

Unexpected failures should surface during development.

Provide meaningful loading, empty, success, and error states for asynchronous operations.

---

# Performance

Optimize only when necessary.

Avoid premature use of:

- useMemo
- useCallback
- Complex caching
- Virtualization

Correctness and readability come first.

---

# Naming Conventions

Use descriptive names.

Good:

- HeroSection
- PricingCard
- ContactForm
- BlogGrid

Avoid vague names like:

- Helper
- Manager
- DataComponent

Use:

- PascalCase for React components
- kebab-case for files
- camelCase for variables and functions

---

# Code Organization

Prefer composition over inheritance.

Extract shared code only after multiple concrete use cases emerge.

Keep utilities framework-agnostic whenever possible.

Favor self-explanatory code over excessive comments.

Comments should explain **why**, not **what**.

---

# AI Operating Rules

Before modifying code:

1. Inspect existing implementation.
2. Reuse existing patterns.
3. Modify the smallest possible surface area.
4. Avoid unrelated refactoring.
5. Preserve architectural consistency.

When delivering changes, include:

- Change Summary
- Files Modified
- Architectural Reasoning
- Potential Risks
- Validation Performed

---

# Definition of Good Code

Good code is:

- Correct
- Readable
- Predictable
- Type-safe
- Testable
- Easy to remove
- Easy to extend

Code should communicate its intent through its structure.

---

# Final Principle

This marketing website is a long-lived production system.

Every change should leave the codebase in a better state than it was found.

Optimize for the engineer maintaining the project two years from now.

When in doubt, choose the solution that preserves architectural consistency, simplicity, and clarity.