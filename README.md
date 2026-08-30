# 🌐 Kaushik Chintalapudi — Personal Portfolio

Welcome to my personal portfolio website! 🚀

This repository contains the source code for my personal portfolio, designed to showcase my professional journey, technical skills, projects, experience, achievements, certifications, and interests.

The portfolio is built as a lightweight, responsive web application using **HTML, CSS, and JavaScript**, with a strong focus on interactivity, accessibility, personalization, and an engaging user experience.

---

## 🔗 Live Portfolio

🌐 **Visit my portfolio:**  
https://kaushik20.github.io/kaushik_chintalapudi.20.github.io/

---

## 👨‍💻 About Me

I am a Computer Science Engineering graduate with experience in **Microsoft Azure cloud infrastructure**, **Microsoft Power Platform**, and **Oracle Fusion Financials**, while continuously developing my skills in **Python and Artificial Intelligence**.

My professional journey has taken me from cloud infrastructure and cloud governance toward the intersection of **Cloud Computing, AI, automation, and emerging technologies**.

I am particularly interested in building practical technology solutions that combine cloud platforms with AI and automation.

---

## ✨ Portfolio Highlights

The website includes several sections designed to provide a comprehensive view of my professional and personal journey:

- 👋 Interactive Hero Section
- 🧑‍💻 About Me
- 🎸 Hobbies & Skills
- 💼 Professional Experience
- 📄 Resume Viewer
- 🚀 Projects
- 🏆 Achievements & Leaderboard
- 📜 Certifications
- 🎖️ Badge Gallery
- 💡 Conclusion / Future Goals
- 🔗 Professional & Social Links

---

## 🎮 Interactive & Gamified Experience

One of the main features of this portfolio is its **gamified exploration system**.

Instead of simply scrolling through static information, visitors can interact with different sections of the website and unlock badges.

### 🏅 Badge System

Several sections contain interactive items that can be explored.

As visitors explore the content:

- Progress is tracked for each section
- Explored items are visually marked
- Progress bars show completion
- Completing a section unlocks a badge
- Badge unlocks are saved using browser `localStorage`
- Unlocking a badge triggers an animated celebration
- A badge modal displays the unlocked achievement

Gamified sections include:

- About
- Hobbies & Skills
- Experience
- Projects
- Achievements
- Certifications

The portfolio also includes standalone badges associated with areas such as the Resume, Conclusion, and Badge Gallery.

---

## 🌓 Theme Support

The portfolio supports multiple visual themes:

- 🌙 Dark Theme
- ☀️ Light Theme
- ♿ High-Contrast Theme

The selected theme is stored locally so that the user's preference can persist between visits.

The website also detects the user's system color preference when no saved theme is available.

---

## ♿ Accessibility

Accessibility was considered throughout the development of the website.

Some accessibility-focused features include:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard-accessible interactive elements
- Keyboard activation for custom interactive components
- Focus indicators
- Accessible progress bars
- `aria-live` regions for dynamic content
- Alternative text for images
- Modal accessibility
- High-contrast theme
- Reduced reliance on mouse-only interactions

The goal is to make the portfolio usable by as many visitors as possible.

---

## 🤖 Interactive Avatar

The hero section contains an interactive avatar.

Visitors can interact with the avatar to trigger an introduction experience featuring:

- Animated avatar feedback
- Speech/message display
- Typing-style text animation
- Interactive visual effects

This was designed to make the introduction more engaging than a traditional static portfolio hero section.

---

## 🛠️ Technologies Used

### Frontend

- **HTML5**
- **CSS3**
- **JavaScript**
- **Font Awesome**
- **Google Fonts — Poppins**

### Browser APIs & Web Technologies

- `localStorage`
- Web Animations API
- `MutationObserver`
- DOM APIs
- Browser Speech / interaction APIs where supported

### Hosting & Version Control

- **Git**
- **GitHub**
- **GitHub Pages**

---

## 📁 Project Structure

```text
kaushik_chintalapudi.20.github.io/
│
├── .github/
│   └── workflows/
│       └── GitHub Pages workflow configuration
│
├── Images/
│   └── Portfolio images, avatars, logos, badges, and other visual assets
│
├── PDF/
│   └── Resume and other PDF documents
│
├── index.html
│   └── Main portfolio page and page structure
│
├── style.css
│   └── Styling, themes, responsive layouts, animations, and visual effects
│
├── script.js
│   └── Interactivity, gamification, progress tracking, badges, modals,
│       theme handling, accessibility interactions, and other functionality
│
└── README.md
    └── Project documentation
