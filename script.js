<script>
      document.addEventListener("DOMContentLoaded", () => {
            try {
                  // Utility Functions
                  const unlockBadge = (badgeContainer) => {
                        if (!badgeContainer || badgeContainer.classList.contains("unlocked")) return;
                        badgeContainer.classList.add("unlocked");
                        badgeContainer.style.display = "block";
                        const badgeImage = badgeContainer.querySelector("img");
                        if (badgeImage) badgeImage.style.display = "block";
                        
                        // Store badge state in localStorage
                        localStorage.setItem(badgeContainer.id, "unlocked");
                        
                        // Animation for unlocking badges
                        badgeContainer.animate([{ transform: "scale(0.5)", opacity: 0 }, { transform: "scale(1.2)", opacity: 1 }, { transform: "scale(1)", opacity: 1 }], {duration: 1000, easing: "ease-out"});        
                        
                        // Show toast notification
                        showToast(`${badgeContainer.dataset.badgeName || badgeContainer.querySelector(".badge-title")?.textContent || "Badge"} Unlocked!`);
                  };
                  
                  const showToast = (message) => {
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
                              progressBar.style.width = `${percentage}%`;
                              progressBar.setAttribute("aria-label", `Progress: ${percentage}%`);
                        }
                  };
                  
                  const resetProgress = (sectionId, itemsClass, badgeId) => {
                        const section = document.getElementById(sectionId);
                        if (!section) return;
                        const items = section.querySelectorAll(itemsClass);
                        items.forEach(item => item.classList.remove("explored"));
                        
                        // Reset progress counters and localStorage
                        localStorage.setItem(`${sectionId}-exploredCount`, 0);
                        const progressCounter = section.querySelector(".progress-counter");
                        updateProgress(progressCounter, 0, items.length);
                        
                        // Reset badges
                        const badgeContainer = document.getElementById(badgeId);
                        if (badgeContainer) {
                              badgeContainer.classList.remove("unlocked");
                              badgeContainer.style.display = "none";
                              localStorage.removeItem(badgeId);
                        }
                  };
                  
                  // Initialize Gamified Sections
                  const initializeGamifiedSections = () => {
                        const sectionsToGamify = [
                              { id: "about", itemsClass: ".keyword", badgeId: "badge-container-about" },
                              { id: "hobbies_skills", itemsClass: ".hobbies_skills-item", badgeId: "badge-container-hobbies_skills" },
                              { id: "experience", itemsClass: ".timeline-item", badgeId: "badge-container-experience" },
                              { id: "projects", itemsClass: ".project-card", badgeId: "badge-container-projects" },
                              { id: "achievements-leaderboard", itemsClass: ".achievements-leaderboard-item", badgeId: "badge-container-achievements" },
                              { id: "certifications", itemsClass: ".milestone", badgeId: "badge-container-certifications" },
                              { id: "dashboard", itemsClass: ".badge-card", badgeId: "badge-container-dashboard" }, 
                              { id: "conclusion", itemsClass: ".badge-card", badgeId: "badge-container-conclusion"}
                        ]; 
                        const initializeSection = ({ id, itemsClass, badgeId }) => {
                              const section = document.getElementById(id);
                              if (!section) return;
                              
                              const items = section.querySelectorAll(itemsClass);
                              const totalItems = items.length;
                              let exploredCount = parseInt(localStorage.getItem(`${id}-exploredCount`)) || 0;
                              
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
                              if (localStorage.getItem(badgeId) === "unlocked") {
                                    unlockBadge(badgeContainer);
                              }
                              
                              // Delegate click event to section
                              section.addEventListener("click", (event) => {
                                    const target = event.target.closest(itemsClass);
                                    if (target && !target.classList.contains("explored")) {
                                          target.classList.add("explored");
                                          exploredCount++;
                                          localStorage.setItem(`${id}-exploredCount`, exploredCount);
                                          updateProgress(progressCounter, exploredCount, totalItems);
                                          
                                          if (exploredCount === totalItems) {
                                                unlockBadge(badgeContainer);
                                          }
                                    }
                              });
                              
                              // Initial progress display
                              updateProgress(progressCounter, exploredCount, totalItems);
                        };
                        
                        sectionsToGamify.forEach(initializeSection);
                        
                        // Observe dynamically added sections or items
                        const observer = new MutationObserver((mutations) => {
                              mutations.forEach((mutation) => {
                                    if (mutation.type === "childList") {
                                          sectionsToGamify.forEach(({ id, itemsClass, badgeId }) => {
                                                const section = document.getElementById(id);
                                                if (section && mutation.target.contains(section)) {
                                                      initializeSection({ id, itemsClass, badgeId });
                                                }
                                          });
                                    }
                              });
                        });
                        
                        observer.observe(document.body, { childList: true, subtree: true });
                  };
                  
                  // Badge Modal Handling
                  const setupBadgeModal = () => {
                        const badgeCards = document.querySelectorAll(".badge-card");
                        const modal = document.getElementById("badge-modal");
                        const modalImage = document.getElementById("modal-badge-image");
                        const modalTitle = document.getElementById("modal-badge-title");
                        const modalMessage = document.getElementById("modal-badge-message");
                        const closeButton = document.getElementById("modal-close-button");
                        
                        badgeCards.forEach(card => {
                              card.addEventListener("click", () => {
                                    const badgeId = card.dataset.badgeId;
                                    const badgeContainer = document.getElementById(badgeId);
                                    if (badgeContainer && badgeContainer.classList.contains("unlocked")) {
                                          modalImage.src = card.querySelector("img").src;
                                          modalTitle.textContent = card.querySelector("h3").textContent;
                                          modalMessage.textContent = card.querySelector("p").textContent;
                                          modal.classList.add("show");
                                    } else {
                                          showToast("Unlock this badge by exploring the section!");
                                    }
                              });
                        });
                        
                        closeButton.addEventListener("click", () => {
                              modal.classList.remove("show");
                        });
                        
                        // Close modal on outside click
                        window.addEventListener("click", (event) => {
                              if (event.target === modal) {
                                    modal.classList.remove("show");
                              }
                        });
                  };
                  
                  // Update Badge Progress in Dashboard
                  const updateBadgeProgress = () => {
                        const badgeProgressText = document.getElementById("badge-progress-text");
                        const badgeProgressFill = document.getElementById("badge-progress-fill");
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
                        
                        const unlockedCount = badgeSections.reduce((count, id) => {
                              return count + (localStorage.getItem(id) === "unlocked" ? 1 : 0);
                        }, 0);
                        
                        badgeProgressText.textContent = `Badges Unlocked: ${unlockedCount}/${badgeSections.length}`;
                        const percentage = (unlockedCount / badgeSections.length) * 100;
                        badgeProgressFill.style.width = `${percentage}%`;
                  };
                  
                  // Smooth Scroll for Navigation
                  const setupSmoothScroll = () => {
                        document.querySelectorAll("header .nav-links a").forEach((link) => {
                              link.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    const targetId = link.getAttribute("href").substring(1);
                                    const target = document.getElementById(targetId);
                                    if (target) {
                                          target.scrollIntoView({ behavior: "smooth" });
                                    }
                              });
                        });
                  };
                  
                  // Tooltip Setup
                  const setupTooltips = () => {
                        const keywords = document.querySelectorAll(".keyword");
                        const popover = document.createElement("div");
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
                        keywords.forEach((keyword) => {
                              keyword.addEventListener("mouseenter", (e) => {
                                    popover.textContent = keyword.dataset.tooltip || `More about ${keyword.textContent}`;
                                    popover.style.display = "block";
                                    popover.style.top = `${e.pageY + 10}px`;
                                    popover.style.left = `${e.pageX + 10}px`;
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
                                    } else if (action === "show-alert") {
                                          alert(keyword.dataset.tooltip || `More about ${keyword.textContent}`);
                                    } else if (action === "open-modal") {
                                          showToast(`Modal for ${keyword.textContent} would open here!`);
                                    } else if (action === "scroll-to") {
                                          const targetId = keyword.getAttribute("href").substring(1);
                                          const target = document.getElementById(targetId);
                                          if (target) {
                                                target.scrollIntoView({ behavior: "smooth" });
                                          }
                                    }
                              });
                        });
                  };
                  
                  // Dark Mode Toggle
                  const toggleDarkMode = () => {
                        const toggleButton = document.getElementById("darkModeToggle");
                        const themeIcon = document.getElementById("themeIcon");
                        const currentTheme = localStorage.getItem("theme") || "light";
                        document.documentElement.setAttribute("data-theme", currentTheme);
                        themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
                        
                        toggleButton.addEventListener("click", () => {
                              const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
                              document.documentElement.setAttribute("data-theme", newTheme);
                              localStorage.setItem("theme", newTheme);
                              themeIcon.className = newTheme === "light" ? "fas fa-moon" : "fas fa-sun";
                        });
                  };
                  
                  // Back-to-Top Button
                  const setupBackToTop = () => {
                        const button = document.getElementById("backToTop");
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
                              
                              navLinks.forEach((link) =>
                                    link.classList.toggle("active", link.getAttribute("href").substring(1) === activeSection);
                        });
                  };
                  
                  window.addEventListener("scroll", setActiveLink);
                  setActiveLink();
            };
            
            // Set Current Year in Footer
            const setCurrentYear = () => {
                  document.getElementById("current-year").textContent = new Date().getFullYear();
            };
            // Initialize Resume Section
            const initializeResumeSection = () => {
                  const section = document.getElementById("resume");
                  if (!section) return;
                  
                  const viewer = section.querySelector("iframe");
                  const badgeContainer = document.getElementById("badge-container-resume");
                  
                  // Load unlocked badge state
                  if (localStorage.getItem("badge-container-resume") === "unlocked") {
                        badgeContainer.classList.add("unlocked");
                        badgeContainer.style.display = "block";
                  }
                  
                  // Unlock badge on interaction
                  viewer.addEventListener("click", () => {
                        if (!badgeContainer.classList.contains("unlocked")) {
                              unlockBadge(badgeContainer);
                        }
                  });
                  
                  // Keyboard support
                  viewer.addEventListener("keydown", (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              viewer.click();
                        }
                  });
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
</script>
