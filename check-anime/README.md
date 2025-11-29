# ✨ Cek Doksli Animek

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

> A web application designed to track the source of anime scenes from screenshots. Users can upload images (or simply paste them from the clipboard), and the application will identify the anime, episode, and precise timestamp of the scene.

## ✨ Key Features

*   **Advanced Anime Scene Search:** Accurately identifies the anime, episode, and precise timestamp from uploaded or pasted screenshots using the `trace.moe` API.
*   **Diverse Input Methods:** Offers multiple ways for users to provide images, including standard file uploads, intuitive drag-and-drop functionality, and direct pasting from the clipboard.
*   **Comprehensive Interactive Results:** Presents matching scenes with similarity percentages, thumbnails, episode information, and the ability to play video previews of identified scenes.
*   **Rich Anime Metadata Retrieval:** Integrates with `anilist.co` (via GraphQL) to fetch and display detailed anime information such as title, description, genre, and studio for identified series.
*   **User-Friendly Interface:** Provides dedicated screens for uploading images and displaying search results, enhanced with loaders for a smooth user experience.
*   **API Integration for Data Handling:** Utilizes `tmpfiles.org` for temporary image hosting and integrates with `trace.moe` and `anilist.co` APIs for core search and data enrichment.
*   **Type-Safe Development:** Leverages TypeScript for robust, type-checked code, improving maintainability and reducing runtime errors.

## 🛠️ Technology Stack

| Category            | Technology             | Notes                                                              |
| :------------------ | :--------------------- | :----------------------------------------------------------------- |
| **Languages**       | TypeScript             | Primary language for building robust and type-safe applications.     |
| **Frontend Framework** | React                  | Leading library for declarative and component-based UI development.  |
| **Build Tool**      | Vite                   | Next-generation frontend tooling, providing lightning-fast development experience. |
| **Styling**         | Tailwind CSS           | A utility-first CSS framework for rapidly building custom designs.  |
|                     | Font Awesome           | Icon toolkit for scalable vector graphics.                         |
| **API Services**    | `trace.moe`            | Core API for reverse image search to identify anime scenes.        |
|                     | `anilist.co` (GraphQL) | Utilized for fetching detailed metadata of anime series.           |
|                     | `tmpfiles.org`         | Provides temporary image hosting for user uploads.                 |
| **Package Manager** | NPM                    | Manages project dependencies and scripts.                          |

## 🏛️ Architecture Overview

This project is structured as a **Single Page Application (SPA)**, built primarily with React and TypeScript. The frontend communicates with external APIs to perform anime scene identification and retrieve detailed metadata, providing a dynamic and responsive user experience without full page reloads.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lannnnnzzzzzzzzzzz/cek-doksli-animek.git
    cd cek-doksli-animek
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will now be running on `http://localhost:3000`.

## 📂 File Structure

```
/
├── App.tsx
├── README.md
├── components
│   ├── Loader.tsx
│   ├── ResultDetail.tsx
│   ├── ResultItem.tsx
│   ├── ResultsScreen.tsx
│   └── UploadScreen.tsx
├── index.html
├── index.tsx
├── metadata.json
├── package-lock.json
├── package.json
├── services
│   └── api.ts
├── tsconfig.json
├── types.ts
└── vite.config.ts
```

*   `/`: Contains the main entry points (`index.html`, `index.tsx`), core application logic (`App.tsx`), and project configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`).
*   `components/`: Houses all reusable React components, organized by their function (e.g., `Loader` for loading states, `ResultItem` for individual search results, `UploadScreen` for image input).
*   `services/`: Dedicated to handling external API interactions, such as `api.ts` for communicating with various backend services.
*   `types.ts`: Defines custom TypeScript types and interfaces for enhanced type safety across the application.
