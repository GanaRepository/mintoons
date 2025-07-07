# Story Weaver Platform

## Overview

Story Weaver is an innovative platform designed to empower children to write stories with the assistance of AI. The platform focuses on enhancing interactivity and aims to boost critical thinking skills in kids.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/Mintoons-platform.git
   cd Mintoons-platform
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root of the project and add the necessary environment variables. You can use `.env.example` as a template if it exists.

   ```bash
   cp .env.example .env.local
   ```

### Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `dev`: Runs the application in development mode.
- `build`: Creates a production build of the application.
- `start`: Starts the production server.
- `lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `format`: Formats the code using Prettier.
- `type-check`: Runs the TypeScript compiler to check for type errors.

## Contributing

Contributions are welcome! To ensure code quality and consistency, please follow these guidelines:

- **Branching:** Create a new branch for each feature or bug fix.
- **Code Style:** Adhere to the existing code style and conventions.
- **Linting and Formatting:** Before committing, run the linter and formatter to catch any issues:
  ```bash
  npm run lint
  npm run format
  ```
- **Type Checking:** Ensure that your code passes the TypeScript type check:
  ```bash
  npm run type-check
  ```
- **Pull Requests:** Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.
