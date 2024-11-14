# Elemental Heroes

Elemental Heroes is an interactive web platform designed to enhance learning through engaging games and tools. It integrates educational flashcards generated from user-uploaded PDFs, interactive games built with Phaser.js, and a study assistant chat powered by OpenAI.

## Table of Contents

- [Features](#features)
- [Pitch Video](#pitch-video)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and Running](#installation-and-running)
- [Login Credentials](#login-credentials)

## Features

- **Flashcard Generator**: Upload PDFs and automatically generate flashcards using OpenAI's GPT models.
- **Interactive Games**: Engage with educational games built using Phaser.js, including chemical matching and laboratory simulations.
- **Study Assistant Chat**: Ask questions and receive answers related to the uploaded content via a conversational AI assistant.
- **User Profiles**: Create and manage user profiles with avatars and personal statistics.
- **Responsive Design**: Optimized for various devices with responsive layouts and modern UI elements.

## Pitch Video
[![Video][https://github.com/user-attachments/assets/ca5bffb6-4c51-4ec1-95e2-7c68ddee451e](https://www.youtube.com/watch?v=WEiXky7mL-8)
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

2. **Environment Variables:**

Create a .env file within the frontend directory. Do reach out to us if you need the Supabase URL or Key. This will be provided in the zip file.

```env
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

3. **Install Dependencies**

```bash
npm install
npm run dev
```

Your frontend should be running on localhost! Do note that the frontend is currently making API calls to the deployed backend. If you would like to test the backend on localhost, you need to change the various API calls to localhost. 

**Backend**

1. **Navigate into directory**

```bash
cd flashcard-app
```

2. **Environmental Variables:**

Create a .env file within the backend directory. Do reach out to us if you need the Supabase and OpenAI keys. This will be provided in the zip file

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

## Login Credentials

You can use the following account to test our application, or create your own at the register page.

Username: ```felix@gmail.com```

Password: ```Password1```
