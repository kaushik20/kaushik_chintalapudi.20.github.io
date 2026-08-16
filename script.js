document.addEventListener("DOMContentLoaded", () => {
         try {
                  // Utility Functions
                  const storage = {
                           get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
                           set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
                           remove: (key) => { try { localStorage.removeItem(key); } catch {} }
                  };
                  
                  const getItemId = (item, index) => item.dataset.id || `idx-${index}`;
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
                           openBadgeModal(card, celebrationMsg);
                           clearTimeout(modalAutoCloseTimer); 
                           modalAutoCloseTimer = setTimeout(() => {document.getElementById("badge-modal")?.classList.remove("show");}, 4000);

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

                  function openBadgeModal(card, messageOverride) {
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
                           modalTitle.textContent = h3.textContent;
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
                                    const totalItems = items.length;
                                    const exploredKey = `${id}-exploredItems`;
                                    let exploredSet;
                                    try{exploredSet = new Set(JSON.parse(storage.get(exploredKey) || "[]"));}
                                    catch{exploredSet = new Set();}
                                    items.forEach((item, index) => {
                                             const itemId = getItemId(item, index);
                                             if (exploredSet.has(itemId)) item.classList.add("explored");
                                    });
                                    const state = { exploredCount: exploredSet.size };
                                    
                                    // Create or select progress counter
                                    const progressCounter = document.createElement("div");
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
                                    background: rgba(128, 128, 128, 0.15);
                                    border: 1px solid var(--border-color);
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
                                    background: var(--button-bg);
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    `;
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
                                                      updateProgress(progressCounter, state.exploredCount, totalItems);
                                                      if (state.exploredCount === totalItems) {unlockBadge(badgeContainer);}
                                             }
                                    });
                                    section.addEventListener("progressReset", () => {
                                             exploredSet.clear();
                                             state.exploredCount = 0;
                                    });
                                    
                                    // Initial progress display
                                    updateProgress(progressCounter, state.exploredCount, totalItems);
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
                                    if (badgeContainer && badgeContainer.classList.contains("unlocked")) {openBadgeModal(card)}
                                    else {showToast("Unlock this badge by exploring the section!");}
                           });
                           
                           closeButton.addEventListener("click", () => {
                                    modal.classList.remove("show");
                                    clearTimeout(modalAutoCloseTimer);
                           });
                           
                           // Close modal on outside click
                           window.addEventListener("click", (event) => {
                                    if (event.target === modal) {
                                             modal.classList.remove("show");
                                             clearTimeout(modalAutoCloseTimer);
                                    }
                           });
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
                  
                  // Update Badge Progress in Dashboard
                  const updateBadgeProgress = () => {
                           ensureBadgeProgressUI();
                           
                           const badgeProgressText = document.getElementById("badge-progress-text");
                           const badgeProgressFill = document.getElementById("badge-progress-fill");
                           if (!badgeProgressText || !badgeProgressFill) {
                                    console.warn("Badge progress: elements not found.");
                                    return;
                           }
                           
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
                           modalOverlay.style.cssText = `
                           display: none;
                           position: fixed;
                           top: 0; left: 0; right: 0; bottom: 0;
                           background: rgba(0, 0, 0, 0.5);
                           z-index: 1100;
                           align-items: center;
                           justify-content: center;
                           `;
                           
                           const modalBox = document.createElement("div");
                           modalBox.style.cssText = `
                           background: var(--bg-color);
                           color: var(--text-color);
                           padding: 24px;
                           border-radius: 8px;
                           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                           max-width: 420px;
                           width: 90%;
                           `;
                           
                           const modalTitle = document.createElement("h3");
                           modalTitle.style.cssText = "margin: 0 0 12px 0; font-size: 1.1rem;";
                           
                           const modalMessage = document.createElement("p");
                           modalMessage.style.cssText = "margin: 0 0 12px 0; font-size: 0.9rem; opacity: 0.85;";
                           
                           const modalTextarea = document.createElement("textarea");
                           modalTextarea.style.cssText = `
                           width: 100%;
                           min-height: 80px;
                           padding: 8px;
                           border-radius: 5px;
                           border: 1px solid var(--progress-bg);
                           background: var(--bg-color);
                           color: var(--text-color);
                           font-family: monospace;
                           font-size: 0.8rem;
                           resize: vertical;
                           box-sizing: border-box;
                           `;
                           
                           const modalButtonRow = document.createElement("div");
                           modalButtonRow.style.cssText = "display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;";
                           
                           const makeModalButton = (label, primary) => {
                                    const btn = document.createElement("button");
                                    btn.textContent = label;
                                    btn.style.cssText = `
                                    padding: 8px 16px;
                                    font-size: 0.85rem;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    background: ${primary ? "var(--button-bg)" : "transparent"};
                                    color: ${primary ? "white" : "var(--text-color)"};
                                    border: ${primary ? "none" : "1px solid var(--progress-bg)"};
                                    `;
                                    return btn;
                           };
                           
                           const closeBtn = makeModalButton("Cancel", false);
                           const actionBtn = makeModalButton("Copy", true);
                           
                           modalButtonRow.append(closeBtn, actionBtn);
                           modalBox.append(modalTitle, modalMessage, modalTextarea, modalButtonRow);
                           modalOverlay.appendChild(modalBox);
                           document.body.appendChild(modalOverlay);
                           
                           const closeModal = () => { modalOverlay.style.display = "none"; };
                           closeBtn.addEventListener("click", closeModal);
                           modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
                           
                           const openModal = ({ title, message, value, readOnly, actionLabel, onAction }) => {
                                    modalTitle.textContent = title;
                                    modalMessage.textContent = message;
                                    modalTextarea.value = value || "";
                                    modalTextarea.readOnly = readOnly;
                                    actionBtn.textContent = actionLabel;
                                    actionBtn.onclick = () => onAction(modalTextarea.value);
                                    modalOverlay.style.display = "flex";
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
                           container.style.cssText = `
                           position: fixed;
                           bottom: 20px;
                           left: 20px;
                           display: flex;
                           gap: 8px;
                           z-index: 999;
                           `;
                           
                           const makeTriggerButton = (label, handler) => {
                                    const btn = document.createElement("button");
                                    btn.textContent = label;
                                    btn.style.cssText = `
                                    padding: 6px 12px;
                                    font-size: 0.8rem;
                                    background: var(--button-bg);
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    opacity: 0.85;
                                    `;
                                    btn.addEventListener("click", handler);
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
                                                else if (action === "open-modal") {showToast(`Modal for ${keyword.textContent} would open here!`);}
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
                  
                  // Dark Mode Toggle
                  const toggleDarkMode = () => {
                           const toggleButton = document.getElementById("darkModeToggle");
                           const themeIcon = document.getElementById("themeIcon");
                           if (!toggleButton || !themeIcon) {
                                    console.warn("Dark mode toggle: elements not found.");
                                    return;
                           }
                           const savedTheme = storage.get("theme");
                           const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                           const currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
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
                           }, { threshold: 0.5 });
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
                           }, { threshold: 0.5 });
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
                  
                  // Initialize All Features
                  const safeInit = (fn) => {
                           try { fn(); }
                           catch (error) { console.error(`${fn.name || "Unnamed init"} failed:`, error); }
                  };
                  
                  [initializeGamifiedSections,
                   setupBadgeModal,
                   updateBadgeProgress,
                   setupSmoothScroll,
                   setupTooltips,
                   setupKeyboardActivation,
                   toggleDarkMode,
                   setupBackToTop,
                   highlightActiveSection,
                   setCurrentYear,
                   initializeResumeSection,
                   initializeConclusionSection,
                   initializeDashboardSection,
                   setupTalkingAvatar,
                   setupProgressPortability].forEach(safeInit);
         } catch (error) {console.error("Initialization Error:", error);}
});
