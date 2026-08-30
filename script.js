document.addEventListener("DOMContentLoaded", () => {
         try {
                  // Utility Functions
                  const storage = {
                           get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
                           set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
                           remove: (key) => { try { localStorage.removeItem(key); } catch {} }
                  };
                  
                  const getItemId = (item, index) => item.dataset.id || item.textContent.trim().slice(0, 40) || `idx-${index}`;
                  const safeAnimate = (element, keyframes, options) => {
                           if (!element || typeof element.animate !== "function") return null;
                           try {return element.animate(keyframes, options);} 
                           catch (error) {
                                    console.warn("Animation skipped:", error);
                                    return null;
                           }
                  };
                  const initializedElements = new WeakSet();
                  const sectionsToGamify = [
                           { id: "about", itemsClass: ".keyword", badgeId: "badge-container-about"},
                           { id: "hobbies_skills", itemsClass: ".hobbies_skills-item", badgeId: "badge-container-hobbies_skills"},
                           { id: "experience", itemsClass: ".timeline-item", badgeId: "badge-container-experience"},
                           { id: "projects", itemsClass: ".project-card", badgeId: "badge-container-projects"},
                           { id: "achievements-leaderboard", itemsClass: ".achievements-leaderboard-item", badgeId: "badge-container-achievements"},
                           { id: "certifications", itemsClass: ".milestone", badgeId: "badge-container-certifications"}
                  ];
                  const standaloneBadgeIds = ["badge-container-resume", "badge-container-conclusion", "badge-container-dashboard"];
                  const badgeSections = [...sectionsToGamify.map(s => s.badgeId), ...standaloneBadgeIds];
                  let modalAutoCloseTimer = null;
                  let dashboardMissingWarned = false;
                  const unlockBadge = (badgeContainer) => {
                           if (!badgeContainer || badgeContainer.classList.contains("unlocked")) return;
                           badgeContainer.classList.add("unlocked");
                           badgeContainer.style.display = "block";
                           const badgeImage = badgeContainer.querySelector("img");
                           if (badgeImage) badgeImage.style.display = "block";
                           
                           // Store badge state in localStorage
                           storage.set(badgeContainer.id, "unlocked");
                           
                           // Animation for unlocking badges
                           safeAnimate(badgeContainer, [{ transform: "scale(0.5)", opacity: 0 }, { transform: "scale(1.2)", opacity: 1 }, { transform: "scale(1)", opacity: 1 }], {duration: 1000, easing: "ease-out"});

                           const card = document.querySelector(`.badge-card[data-badge-id="${badgeContainer.id}"]`);
                           const celebrationMsg = badgeContainer.querySelector(".badge-message")?.textContent;
                           const badgeName = badgeContainer.dataset.badgeName;
                           openBadgeModal(card, celebrationMsg, badgeName);
                           clearTimeout(modalAutoCloseTimer); 
                           modalAutoCloseTimer = setTimeout(() => {document.getElementById("badge-modal")?.classList.remove("show");}, 4000);

                           updateBadgeProgress();
                  };
                  
                  const showToast = (message) => {
                           document.querySelector(".toast")?.remove();
                           const toast = document.createElement("div");
                           toast.className = "toast";
                           toast.setAttribute("role", "status");
                           toast.setAttribute("aria-live", "polite");
                           toast.textContent = message;
                           document.body.appendChild(toast);
                           
                           // Animate toast
                           safeAnimate(toast, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(20px)" }], {duration: 4000, easing: "ease"});                  
                           // Remove toast after animation
                           setTimeout(() => toast.remove(), 4000);
                  };
                  
                  const updateProgress = (counterElem, exploredCount, totalItems) => {
                           if (!counterElem) return;
                           counterElem.textContent = `Progress: ${exploredCount}/${totalItems}`;
                           const progressBar = counterElem.nextElementSibling?.querySelector(".progress-fill");
                           if (progressBar) {
                                    const percentage = totalItems>0 ? Math.min((exploredCount / totalItems) * 100, 100): 0;
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
                           storage.remove(`${sectionId}-exploredItems`);
                           
                           section.dispatchEvent(new CustomEvent("progressReset"));
                           
                           // Reset progress counters and localStorage
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

                  function openBadgeModal(card, messageOverride, titleOverride) {
                           const modal = document.getElementById("badge-modal");
                           const modalImage = document.getElementById("modal-badge-image");
                           const modalTitle = document.getElementById("modal-badge-title");
                           const modalMessage = document.getElementById("modal-badge-message");
                           
                           if (!modal || !modalImage || !modalTitle || !modalMessage || !card) return;
                           
                           const img = card.querySelector("img");
                           const h3 = card.querySelector("h3");
                           const p = card.querySelector("p");
                           
                           if (!img || !h3) return;
                           
                           modalImage.src = img.src;
                           modalTitle.textContent = titleOverride || h3.textContent;
                           modalMessage.textContent = messageOverride || p?.textContent || "";
                           modal.classList.add("show");
                  }
                  
                  // Initialize Gamified Sections
                  const initializedSections = new Set();
                  const initializeGamifiedSections = () => {
                           const initializeSection = ({ id, itemsClass, badgeId }) => {
                                    if (initializedSections.has(id)) return;
                                    const section = document.getElementById(id);
                                    if (!section) return;
                                    initializedSections.add(id);
                                    const items = section.querySelectorAll(itemsClass);
                                    const exploredKey = `${id}-exploredItems`;
                                    let exploredSet;
                                    try{exploredSet = new Set(JSON.parse(storage.get(exploredKey) || "[]"));}
                                    catch{exploredSet = new Set();}
                                    items.forEach((item, index) => {
                                             const itemId = getItemId(item, index);
                                             if (exploredSet.has(itemId)) item.classList.add("explored");
                                    });
                                    const state = {exploredCount: exploredSet.size};
                                    
                                    // Create or select progress counter
                                    const progressCounter = document.createElement("div");
                                    progressCounter.className = "progress-counter";
                                    
                                    const progressBarContainer = document.createElement("div");
                                    progressBarContainer.className = "progress-bar-container";
                                    
                                    const progressBarFill = document.createElement("div");
                                    progressBarFill.className = "progress-fill";
                                    
                                    progressBarContainer.appendChild(progressBarFill);
                                    const heading = section.querySelector("h2");
                                    if (heading) {heading.after(progressCounter, progressBarContainer);} 
                                    else {section.prepend(progressCounter, progressBarContainer);}
                                    
                                    const resetButton = document.createElement("button");
                                    resetButton.textContent = "Reset Progress";
                                    resetButton.className = "reset-button";
                                    resetButton.addEventListener("click", () => resetProgress(id, itemsClass, badgeId));
                                    section.appendChild(resetButton);
                                    
                                    // Load unlocked badges from localStorage
                                    const badgeContainer = document.getElementById(badgeId);
                                    if (badgeContainer && storage.get(badgeId) === "unlocked") {
                                             badgeContainer.classList.add("unlocked");
                                             badgeContainer.style.display = "block";
                                             const img = badgeContainer.querySelector("img");
                                             if (img) img.style.display = "block";
                                    }
                                       
                                    // Delegate click event to section
                                    section.addEventListener("click", (event) => {
                                             const target = event.target.closest(itemsClass);
                                             if (target && !target.classList.contains("explored")) {
                                                      const allItems = Array.from(section.querySelectorAll(itemsClass));
                                                      const itemIndex = allItems.indexOf(target);
                                                      if (itemIndex === -1) return;
                                                      const itemId = getItemId(target, itemIndex);
                                                      
                                                      target.classList.add("explored");
                                                      exploredSet.add(itemId);
                                                      storage.set(exploredKey, JSON.stringify([...exploredSet]));
                                                      state.exploredCount = exploredSet.size;
                                                      updateProgress(progressCounter, state.exploredCount, allItems.length);
                                                      if (state.exploredCount === allItems.length) {unlockBadge(badgeContainer);}
                                             }
                                    });
                                    section.addEventListener("progressReset", () => {
                                             exploredSet.clear();
                                             state.exploredCount = 0;
                                    });
                                    
                                    // Initial progress display
                                    updateProgress(progressCounter, state.exploredCount, items.length);
                           };
                           
                           sectionsToGamify.forEach(initializeSection);
                           
                           // Observe dynamically added sections or items
                           if (initializedSections.size < sectionsToGamify.length) {
                                    let hasWarned = false;
                                    const observer = new MutationObserver((mutations) => {
                                             mutations.forEach((mutation) => {
                                                      if (mutation.type === "childList") {
                                                               sectionsToGamify.forEach(({ id, itemsClass, badgeId }) => {
                                                                        const section = document.getElementById(id);
                                                                        if (section && mutation.target.contains(section)) {initializeSection({ id, itemsClass, badgeId });}
                                                               });
                                                      }
                                             });
                                             if (initializedSections.size === sectionsToGamify.length) {
                                                      observer.disconnect();
                                                      clearTimeout(warnTimeout);
                                             }
                                    });
                                    const contentRoot = document.getElementById("main-content") || document.body;
                                    observer.observe(contentRoot, { childList: true, subtree: true });
                                    const warnTimeout = setTimeout(() => {
                                             if (!hasWarned && initializedSections.size < sectionsToGamify.length) {
                                                      hasWarned = true;
                                                      const missing = sectionsToGamify.map(s => s.id).filter(id => !initializedSections.has(id));
                                                      console.warn("Gamification: some sections still not rendered after 15s, still watching:", missing);
                                             }
                                    }, 15000);
                           }        
                  };
                  
                  // Badge Modal Handling
                  let badgeModalInitialized = false;
                  const setupBadgeModal = () => {
                           if (badgeModalInitialized) return;
                           const modal = document.getElementById("badge-modal");
                           const modalImage = document.getElementById("modal-badge-image");
                           const modalTitle = document.getElementById("modal-badge-title");
                           const modalMessage = document.getElementById("modal-badge-message");
                           const closeButton = document.getElementById("modal-close-button");
                           
                           if (!modal || !modalImage || !modalTitle || !modalMessage || !closeButton) {
                                    console.warn("Badge modal: one or more required elements not found.");
                                    return;
                           }
                           badgeModalInitialized = true;
                           
                           document.addEventListener("click", (event) => {
                                    const card = event.target.closest(".badge-card");
                                    if (!card) return;
                                    const badgeId = card.dataset.badgeId;
                                    const badgeContainer = document.getElementById(badgeId);
                                    if (badgeContainer && badgeContainer.classList.contains("unlocked")) {
                                             openBadgeModal(card, undefined, badgeContainer.dataset.badgeName);
                                             clearTimeout(modalAutoCloseTimer);
                                    }
                                    else {showToast("Unlock this badge by exploring the section!");}
                           });
                           
                           closeButton.addEventListener("click", () => {
                                    modal.classList.remove("show");
                                    clearTimeout(modalAutoCloseTimer);
                           });
                           
                           // Close modal on outside click
                           document.addEventListener("click", (event) => {
                                    if (!modal.classList.contains("show")) return;
                                    if (modal.contains(event.target) || event.target.closest(".badge-card")) return;
                                    modal.classList.remove("show");
                                    clearTimeout(modalAutoCloseTimer);
                           });
                  };
                  
                  // Keyword Info Modal (About section deep-dives)
                  let keywordModalInitialized = false;
                  const keywordModalContent = {
                           "about-kaushik-name": {
                                    title: "Kaushik Chintalapudi",
                                    body: "Cloud Analyst and AI enthusiast, based in India, working across Microsoft Azure, Oracle Fusion Financials, and applied AI. Raised in the UAE with roots in Andhra Pradesh — currently building toward a career in Cloud Data Engineering, with a long-term goal of founding an AI-driven tech company in Amaravati."
                           },
                           "about-july-2023": {
                                    title: "July 2023",
                                    body: "Graduated with a BTech in Computer Science Engineering from Dr. Vishwanath Karad MIT World Peace University, Pune — the foundation that led into cloud internships, Oracle Fusion training, and a growing focus on AI."
                           }
                  };
                  
                  const setupKeywordModal = () => {
                           if (keywordModalInitialized) return;
                           keywordModalInitialized = true;
                           
                           const overlay = document.createElement("div");
                           overlay.id = "keyword-modal-overlay";
                           overlay.className = "keyword-modal-overlay";
                           overlay.setAttribute("role", "dialog");
                           overlay.setAttribute("aria-modal", "true");
                           
                           const box = document.createElement("div");
                           box.className = "keyword-modal-box";
                           
                           const title = document.createElement("h3");
                           title.className = "keyword-modal-title";
                           
                           const body = document.createElement("p");
                           body.className = "keyword-modal-body";
                           
                           const closeBtn = document.createElement("button");
                           closeBtn.textContent = "Close";
                           closeBtn.className = "keyword-modal-close";
                           
                           box.append(title, body, closeBtn);
                           overlay.appendChild(box);
                           document.body.appendChild(overlay);

                           let previouslyFocused = null;
                           
                           const close = () => {
                                    overlay.classList.remove("show");
                                    previouslyFocused?.focus();
                           };
                           closeBtn.addEventListener("click", close);
                           document.addEventListener("keydown", (e) => {if (e.key === "Escape" && overlay.classList.contains("show")) close();});
                           
                           window.openKeywordModal = (id, fallbackText) => {
                                    const content = keywordModalContent[id];
                                    title.textContent = content?.title || fallbackText || "Details";
                                    body.textContent = content?.body || "More details coming soon.";
                                    previouslyFocused = document.activeElement;
                                    overlay.classList.add("show");
                                    closeBtn.focus();
                           };
                  };

                  // Keyboard Accessibility for role="button" elements
                  const setupKeyboardActivation = () => {
                           const isTextEntry = (el) => {
                                    if (!el) return false;
                                    const tag = el.tagName;
                                    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
                           };
                           
                           document.addEventListener("keydown", (event) => {
                                    if (event.key !== "Enter" && event.key !== " ") return;
                                    if (isTextEntry(event.target)) return;
                                    const target = event.target.closest('[role="button"]');
                                    if (!target) return;
                                    event.preventDefault();
                                    target.click();
                           });
                  };

                  const ensureBadgeProgressUI = () => {
                           if (document.getElementById("badge-progress-text")) return;
                           const dashboard = document.getElementById("dashboard");
                           if (!dashboard) return;
                           
                           const container = document.createElement("div");
                           container.className = "badge-progress-container";
                           
                           const text = document.createElement("p");
                           text.id = "badge-progress-text";
                           
                           const bar = document.createElement("div");
                           bar.className = "progress-bar";
                           
                           const fill = document.createElement("div");
                           fill.className = "progress-fill";
                           fill.id = "badge-progress-fill";
                           
                           bar.appendChild(fill);
                           container.append(text, bar);
                           
                           dashboard.prepend(container);
                  };

                  const refreshBadgeCardLockStates = () => { 
                           document.querySelectorAll(".badge-card").forEach(card => { 
                                    const badgeContainer = document.getElementById(card.dataset.badgeId); 
                                    const isUnlocked = badgeContainer?.classList.contains("unlocked"); 
                                    card.classList.toggle("locked", !isUnlocked); 
                           }); 
                  }; 
                  
                  // Update Badge Progress in Dashboard
                  const updateBadgeProgress = () => {
                           if (!document.getElementById("dashboard")) {
                                    if (!dashboardMissingWarned) {
                                             console.warn("Badge progress: #dashboard not found yet.");
                                             dashboardMissingWarned = true;
                                    }
                                    return;
                           }
                           ensureBadgeProgressUI();
                           refreshBadgeCardLockStates();
                           
                           const badgeProgressText = document.getElementById("badge-progress-text");
                           const badgeProgressFill = document.getElementById("badge-progress-fill");
                           if (!badgeProgressText || !badgeProgressFill) return;
                           
                           const unlockedCount = badgeSections.reduce((count, id) => {return count + (storage.get(id) === "unlocked" ? 1 : 0);}, 0);
                           
                           badgeProgressText.textContent = `Badges Unlocked: ${unlockedCount}/${badgeSections.length}`;
                           const percentage = badgeSections.length? (unlockedCount / badgeSections.length) * 100: 0;
                           badgeProgressFill.style.animation = "none";
                           badgeProgressFill.offsetHeight;
                           badgeProgressFill.style.setProperty("--progress-width", `${percentage}%`);
                           badgeProgressFill.style.animation = "fillProgress 1s ease forwards";
                  };

                  // Progress Export/Import (mitigates localStorage's per-device fragility)
                  const setupProgressPortability = () => {
                           const collectProgressKeys = () => {
                                    const keys = [...badgeSections];
                                    sectionsToGamify.forEach(({ id }) => keys.push(`${id}-exploredItems`));
                                    return keys;
                           };
                           
                           // Build the shared modal once
                           const modalOverlay = document.createElement("div");
                           modalOverlay.id = "progress-modal-overlay";
                           modalOverlay.className = "progress-modal-overlay";
                           
                           const modalBox = document.createElement("div");
                           modalBox.className = "progress-modal-box";
                           
                           const modalTitle = document.createElement("h3");
                           modalTitle.className = "progress-modal-title";
                           
                           const modalMessage = document.createElement("p");
                           modalMessage.className = "progress-modal-message";
                           
                           const modalTextarea = document.createElement("textarea");
                           modalTextarea.className = "progress-modal-textarea";
                           
                           const modalButtonRow = document.createElement("div");
                           modalButtonRow.className = "progress-modal-button-row";
                           
                           const makeModalButton = (label, primary) => {
                                    const btn = document.createElement("button");
                                    btn.textContent = label;
                                    btn.className = "progress-modal-btn" + (primary ? " primary" : "");
                                    return btn;
                           };
                           
                           const closeBtn = makeModalButton("Cancel", false);
                           const actionBtn = makeModalButton("Copy", true);
                           
                           modalButtonRow.append(closeBtn, actionBtn);
                           modalBox.append(modalTitle, modalMessage, modalTextarea, modalButtonRow);
                           modalOverlay.appendChild(modalBox);
                           document.body.appendChild(modalOverlay);
                           
                           const closeModal = () => {modalOverlay.classList.remove("show");};
                           closeBtn.addEventListener("click", closeModal);
                           modalOverlay.addEventListener("click", (e) => {if (e.target === modalOverlay) closeModal();});
                           
                           const openModal = ({ title, message, value, readOnly, actionLabel, onAction }) => {
                                    modalTitle.textContent = title;
                                    modalMessage.textContent = message;
                                    modalTextarea.value = value || "";
                                    modalTextarea.readOnly = readOnly;
                                    actionBtn.textContent = actionLabel;
                                    actionBtn.onclick = () => onAction(modalTextarea.value);
                                    modalOverlay.classList.add("show");
                                    if (!readOnly) modalTextarea.focus();
                                    else { modalTextarea.select(); }
                           };
                           
                           const exportProgress = () => {
                                    const data = {};
                                    collectProgressKeys().forEach((key) => {
                                             const value = storage.get(key);
                                             if (value !== null) data[key] = value;
                                    });
                                    const code = btoa(encodeURIComponent(JSON.stringify(data)));
                                    
                                    openModal({
                                             title: "Your Progress Code", 
                                             message: "Copy this code and paste it on another device or browser to restore your progress.", 
                                             value: code, 
                                             readOnly: true, 
                                             actionLabel: "Copy to Clipboard", 
                                             onAction: () => {
                                                      if (navigator.clipboard && navigator.clipboard.writeText) {
                                                               navigator.clipboard.writeText(code).then(() => showToast("Copied to clipboard!")).catch(() => showToast("Couldn't auto-copy — select the text and copy manually."));
                                                      } else {
                                                               showToast("Select the text and copy manually.");
                                                      }
                                             }
                                    });
                           };
                           
                           const importProgress = () => {
                                    openModal({
                                             title: "Restore Progress", 
                                             message: "Paste your progress code below.", 
                                             value: "", 
                                             readOnly: false, 
                                             actionLabel: "Restore", 
                                             onAction: (pastedCode) => {
                                                      if (!pastedCode.trim()) return;
                                                      try {
                                                               const data = JSON.parse(decodeURIComponent(atob(pastedCode.trim())));
                                                               const validKeys = new Set(collectProgressKeys());
                                                               let restoredCount = 0;
                                                               Object.entries(data).forEach(([key, value]) => {
                                                                        if (validKeys.has(key) && typeof value === "string") {
                                                                                 storage.set(key, value);
                                                                                 restoredCount++;
                                                                        }
                                                               });
                                                               if (restoredCount === 0) throw new Error("No valid progress keys found");
                                                               closeModal();
                                                               showToast("Progress restored! Reloading...");
                                                               setTimeout(() => location.reload(), 1000);
                                                      } catch (error) {
                                                               console.warn("Progress import failed:", error);
                                                               showToast("That code didn't look right — nothing was changed.");
                                                      }
                                             }
                                    });
                           };
                           
                           const container = document.createElement("div");
                           container.className = "progress-portability";
                           
                           const makeTriggerButton = (label, handler) => {
                                    const btn = document.createElement("button");
                                    btn.textContent = label;
                                    btn.addEventListener("click", handler);
                                    btn.className = "progress-portability-btn";
                                    return btn;
                           };
                           
                           container.appendChild(makeTriggerButton("Export Progress", exportProgress));
                           container.appendChild(makeTriggerButton("Import Progress", importProgress));
                           document.body.appendChild(container);
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
                                       document.body.appendChild(popover);
                              }
                              window.addEventListener("scroll", () => {popover.style.display = "none";}, { passive: true });
                              
                              const positionPopover = (x, y) => {
                                       popover.style.display = "block";
                                       const pw = popover.offsetWidth || 160;
                                       const ph = popover.offsetHeight || 40;
                                       const left = Math.max(0, Math.min(x + 10, window.scrollX + window.innerWidth - pw - 10));
                                       const top  = Math.max(0, Math.min(y + 10, window.scrollY + window.innerHeight - ph - 10));
                                       popover.style.left = `${left}px`;
                                       popover.style.top  = `${top}px`;
                              };
                              
                              // Hide popover on any tap outside a keyword or the popover itself
                              document.addEventListener("touchstart", (e) => {
                                       if (!e.target.closest(".keyword") && !e.target.closest("#global-popover")) {popover.style.display = "none";}}, { passive: true });
                              
                              keywords.forEach((keyword) => {
                                       if (initializedElements.has(keyword)) return;
                                       initializedElements.add(keyword);
                                       keyword.addEventListener("mouseenter", (e) => {
                                                popover.textContent = keyword.dataset.tooltip || `More about ${keyword.textContent}`;
                                                positionPopover(e.pageX, e.pageY);
                                       });
                                       keyword.addEventListener("mouseleave", () => {popover.style.display = "none";});
                                       
                                       // Touch: tap shows/toggles the tooltip near the tap point
                                       keyword.addEventListener("touchstart", (e) => {
                                                const isOpen = popover.style.display === "block" && popover.textContent === (keyword.dataset.tooltip || `More about ${keyword.textContent}`);
                                                if (isOpen) {
                                                         popover.style.display = "none";
                                                         return;
                                                }
                                                const touch = e.touches[0];
                                                popover.textContent = keyword.dataset.tooltip || `More about ${keyword.textContent}`;
                                                positionPopover(touch.pageX, touch.pageY);
                                       }, { passive: true });
                                       
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
                                                else if (action === "open-modal") {window.openKeywordModal(keyword.dataset.id, keyword.textContent);}
                                                else if (action === "scroll-to") {
                                                         const targetId = keyword.dataset.target;
                                                         if (!targetId) {
                                                                  console.warn("scroll-to keyword missing data-target:", keyword.textContent.trim());
                                                                  return;
                                                         }
                                                         const target = document.getElementById(targetId);
                                                         if (target) {target.scrollIntoView({ behavior: "smooth" });}
                                                }
                                       });
                              });
                     };
                  
                  // Course Link Highlight
                  const setupCourseLinkHighlights = () => {
                           document.querySelectorAll(".course-link[data-action=\"highlight\"]").forEach((link) => {
                                    link.addEventListener("click", () => {
                                             link.style.backgroundColor = "var(--button-bg)";
                                             link.style.color = "var(--bg-color)";
                                             setTimeout(() => {
                                                      link.style.backgroundColor = "";
                                                      link.style.color = "";
                                             }, 1000);
                                    });
                           });
                  };
                  
                  // Dark Mode Toggle
                  const toggleDarkMode = () => {
                           const toggleButton = document.getElementById("darkModeToggle");
                           const themeIcon = document.getElementById("themeIcon");
                           const themeText = document.getElementById("themeText");
                           if (!toggleButton || !themeIcon) {
                                    console.warn("Dark mode toggle: elements not found.");
                                    return;
                           }
                           
                           const themeOrder = ["light", "dark", "high-contrast"];
                           const themeMeta = {
                                    light: { icon: "fas fa-moon", label: "Switch to dark theme" },
                                    dark: { icon: "fas fa-adjust", label: "Switch to high-contrast theme" },
                                    "high-contrast": { icon: "fas fa-sun", label: "Switch to light theme" }
                           };
                           
                           const applyThemeUI = (theme) => {
                                    const meta = themeMeta[theme] || themeMeta.dark;
                                    themeIcon.className = meta.icon;
                                    toggleButton.setAttribute("aria-label", meta.label);
                                    if (themeText) themeText.textContent = meta.label;
                           };
                           
                           // Theme was already set synchronously in <head> — just sync the icon to it.
                           const currentTheme = document.documentElement.getAttribute("data-theme") || storage.get("theme") || "light";
                           applyThemeUI(currentTheme);
                           
                           toggleButton.addEventListener("click", () => {
                                    const active = document.documentElement.getAttribute("data-theme") || "dark";
                                    const nextIndex = (themeOrder.indexOf(active) + 1) % themeOrder.length;
                                    const newTheme = themeOrder[nextIndex];
                                    document.documentElement.setAttribute("data-theme", newTheme);
                                    storage.set("theme", newTheme);
                                    applyThemeUI(newTheme);
                           });
                  };
                  
                  // Back-to-Top Button
                  const setupBackToTop = () => {
                           const button = document.getElementById("backToTop");
                           if (!button) {
                                    console.warn("Back-to-top button not found.");
                                    return;
                           }
                           button.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                           });
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
                           
                           // Restore unlocked state on page reload
                           if (storage.get(badgeContainer.id) === "unlocked") {
                                    badgeContainer.classList.add("unlocked");
                                    badgeContainer.style.display = "block";
                                    const img = badgeContainer.querySelector("img");
                                    if (img) img.style.display = "block";
                           }
                           
                           // Mobile Chrome/Safari often render an empty iframe for embedded PDFs with no error event fired. 
                           // Feature-detect rather than relying on load/error, since a "successful" load can still render blank.
                           const supportsInlinePdf = (() => {
                                    const isIOS = /iP(hone|od|ad)/.test(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
                                    const isAndroidChrome = /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent);
                                    return !(isIOS || isAndroidChrome);
                           })();
                           
                           let elementToObserve = viewer;
                           
                           if (!supportsInlinePdf) {
                                    const fallback = document.createElement("div");
                                    fallback.className = "resume-fallback-notice";
                                    fallback.innerHTML = `
                                    <p>PDF preview isn't supported on this device/browser.</p>
                                    <a href="${viewer.getAttribute("src")}" download class="resume-download-btn">
                                    <i class="fas fa-download" aria-hidden="true"></i> Download Resume
                                    </a>
                                    `;
                                    viewer.replaceWith(fallback);
                                    elementToObserve = fallback;
                           }
                           
                           // Load unlocked badge state — observe whichever element actually ended up in the DOM
                           const observer = new IntersectionObserver((entries) => {
                                    entries.forEach(entry => {
                                             if (entry.isIntersecting && !badgeContainer.classList.contains("unlocked")) {
                                                      unlockBadge(badgeContainer);
                                                      observer.disconnect();
                                             }
                                    });
                           }, { threshold: 0.5 });
                           observer.observe(elementToObserve);
                  };
                  
                  // Initialize Conclusion Section
                  const initializeConclusionSection = () => {
                           const section = document.getElementById("conclusion");
                           const badgeContainer = document.getElementById("badge-container-conclusion");
                           
                           if (!section || !badgeContainer) {
                                    console.warn("Conclusion section: section or badge container not found.");
                                    return;
                           }
                           
                           // Restore unlocked state on page reload
                           if (storage.get(badgeContainer.id) === "unlocked") {
                                    badgeContainer.classList.add("unlocked");
                                    badgeContainer.style.display = "block";
                                    const img = badgeContainer.querySelector("img");
                                    if (img) img.style.display = "block";
                           }
                           
                           const observer = new IntersectionObserver((entries) => {
                                    entries.forEach(entry => {
                                             if (entry.isIntersecting && !badgeContainer.classList.contains("unlocked")) {
                                                      unlockBadge(badgeContainer);
                                                      observer.disconnect();
                                             }
                                    });
                           }, {threshold: 0.1});
                           observer.observe(section);
                  
                  };

                  // Initialize Dashboard Section
                  const initializeDashboardSection = () => {
                           const section = document.getElementById("dashboard");
                           const badgeContainer = document.getElementById("badge-container-dashboard");
                           
                           if (!section || !badgeContainer) {
                                    console.warn("Dashboard section: section or badge container not found.");
                                    return;
                           }
                           
                           // Restore unlocked state on page reload
                           if (storage.get(badgeContainer.id) === "unlocked") {
                                    badgeContainer.classList.add("unlocked");
                                    badgeContainer.style.display = "block";
                                    const img = badgeContainer.querySelector("img");
                                    if (img) img.style.display = "block";
                           }
                           
                           const observer = new IntersectionObserver((entries) => {
                                    entries.forEach(entry => {
                                             if (entry.isIntersecting && !badgeContainer.classList.contains("unlocked")) {
                                                      unlockBadge(badgeContainer);
                                                      observer.disconnect();
                                             }
                                    });
                           }, {threshold: 0.1});
                           observer.observe(section);
                  };

                  // Talking Avatar Introduction
                  const setupTalkingAvatar = () => {
                           const avatar = document.getElementById("talking-avatar");
                           const speechText = document.getElementById("avatar-speech-text");
                           if (!avatar || !speechText) {
                                    console.warn("Talking avatar: elements not found.");
                                    return;
                           }
                           
                           const introLines = [
                                    "Hey, I'm Kaushik 👋",
                                    "I work across Azure Cloud, Oracle Fusion Financials, and applied AI.",
                                    "Scroll down to check out my projects, certifications, and journey so far!"
                           ];
                           
                           let isSpeaking = false;
                           let typingTimeout = null;
                           
                           const typeLine = (line, onDone) => {
                                    speechText.textContent = "";
                                    let i = 0;
                                    const type = () => {
                                             if (i < line.length) {
                                                      speechText.textContent += line.charAt(i);
                                                      i++;
                                                      typingTimeout = setTimeout(type, 30);
                                             } else {
                                                      typingTimeout = setTimeout(onDone, 1400);
                                             }
                                    };
                                    type();
                           };
                           
                           const playIntro = (index) => {
                                    if (index >= introLines.length) {
                                             avatar.classList.remove("talking", "speaking");
                                             isSpeaking = false;
                                             return;
                                    }
                                    typeLine(introLines[index], () => playIntro(index + 1));
                           };
                           
                           avatar.addEventListener("click", () => {
                                    if (isSpeaking) return;
                                    isSpeaking = true;
                                    clearTimeout(typingTimeout);
                                    avatar.classList.add("talking", "speaking");
                                    playIntro(0);
                           });
                  };

                  const setupHeaderScrollEffect = () => {
                           const header = document.querySelector("header");
                           if (!header) return;
                           window.addEventListener("scroll", () => {
                                    header.classList.toggle("scrolled", window.scrollY > 50);
                           }, { passive: true });
                  };

                  const setupThemeToggleHint = () => {
                           const toggleButton = document.getElementById("darkModeToggle");
                           if (!toggleButton) return;
                           
                           const hintKey = "themeHintShown";
                           if (storage.get(hintKey)) return;
                           
                           const hint = document.createElement("div");
                           hint.className = "theme-hint";
                           hint.textContent = "Tip: click again for high-contrast mode";
                           hint.setAttribute("role", "status");
                           document.body.appendChild(hint);
                           
                           const positionHint = () => {
                                    const rect = toggleButton.getBoundingClientRect();
                                    hint.style.top = `${rect.bottom + 8}px`;
                                    hint.style.right = `${window.innerWidth - rect.right}px`;
                           };
                           positionHint();
                           window.addEventListener("resize", positionHint, { passive: true });
                           
                           requestAnimationFrame(() => hint.classList.add("show"));
                           
                           const dismiss = () => {
                                    hint.classList.remove("show");
                                    setTimeout(() => hint.remove(), 300);
                                    storage.set(hintKey, "shown");
                                    toggleButton.removeEventListener("click", dismiss);
                                    window.removeEventListener("resize", positionHint);
                           };
                           
                           setTimeout(dismiss, 6000);
                           toggleButton.addEventListener("click", dismiss);
                  };
                  
                  // Initialize All Features
                  const safeInit = (fn) => {
                           try { fn(); }
                           catch (error) { console.error(`${fn.name || "Unnamed init"} failed:`, error); }
                  };
                  
                  [initializeGamifiedSections,
                   setupBadgeModal,
                   setupKeywordModal,
                   setupSmoothScroll,
                   setupTooltips,
                   setupCourseLinkHighlights,
                   setupKeyboardActivation,
                   toggleDarkMode,
                   setupBackToTop,
                   highlightActiveSection,
                   setCurrentYear,
                   initializeResumeSection,
                   initializeConclusionSection,
                   initializeDashboardSection,
                   setupTalkingAvatar,
                   setupHeaderScrollEffect,
                   setupProgressPortability,
                   setupThemeToggleHint,
                   updateBadgeProgress].forEach(safeInit);
         } catch (error) {console.error("Initialization Error:", error);}
});
