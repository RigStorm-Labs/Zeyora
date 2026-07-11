# Contributing to Zeyora

Thank you for your interest in contributing to Zeyora! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. Search the issues to see if the bug has already been reported
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Search existing issues for similar suggestions
2. Create a new issue with:
   - Clear title describing the feature
   - Detailed description of the feature
   - Use cases and benefits
   - Any relevant mockups or examples

### Pull Requests

1. **Fork the repository** and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Follow the coding standards:**
   - Use TypeScript for all new code
   - Run ESLint before committing
   - Write meaningful commit messages

3. **Commit your changes:**
   ```bash
   git commit -m "Add: brief description of changes"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** with a clear description of your changes

## Development Setup

### Prerequisites
- Node.js 20+
- npm 9+ or pnpm
- Docker Desktop

### Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment files: `cp packages/api/.env.example packages/api/.env`
4. Start databases: `docker-compose up -d postgres mongo redis`
5. Run migrations: `cd packages/api && npx prisma migrate dev`

## Coding Standards

### TypeScript
- Enable strict mode
- Use interfaces for object types
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types that are used across packages

### React/React Native
- Use functional components with hooks
- Follow the component naming convention (PascalCase)
- Extract reusable logic into custom hooks
- Keep components small and focused

### API Design
- Use RESTful conventions
- Return consistent response format
- Include proper error handling
- Document endpoints with JSDoc comments

### Testing
- Write tests for business logic
- Aim for meaningful test coverage
- Use descriptive test names

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for making Zeyora better! 🚀
