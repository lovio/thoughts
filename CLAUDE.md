# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: Uses `pnpm` as the preferred package manager

| Command | Purpose |
|---------|---------|
| `pnpm dev` or `pnpm start` | Start development server at localhost:4321 |
| `pnpm build` | Full production build (includes Astro check, build, and jampack optimization) |
| `pnpm preview` | Preview production build locally |
| `pnpm format` | Format code with Prettier (astro + tailwindcss plugins) |
| `pnpm format:check` | Check code formatting without changes |
| `pnpm lint` | Run ESLint on codebase |
| `pnpm sync` | Generate TypeScript types for Astro modules |
| `pnpm cz` | Commit with conventional commits via commitizen |

**Quality Assurance**: Project uses Husky hooks with lint-staged for automatic formatting on commit.

## Architecture Overview

**Framework**: Astro v5 static site generator with React components and TailwindCSS styling.

**Key Architectural Components**:

1. **Content Management**: Uses Astro's content collections API with schema validation
   - Blog posts in `src/content/blog/` as Markdown files
   - Type-safe frontmatter validation via `src/content.config.ts`
   - Dynamic OG image generation per post

2. **Rendering Strategy**: Hybrid static/dynamic with optimized builds
   - Static generation for blog posts and pages
   - Dynamic OG image API routes at `/og.png` and `/posts/[slug]/index.png`
   - jampack optimization for production builds

3. **Search System**: Client-side fuzzy search using Fuse.js
   - Search component at `src/components/Search.tsx` (React)
   - Search utilities in `src/utils/` for post filtering and sorting

4. **Styling System**: TailwindCSS with typography plugin
   - Base styles in `src/styles/base.css`
   - Dark/light mode support built-in
   - Responsive design with accessibility focus

## Path Aliases

TypeScript path mapping configured in `tsconfig.json`:
- `@config` → `src/config.ts`
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@utils/*` → `src/utils/*`
- `@content/*` → `src/content/*`

## Content Structure

**Blog Posts**: 
- Located in `src/content/blog/`
- Frontmatter schema enforced via content.config.ts
- Required fields: title, pubDatetime, description
- Optional: modDatetime, featured, draft, tags, ogImage, canonicalURL

**Site Configuration**: 
- Main config in `src/config.ts` (SITE, LOCALE, LOGO_IMAGE, SOCIALS)
- Customizable author, title, description, social links

## Component Architecture

**Layout Hierarchy**:
- `Layout.astro` → Main layout wrapper
- `PostDetails.astro` → Individual blog post layout
- `Posts.astro` → Blog post listing layout

**Utility Functions**:
- `getSortedPosts()` → Sort posts by modification/publication date
- `postFilter()` → Filter draft posts and future-scheduled posts
- `generateOgImages()` → Dynamic OG image generation using Satori + resvg

**React Integration**: 
- React components for interactive elements (Search, Card, Datetime)
- Astro components for static layouts and structure

## Development Notes

- **OG Images**: Generated dynamically using Satori (HTML/CSS to SVG) + resvg (SVG to PNG)
- **Search**: Fuzzy search implementation with configurable Fuse.js options
- **Performance**: Uses jampack for production optimization and bundle analysis
- **Accessibility**: Built with keyboard navigation and screen reader support