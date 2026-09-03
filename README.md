Kaushik Chintalapudi | Portfolio Website

Personal portfolio site showcasing my work and journey across Cloud Infrastructure (Azure), Oracle Fusion Financials, and Applied AI.

🔗 Live site: kaushik20.github.io/kaushik_chintalapudi.github.io

✨ Overview

This isn't a static resume page — it's an interactive, gamified portfolio. Visitors unlock badges as they explore each section, can toggle between light / dark / high-contrast themes, and can even "talk" to an animated avatar that introduces me.

🧩 Features
Gamified exploration — Hovering, clicking, or tabbing through items in About, Hobbies & Skills, Experience, Projects, Achievements, and Certifications marks them "explored." Complete a section to unlock its badge, tracked live with a progress bar.
Badge Gallery & Dashboard — A dedicated section showing all unlockable badges, locked/unlocked state, and overall completion percentage.
Progress portability — Since progress is stored in localStorage (per-device), there's an Export/Import Progress feature that encodes your unlocked state into a shareable code, so you can restore it on another browser/device.
Three-way theme toggle — Light → Dark → High-Contrast, synced with system preference on first load and persisted across visits.
Talking avatar — Click the hero image for a short animated, typewriter-style self-introduction.
Interactive "About Me" keywords — Key terms are clickable/hoverable, triggering tooltips, highlights, modals, or smooth-scrolling to relevant sections.
Embedded resume viewer — Inline PDF preview with a graceful fallback (and direct download link) for mobile browsers that can't render embedded PDFs.
Accessibility-minded — Keyboard activation for role="button" elements, ARIA labels throughout, prefers-color-scheme detection, and focus-triggered exploration (not just clicks).
Fully responsive — Layout adapts across desktop, tablet, and mobile breakpoints.
🛠️ Tech Stack
HTML5 — Semantic structure, schema.org Person/WebSite JSON-LD for SEO
CSS3 — Custom properties (CSS variables) for theming, animations, and a responsive grid/flex layout
Vanilla JavaScript — No frameworks; handles gamification logic, modals, theming, and the avatar interaction
Font Awesome & Google Fonts (Poppins) via CDN
GitHub Pages — Hosting/deployment
📁 Project Structure
├── index.html      # Main page markup, content, and structured data
├── style.css       # Theming (CSS variables), layout, responsive rules, animations
├── script.js       # Gamification engine, badge system, theming, avatar, modals
├── Images/         # Avatar, badge icons, certification logos, project images
└── PDF/            # Resume and certificate PDFs
📌 Sections
Section	What it covers
About	Background and journey into tech
Hobbies & Skills	Guitar, cricket, music + Azure, Power Platform, Oracle Fusion, Python
Experience	Research Internship (MIT-WPU AI Institute), Cloud Internship (PCS Gulf)
Resume	Embedded, downloadable PDF resume
Projects	Smart Health Monitoring (IoT), Hate Speech Detection (NLP)
Achievements	AI Impact Summit, Microsoft AI/Cloud Skills challenges, and more
Certifications	Azure Fundamentals, McKinsey Forward, Yuva AI for All, One Million Prompters
Badge Gallery	Live dashboard of unlocked badges and overall progress
Conclusion	Vision — building an AI-driven tech company in Amaravati, India
🚀 Running Locally

No build step required — it's static HTML/CSS/JS.

bash
git clone https://github.com/kaushik20/kaushik_chintalapudi.github.io.git
cd kaushik_chintalapudi.github.io
# then just open index.html in a browser, or serve it:
python3 -m http.server 8000

Visit http://localhost:8000.

🌐 Deployment

Deployed via GitHub Pages directly from this repository — any push to the main branch updates the live site.

📬 Contact
LinkedIn: kaushik-chintalapudi
GitHub: kaushik20
Email: kaushik20feb@gmail.com

Open to full-time opportunities in Azure Cloud, AI, Oracle Fusion ERP, and Technology Consulting.
