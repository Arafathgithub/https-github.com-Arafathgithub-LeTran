# COBOL to Java Modernization Assistant

This is an AI-powered chat application designed to help modernize legacy COBOL code into modern Java. It provides a guided, step-by-step process for analyzing, planning, and transforming codebases, making the complex task of modernization more manageable.

## ✨ Features

- **File Upload:** Easily upload one or more COBOL files (`.cbl`, `.cob`) via drag-and-drop or a file browser.
- **AI-Powered Analysis:** The Gemini API analyzes the uploaded COBOL code to provide a high-level summary, identifying key business logic, I/O operations, and external calls.
- **Automated Modernization Plan:** Based on the analysis, the assistant generates a detailed, step-by-step plan for migrating the code to object-oriented Java.
- **Code Transformation:** With a single click, the assistant transforms the COBOL code into functionally equivalent modern Java code, following the generated plan.
- **Interactive Code Explorer:** View both the original COBOL and the newly generated Java files side-by-side in an intuitive file explorer and code viewer.
- **Process Stepper:** A clear visual timeline guides you through the modernization process: Upload → Analyze → Plan → Transform → Done.
- **Conversational AI:** After the transformation, you can ask the AI assistant questions about the modernized code or the process.
- **Responsive UI:** The application is designed with a clean, modern, and responsive user interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Model:** [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This project uses ES modules and imports dependencies from a CDN, so there are no local dependencies to install with `npm` or `yarn` for the provided source code.

3.  **Set up environment variables:**
    This project requires a Google Gemini API key. The application is configured to read this key from `process.env.API_KEY`. You will need to ensure this environment variable is available when serving the application.

    For local development, you can use a tool like [Vite](https://vitejs.dev/) which supports `.env` files out of the box.

    a. Create a `.env.local` file in the root of your project.
    
    b. Add your API key to the file, prefixed with `VITE_` for Vite to expose it to the client:
    ```.env.local
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```

    c. **Important**: The current code in `services/geminiService.ts` uses `process.env.API_KEY`. If you use Vite, you would need to change this line to `import.meta.env.VITE_API_KEY`. The template is provided assuming `process.env.API_KEY` is made available by the serving environment.

4.  **Run the development server:**
    The provided `index.html` can be served by any static file server. For a great development experience with hot-reloading, you can use Vite.

    a. Install Vite:
    ```bash
    npm install -g vite
    ```
    b. Run Vite from the project root:
    ```bash
    vite
    ```

    This will start the development server, typically at `http://localhost:5173`.

## Usage

1.  Open the application in your browser.
2.  Drag and drop your COBOL files onto the upload area or use the "Browse Files" button.
3.  The AI assistant will automatically start the analysis process.
4.  Once analysis is complete, click "Generate Plan" to see the proposed modernization strategy.
5.  Review the plan. When you're ready, click "Transform to Java".
6.  The AI will generate the Java code. You can then browse the new files in the explorer.
7.  Use the chat interface to ask any follow-up questions.
