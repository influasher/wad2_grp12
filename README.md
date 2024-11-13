# Elemental Heroes

Elemental Heroes is an interactive web platform designed to enhance learning through engaging games and tools. It integrates educational flashcards generated from user-uploaded PDFs, interactive games built with Phaser.js, and a study assistant chat powered by OpenAI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and Running](#installation-and-running)

## Features

- **Flashcard Generator**: Upload PDFs and automatically generate flashcards using OpenAI's GPT models.
- **Interactive Games**: Engage with educational games built using Phaser.js, including chemical matching and laboratory simulations.
- **Study Assistant Chat**: Ask questions and receive answers related to the uploaded content via a conversational AI assistant.
- **User Profiles**: Create and manage user profiles with avatars and personal statistics.
- **Responsive Design**: Optimized for various devices with responsive layouts and modern UI elements.

## Tech Stack

- **Frontend**:
  - Vue.js 3
  - Nuxt.js
  - Phaser.js
  - Bootstrap 5
- **Backend**:
  - Python Flask
  - OpenAI API
  - Supabase (for auth, storage and database)
- **Other Dependencies**:
  - Axios
  - PyPDF2 (for PDF text extraction)
  - dotenv (environment variable management)
  - uuid (unique ID generation)

## Prerequisites

- **Node.js** (v14.x or newer)
- **npm** or **yarn** package manager
- **Python** (3.8 or newer)
- **pip** package manager
- **Supabase Account** (with project URL and API key)
- **OpenAI API Key**

## Installation and Running

**Frontend**

1. **Clone the Repository:**

```bash
git clone https://github.com/influasher/wad2_grp12
cd elemental-heroes
```

2. **Environmental Variables:**

Do reach out to use if you need the Supabase URL or Key

```
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

3. **Install Dependencies**

```bash
npm install
npm run dev
```

Your frontend should be running on localhost!

**Backend**

1. **Navigate into directory**

```bash
cd flashcard-app
```

2. **Environmental Variables:**

Do reach out to use if you need the Supabase URL or Key

```env
OPENAI_API_KEY=<your-openai-api-key>
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

3. **Set up virtual environment**

```bash
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
```

3. **Install Dependencies**

```bash
pip install -r requirements.txt
```

4. **Run the Flask server**

```bash
python app.py
```

Your backend should be running on localhost!
