document.addEventListener("DOMContentLoaded", () => {
         try {
                  // Utility Functions
                  const storage = {
                           get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
                           set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
                           remove: (key) => { try { localStorage.removeItem(key); } catch {} }
                  };
                  const unlockBadge = (badgeContainer) => {
                           if (!badgeContainer || badgeContainer.classList.contains("unlocked")) return;
                           badgeContainer.classList.add("unlocked");
                           badgeContainer.style.display = "block";
                           const badgeImage = badgeContainer.querySelector("img");
                           if (badgeImage) badgeImage.style.display = "block";
                           
                           // Store badge state in localStorage
                           storage.set(badgeContainer.id, "unlocked");
                           
                           // Animation for unlocking badges
                           badgeContainer.animate([{ transform: "scale(0.5)", opacity: 0 }, { transform: "scale(1.2)", opacity: 1 }, { transform: "scale(1)", opacity: 1 }], {duration: 1000, easing: "ease-out"});        
                           
                           // Show toast notification
                           showToast(`${badgeContainer.dataset.badgeName || badgeContainer.querySelector(".badge-title")?.textContent || "Badge"} Unlocked!`);

                           showBadgeModal(badgeContainer);

                           updateBadgeProgress();
                  };
                     
                     const showToast = (message) => {
                           document.querySelector(".toast")?.remove();
                           const toast = document.createElement("div");
                           toast.className = "toast";
                           toast.style.cssText = `
                           position: fixed;
                           bottom: 20px;
                           right: 20px;
                           background: var(--button-bg);
                           color: var(--text-color);
                           padding: 10px 20px;
                           border-radius: 5px;
                           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                           z-index: 1000;
                           opacity: 0;
                           transform: translateY(20px);
                           `;
                           toast.textContent = message;
                           document.body.appendChild(toast);
                           
                           // Animate toast
                           toast.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(20px)" }], {duration: 4000, easing: "ease"});                  
                           // Remove toast after animation
                           setTimeout(() => toast.remove(), 4000);
                     };
                     
                     const updateProgress = (counterElem, exploredCount, totalItems) => {
                           if (!counterElem) return;
                           counterElem.textContent = `Progress: ${exploredCount}/${totalItems}`;
                           const progressBar = counterElem.nextElementSibling?.querySelector(".progress-fill");
                           if (progressBar) {
                                 const percentage = Math.min((exploredCount / totalItems) * 100, 100);
                                 progressBar.style.animation = "none";
                                 progressBar.offsetHeight;
                                 progressBar.style.setProperty("--progress-width", `${percentage}%`);
                                 progressBar.style.animation = "fillProgress 1s ease forwards";
                                 progressBar.setAttribute("role", "progressbar");
                                 progressBar.setAttribute("aria-valuemin", "0");
                                 progressBar.setAttribute("aria-valuemax", "100");
                                 progressBar.setAttribute("aria-valuenow", percentage.toFixed(0));
                                 progressBar.setAttribute("aria-label", "Section progress");
                           }
                     };
                     
                     const resetProgress = (sectionId, itemsClass, badgeId) => {
                           const section = document.getElementById(sectionId);
                           if (!section) return;
                           const items = section.querySelectorAll(itemsClass);
                           items.forEach(item => item.classList.remove("explored"));
                           
                           // Reset progress counters and localStorage
                           storage.set(`${sectionId}-exploredCount`, 0);
                           const progressCounter = section.querySelector(".progress-counter");
                           updateProgress(progressCounter, 0, items.length);

                           const badgeContainer = document.getElementById(badgeId);
                           if (badgeContainer) {
                                    badgeContainer.classList.remove("unlocked");
                                    badgeContainer.style.display = "none";
                           }
                           storage.remove(badgeId);
                           updateBadgeProgress();
                     };
                     
                     // Initialize Gamified Sections
                     const initializeGamifiedSections = () => {
                           const initializedSections = new Set();
                           const sectionsToGamify = [
                                 { id: "about", itemsClass: ".keyword", badgeId: "badge-container-about"},
                                 { id: "hobbies_skills", itemsClass: ".hobbies_skills-item", badgeId: "badge-container-hobbies_skills"},
                                 { id: "experience", itemsClass: ".timeline-item", badgeId: "badge-container-experience"},
                                 { id: "projects", itemsClass: ".project-card", badgeId: "badge-container-projects"},
                                 { id: "achievements-leaderboard", itemsClass: ".achievements-leaderboard-item", badgeId: "badge-container-achievements"},
                                 { id: "certifications", itemsClass: ".milestone", badgeId: "badge-container-certifications"},
                                 { id: "dashboard", itemsClass: ".badge-card", badgeId: "badge-container-dashboard"}, 
                                 { id: "conclusion", itemsClass: ".badge-card", badgeId: "badge-container-conclusion"}
                           ]; 
                           const initializeSection = ({ id, itemsClass, badgeId }) => {
                                    if (initializedSections.has(id)) return;
                                    const section = document.getElementById(id);
                                    if (!section) return;
                                    initializedSections.add(id);
                                    const items = section.querySelectorAll(itemsClass);
                                    const totalItems = items.length;
                                    const state = { exploredCount: parseInt(storage.get(`${id}-exploredCount`)) || 0 };
                                 
                                    // Create or select progress counter
                                    let progressCounter = section.querySelector(".progress-counter");
                                    if (!progressCounter) {
                                             progressCounter = document.createElement("div");
                                             progressCounter.className = "progress-counter";
                                             progressCounter.style.cssText = `
                                             text-align: center;
                                             font-size: 1rem;
                                             color: var(--button-bg);
                                             font-weight: bold;
                                             margin-bottom: 1rem;
                                             `;
                                             
                                             const progressBarContainer = document.createElement("div");
                                             progressBarContainer.className = "progress-bar-container";
                                             progressBarContainer.style.cssText = `
                                             margin: 0 auto;
                                             width: 80%;
                                             height: 15px;
                                             background: var(--progress-bg);
                                             border-radius: 10px;
                                             position: relative;
                                             overflow: hidden;
                                             `;
                                             
                                             const progressBarFill = document.createElement("div");
                                             progressBarFill.className = "progress-fill";
                                             progressBarFill.style.cssText = `
                                             width: 0%;
                                             height: 100%;
                                             background: var(--progress-fill);
                                             transition: width 0.5s ease;
                                             `;
                                       
                                             progressBarContainer.appendChild(progressBarFill);
                                             section.prepend(progressBarContainer);
                                             section.prepend(progressCounter);
                                       
                                             const resetButton = document.createElement("button");
                                             resetButton.textContent = "Reset Progress";
                                             resetButton.className = "reset-button";
                                             resetButton.style.cssText = `
                                             display: block;
                                             margin: 10px auto;
                                             padding: 5px 10px;
                                             font-size: 0.9rem;
                                             background: #dc3545;
                                             color: white;
                                             border: none;
                                             border-radius: 5px;
                                             cursor: pointer;
                                             `;
                                       
                                             resetButton.addEventListener("click", () => resetProgress(id, itemsClass, badgeId));
                                             section.appendChild(resetButton);
                                    }
                                 
                                 // Load unlocked badges from localStorage
                                 const badgeContainer = document.getElementById(badgeId);
                                 if (storage.get(badgeId) === "unlocked") {unlockBadge(badgeContainer);}
                                 
                                 // Delegate click event to section
                                 section.addEventListener("click", (event) => {
                                       const target = event.target.closest(itemsClass);
                                       if (target && !target.classList.contains("explored")) {
                                             target.classList.add("explored");
                                             state.exploredCount = parseInt(storage.get(`${id}-exploredCount`)) || 0;
                                             state.exploredCount++;
                                             updateProgress(progressCounter, state.exploredCount, totalItems);
                                             storage.set(`${id}-exploredCount`, state.exploredCount);
                                             
                                             if (state.exploredCount === totalItems) {unlockBadge(badgeContainer);}
                                       }
                                 });
                                 
                                 // Initial progress display
                                 updateProgress(progressCounter, state.exploredCount, totalItems);
                           };
                           
                           sectionsToGamify.forEach(initializeSection);
                           
                           // Observe dynamically added sections or items
                           const observer = new MutationObserver((mutations) => {
                                 mutations.forEach((mutation) => {
                                          if (mutation.type === "childList") {
                                                   sectionsToGamify.forEach(({ id, itemsClass, badgeId }) => {
                                                            const section = document.getElementById(id);
                                                            if (section && mutation.target.contains(section)) {initializeSection({ id, itemsClass, badgeId });}
                                                   });
                                       }
                                 });
                                 if (initializedSections.size === sectionsToGamify.length) {observer.disconnect();}
                           });
                           const contentRoot = document.getElementById("main-content") || document.body;
                           observer.observe(contentRoot, { childList: true, subtree: true });
                     };
                  function showBadgeModal(badgeContainer) {
                           const modal = document.getElementById("badge-modal");
                           const modalImage = document.getElementById("modal-badge-image");
                           const modalTitle = document.getElementById("modal-badge-title");
                           const modalMessage = document.getElementById("modal-badge-message");
                           const badgeCard = document.querySelector(`.badge-card[data-badge-id="${badgeContainer.id}"]`);

                           const img = badgeCard?.querySelector("img");
                           const h3 = badgeCard?.querySelector("h3");
                           const msgEl = badgeContainer.querySelector(".badge-message");
                           
                           if (!badgeCard || !img || !h3 || !msgEl) return;
                           
                           modalImage.src = img.src;
                           modalTitle.textContent = h3.textContent;
                           modalMessage.textContent = msgEl.textContent;
                           modal.classList.add("show");
                           setTimeout(() => {modal.classList.remove("show");},3000);}
                     
                     // Badge Modal Handling
                     const setupBadgeModal = () => {
                           const badgeCards = document.querySelectorAll(".badge-card");
                           const modal = document.getElementById("badge-modal");
                           const modalImage = document.getElementById("modal-badge-image");
                           const modalTitle = document.getElementById("modal-badge-title");
                           const modalMessage = document.getElementById("modal-badge-message");
                           const closeButton = document.getElementById("modal-close-button");

                           if (!modal || !modalImage || !modalTitle || !modalMessage || !closeButton) {
                                    console.warn("Badge modal: one or more required elements not found.");
                                    return;
                           }
                           
                           badgeCards.forEach(card => {
                                 card.addEventListener("click", () => {
                                       const badgeId = card.dataset.badgeId;
                                       const badgeContainer = document.getElementById(badgeId);
                                       if (badgeContainer && badgeContainer.classList.contains("unlocked")) {
                                                const img = card.querySelector("img");
                                                const h3 = card.querySelector("h3");
                                                const p = card.querySelector("p");
                                                if (img) modalImage.src = img.src;
                                                if (h3) modalTitle.textContent = h3.textContent;
                                                if (p) modalMessage.textContent = p.textContent;
                                                modal.classList.add("show");
                                       } 
                                       else {showToast("Unlock this badge by exploring the section!");}});
                           });
                           
                           closeButton.addEventListener("click", () => {modal.classList.remove("show");});
                           
                           // Close modal on outside click
                           window.addEventListener("click", (event) => {if (event.target === modal) {modal.classList.remove("show");}});};
                  
                  // Update Badge Progress in Dashboard
                  const updateBadgeProgress = () => {
                           const badgeProgressText = document.getElementById("badge-progress-text");
                           const badgeProgressFill = document.getElementById("badge-progress-fill");
                           if (!badgeProgressText || !badgeProgressFill) { 
                                    console.warn("Badge progress: elements not found.");
                                    return;
                           }
                           const badgeSections = [
                                 "badge-container-about",
                                 "badge-container-hobbies_skills",
                                 "badge-container-experience",
                                 "badge-container-resume",
                                 "badge-container-projects",
                                 "badge-container-achievements",
                                 "badge-container-certifications",
                                 "badge-container-dashboard",
                                 "badge-container-conclusion"
                           ];
                           
                           const unlockedCount = badgeSections.reduce((count, id) => {return count + (storage.get(id) === "unlocked" ? 1 : 0);}, 0);
                           
                           badgeProgressText.textContent = `Badges Unlocked: ${unlockedCount}/${badgeSections.length}`;
                           const percentage = (unlockedCount / badgeSections.length) * 100;
                           badgeProgressFill.style.animation = "none";
                           badgeProgressFill.offsetHeight;
                           badgeProgressFill.style.setProperty("--progress-width", `${percentage}%`);
                           badgeProgressFill.style.animation = "fillProgress 1s ease forwards";
                     };
                     
                     // Smooth Scroll for Navigation
                     const setupSmoothScroll = () => {
                           document.querySelectorAll("header .nav-links a").forEach((link) => {
                                 link.addEventListener("click", (event) => {
                                       event.preventDefault();
                                       const href = link.getAttribute("href"); 
                                       if (!href) return;
                                       const targetId = href.substring(1);
                                       const target = document.getElementById(targetId);
                                       if (target) {target.scrollIntoView({ behavior: "smooth" });}
                                 });
                           });
                     };
                     
                     // Tooltip Setup
                     const setupTooltips = () => {
                           const keywords = document.querySelectorAll(".keyword");
                           let popover = document.getElementById("global-popover");
                           if (!popover) {
                                    popover = document.createElement("div");
                                    popover.id = "global-popover";
                                    popover.className = "popover";
                                    popover.style.cssText = `
                                    position: absolute;
                                    background: var(--bg-color);
                                    color: var(--text-color);
                                    padding: 10px;
                                    border-radius: 5px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                                    display: none;
                                    z-index: 1000;
                                    `;
                                    document.body.appendChild(popover);
                           }
                           window.addEventListener("scroll", () => {popover.style.display = "none";}, { passive: true });
                           keywords.forEach((keyword) => {
                                 keyword.addEventListener("mouseenter", (e) => {
                                       popover.textContent = keyword.dataset.tooltip || `More about ${keyword.textContent}`;
                                       popover.style.display = "block";
                                       const pw = popover.offsetWidth || 160;
                                       const ph = popover.offsetHeight || 40;
                                       const left = Math.max(0, Math.min(e.pageX + 10, window.scrollX + window.innerWidth - pw - 10));
                                       const top  = Math.max(0, Math.min(e.pageY + 10, window.scrollY + window.innerHeight - ph - 10));
                                       popover.style.left = `${left}px`;
                                       popover.style.top  = `${top}px`;
                                 });
                                 keyword.addEventListener("mouseleave", () => {
                                       popover.style.display = "none";
                                 });
                                 
                                 // Handle data-action attributes
                                 keyword.addEventListener("click", () => {
                                       const action = keyword.dataset.action;
                                       if (action === "highlight") {
                                             keyword.style.backgroundColor = "var(--button-bg)";
                                             keyword.style.color = "var(--bg-color)";
                                             setTimeout(() => {
                                                   keyword.style.backgroundColor = "";
                                                   keyword.style.color = "";}, 1000);
                                       } 
                                       else if (action === "show-alert") {alert(keyword.dataset.tooltip || `More about ${keyword.textContent}`);} 
                                       else if (action === "open-modal") {showToast(`Modal for ${keyword.textContent} would open here!`);} 
                                       else if (action === "scroll-to") {
                                                const targetId = keyword.dataset.target;
                                                if (!targetId) return;
                                                const target = document.getElementById(targetId);
                                                if (target) {target.scrollIntoView({ behavior: "smooth" });}
                                       }
                                 });
                           });
                     };
                     
                     // Dark Mode Toggle
                     const toggleDarkMode = () => {
                           const toggleButton = document.getElementById("darkModeToggle");
                           const themeIcon = document.getElementById("themeIcon");
                           if (!toggleButton || !themeIcon) {  
                                    console.warn("Dark mode toggle: elements not found.");
                                    return;
                           }
                           const currentTheme = storage.get("theme") || "light";
                           document.documentElement.setAttribute("data-theme", currentTheme);
                           themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
                           
                           toggleButton.addEventListener("click", () => {
                                 const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
                                 document.documentElement.setAttribute("data-theme", newTheme);
                                 storage.set("theme", newTheme);
                                 themeIcon.className = newTheme === "light" ? "fas fa-moon" : "fas fa-sun";
                           });
                     };
                     
                     // Back-to-Top Button
                     const setupBackToTop = () => {
                           const button = document.getElementById("backToTop");
                           if (!button) {
                                    console.warn("Back-to-top button not found.");
                                    return;
                           }
                           let backToTopTicking = false;
                           window.addEventListener("scroll", () => {
                                       if (!backToTopTicking) {
                                                requestAnimationFrame(() => {
                                                         button.style.display = window.scrollY > 300 ? "block" : "none"; 
                                                         backToTopTicking = false;
                                                });
                                                backToTopTicking = true;
                                       }
                           });
                           button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
                              
                     };
                     
                     // Highlight Active Section
                     const highlightActiveSection = () => {
                              const sections = document.querySelectorAll("section");
                              const navLinks = document.querySelectorAll(".nav-links a");
                              const setActiveLink = () => {
                                       let activeSection = null;
                                       sections.forEach((section) => {
                                                const rect = section.getBoundingClientRect();
                                                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                                                         activeSection = section.id;
                                                }
                                       });
                                       navLinks.forEach((link) => {
                                                const href = link.getAttribute("href"); 
                                                if (!href) return;                      
                                                link.classList.toggle("active", href.substring(1) === activeSection);
                                       });
                              };
                              let activeSectionTicking = false;
                              window.addEventListener("scroll", () => {
                                       if (!activeSectionTicking) {
                                                requestAnimationFrame(() => {
                                                         setActiveLink();
                                                         activeSectionTicking = false;
                                                });
                                                activeSectionTicking = true;
                                       }
                              }); 
                              setActiveLink();                                   
                     };
                  
                  // Set Current Year in Footer
                  const setCurrentYear = () => {
                           const el = document.getElementById("current-year");
                           if (!el) {
                                    console.warn("current-year element not found.");
                                    return;
                           }
                           el.textContent = new Date().getFullYear();
                  };
                  
                  // Initialize Resume Section
                  const initializeResumeSection = () => {
                           const section = document.getElementById("resume");
                           if (!section) return;
                           
                           const viewer = section.querySelector("iframe");
                           const badgeContainer = document.getElementById("badge-container-resume");
                           
                           if (!viewer || !badgeContainer) {
                                    console.warn("Resume section: iframe or badge container not found."); 
                                    return;
                           }
                     
                     // Load unlocked badge state
                     const observer = new IntersectionObserver((entries) => {
                              entries.forEach(entry => {
                                       if (entry.isIntersecting && !badgeContainer.classList.contains("unlocked")) {
                                                unlockBadge(badgeContainer);
                                                observer.disconnect();
                                       }
                              });
                     }, { threshold: 0.5 }); 
                           observer.observe(viewer);
               };   
               
               // Initialize All Features
               initializeGamifiedSections();
               setupBadgeModal();
               updateBadgeProgress();
               setupSmoothScroll();
               setupTooltips();
               toggleDarkMode();
               setupBackToTop();
               highlightActiveSection();
               setCurrentYear();
               initializeResumeSection();
         
         } catch (error) {
               console.error("Initialization Error:", error);
   }
   });
