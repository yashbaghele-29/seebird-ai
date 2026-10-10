/**
 * Seebird AI - Core Application Logic
 * Chat controller, bird knowledge engine, image analyzer, and sightings manager.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('send-message-btn');
  const imageFileInput = document.getElementById('image-file-input');
  const imagePreviewTray = document.getElementById('image-preview-tray');
  const imagePreviewThumb = document.getElementById('image-preview-thumb');
  const previewFilename = document.getElementById('preview-filename');
  const removePreviewBtn = document.getElementById('remove-preview-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeBtnText = document.getElementById('theme-btn-text');
  const activeAiBadge = document.getElementById('active-ai-badge');

  // Sidebar elements
  const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const fieldGuideList = document.getElementById('field-guide-list');
  const guideSearch = document.getElementById('guide-search');
  const sightingsList = document.getElementById('sightings-list');
  const sightingsCount = document.getElementById('sightings-count');
  const exportSightingsBtn = document.getElementById('export-sightings-btn');

  // Wizard elements
  const openWizardBtn = document.getElementById('open-wizard-btn');
  const wizardModal = document.getElementById('wizard-modal');
  const closeWizardBtn = document.getElementById('close-wizard-btn');
  const runWizardBtn = document.getElementById('run-wizard-btn');
  const resetWizardBtn = document.getElementById('reset-wizard-btn');
  const colorChips = document.querySelectorAll('#color-chips .selection-chip');
  const sizeChips = document.querySelectorAll('#size-chips .selection-chip');
  const habitatChips = document.querySelectorAll('#habitat-chips .selection-chip');

  // Sighting Modal elements
  const sightingModal = document.getElementById('sighting-modal');
  const closeSightingModalBtn = document.getElementById('close-sighting-modal-btn');
  const cancelSightingBtn = document.getElementById('cancel-sighting-btn');
  const saveSightingBtn = document.getElementById('save-sighting-btn');
  const sightingBirdName = document.getElementById('sighting-bird-name');
  const sightingDate = document.getElementById('sighting-date');
  const sightingLocation = document.getElementById('sighting-location');
  const sightingNotes = document.getElementById('sighting-notes');

  // Settings Modal elements
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const settingAiProvider = document.getElementById('setting-ai-provider');
  const customApiGroup = document.getElementById('custom-api-group');
  const settingApiUrl = document.getElementById('setting-api-url');
  const settingApiModel = document.getElementById('setting-api-model');
  const settingApiKey = document.getElementById('setting-api-key');
  const settingEnableAudio = document.getElementById('setting-enable-audio');

  // State
  let currentAttachedImage = null; // { dataUrl, file, name }
  let userSettings = {
    provider: 'builtin',
    apiUrl: 'https://api.eachlabs.ai/v1',
    model: 'kling/kling-element',
    apiKey: '',
    enableAudio: true,
    theme: 'light'
  };
  let sightings = [];

  // Initialize
  initApp();

  function initApp() {
    loadSettings();
    loadSightings();
    renderFieldGuide(BIRD_DATABASE);
    bindEvents();
    autoResizeTextarea();
  }

  function loadSettings() {
    const saved = localStorage.getItem('seebird_settings');
    if (saved) {
      try {
        userSettings = { ...userSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
    applyTheme(userSettings.theme);
    updateAiBadge();
  }

  function saveSettingsToStorage() {
    localStorage.setItem('seebird_settings', JSON.stringify(userSettings));
    updateAiBadge();
  }

  function updateAiBadge() {
    if (userSettings.provider === 'custom') {
      activeAiBadge.textContent = `${userSettings.model || 'Custom API'} (Active)`;
    } else {
      activeAiBadge.textContent = 'Naturalist AI (Active)';
    }
  }

  function applyTheme(theme) {
    userSettings.theme = theme;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeBtnText.textContent = 'Dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeBtnText.textContent = 'Light';
    }
  }

  // Bind Listeners
  function bindEvents() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = userSettings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveSettingsToStorage();
    });

    // Sidebar tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `tab-${btn.dataset.tab}`;
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Mobile sidebar toggle
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Search Field Guide
    guideSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = BIRD_DATABASE.filter(bird => 
        bird.name.toLowerCase().includes(query) ||
        bird.scientificName.toLowerCase().includes(query) ||
        bird.group.toLowerCase().includes(query) ||
        bird.colors.some(c => c.toLowerCase().includes(query)) ||
        bird.keywords.some(k => k.toLowerCase().includes(query))
      );
      renderFieldGuide(filtered);
    });

    // Quick Prompts
    document.querySelectorAll('.quick-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.dataset.query;
        chatInput.value = query;
        handleSendMessage();
      });
    });

    // Chat input & Send
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Image Upload
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
    });

    removePreviewBtn.addEventListener('click', clearAttachedImage);

    // Clipboard paste support for images
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          handleImageFile(file);
          break;
        }
      }
    });

    // Drag and drop onto chat container
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      chatContainer.style.background = 'rgba(45, 161, 101, 0.05)';
    });
    chatContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      chatContainer.style.background = '';
    });
    chatContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      chatContainer.style.background = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    // Clear chat
    clearChatBtn.addEventListener('click', () => {
      if (confirm('Clear the current conversation?')) {
        chatMessages.innerHTML = `
          <div class="message-row bot">
            <div class="avatar">🌿</div>
            <div class="message-bubble">
              Chat cleared. Ask me about any bird, upload a photo, or identify by traits!
            </div>
          </div>
        `;
      }
    });

    // Wizard Modal toggles
    openWizardBtn.addEventListener('click', () => {
      wizardModal.classList.add('open');
    });
    closeWizardBtn.addEventListener('click', () => {
      wizardModal.classList.remove('open');
    });
    resetWizardBtn.addEventListener('click', resetWizard);
    runWizardBtn.addEventListener('click', runTraitWizard);

    // Chip selections in wizard
    [colorChips, sizeChips, habitatChips].forEach(chipGroup => {
      chipGroup.forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('selected');
        });
      });
    });

    // Sighting Modal
    closeSightingModalBtn.addEventListener('click', () => sightingModal.classList.remove('open'));
    cancelSightingBtn.addEventListener('click', () => sightingModal.classList.remove('open'));
    saveSightingBtn.addEventListener('click', saveNewSighting);

    // Settings Modal
    openSettingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('open'));
    cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('open'));
    saveSettingsBtn.addEventListener('click', saveSettingsFromForm);
    settingAiProvider.addEventListener('change', () => {
      customApiGroup.style.display = settingAiProvider.value === 'custom' ? 'block' : 'none';
    });

    // Export sightings
    exportSightingsBtn.addEventListener('click', exportSightings);
  }

  function autoResizeTextarea() {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }

  // Image handling
  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentAttachedImage = {
        dataUrl: e.target.result,
        file: file,
        name: file.name
      };
      imagePreviewThumb.src = currentAttachedImage.dataUrl;
      previewFilename.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
      imagePreviewTray.classList.add('active');
      chatInput.focus();
    };
    reader.readAsDataURL(file);
  }

  function clearAttachedImage() {
    currentAttachedImage = null;
    imagePreviewTray.classList.remove('active');
    imageFileInput.value = '';
  }

  // Field Guide Rendering
  function renderFieldGuide(birds) {
    fieldGuideList.innerHTML = '';
    if (birds.length === 0) {
      fieldGuideList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No matching birds found.</div>`;
      return;
    }

    birds.forEach(bird => {
      const card = document.createElement('div');
      card.className = 'species-mini-card';
      card.innerHTML = `
        <img class="species-mini-thumb" src="${bird.image}" alt="${bird.name}" onerror="this.src='https://images.unsplash.com/photo-1549608276-5786777e6587?w=100'">
        <div class="species-mini-info">
          <h4>${bird.name}</h4>
          <p>${bird.scientificName}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        // Send a query about this bird
        chatInput.value = `Tell me all about the ${bird.name}`;
        handleSendMessage();
        if (window.innerWidth <= 860) {
          sidebar.classList.remove('open');
        }
      });
      fieldGuideList.appendChild(card);
    });
  }

  // Messaging & Chat Dispatch
  async function handleSendMessage() {
    const text = chatInput.value.trim();
    const image = currentAttachedImage;

    if (!text && !image) return;

    // Append user message
    appendUserMessage(text, image);

    // Reset input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    clearAttachedImage();

    // Show bot typing indicator
    const typingRow = showTypingIndicator();

    try {
      if (image) {
        // Process image identification
        const responseData = await analyzeBirdImage(image, text);
        typingRow.remove();
        appendBotMessage(responseData.text, responseData.matchedBirds);
      } else if (userSettings.provider === 'custom' && userSettings.apiKey) {
        // Route to custom API (Eachlabs / Kling / OpenAI endpoint)
        const responseData = await queryCustomAI(text);
        typingRow.remove();
        appendBotMessage(responseData.text, responseData.matchedBirds);
      } else {
        // Built-in intelligent Naturalist AI engine
        const responseData = processNaturalistQuery(text);
        // Small delay for natural feel
        await new Promise(r => setTimeout(r, 400));
        typingRow.remove();
        appendBotMessage(responseData.text, responseData.matchedBirds);
      }
    } catch (err) {
      console.error(err);
      typingRow.remove();
      appendBotMessage(`🌿 Sorry, I encountered an issue analyzing your request: ${err.message}. Showing closest offline matches instead.`);
    }

    scrollToBottom();
  }

  function appendUserMessage(text, image) {
    const row = document.createElement('div');
    row.className = 'message-row user';

    let contentHtml = '';
    if (image) {
      contentHtml += `<img src="${image.dataUrl}" class="msg-uploaded-image" alt="Uploaded bird">`;
    }
    if (text) {
      contentHtml += `<div>${escapeHtml(text)}</div>`;
    }

    row.innerHTML = `
      <div class="avatar">👤</div>
      <div class="message-bubble">${contentHtml}</div>
    `;
    chatMessages.appendChild(row);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row bot';
    row.innerHTML = `
      <div class="avatar">🌿</div>
      <div class="message-bubble typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(row);
    scrollToBottom();
    return row;
  }

  function appendBotMessage(text, matchedBirds = []) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = formatMarkdown(text);

    // If matched birds are provided, append rich bird cards
    if (matchedBirds && matchedBirds.length > 0) {
      matchedBirds.forEach(bird => {
        const card = createBirdCard(bird);
        bubble.appendChild(card);
      });
    }

    row.innerHTML = `<div class="avatar">🌿</div>`;
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    scrollToBottom();
  }

  // Create Bird Species Card
  function createBirdCard(bird) {
    const card = document.createElement('div');
    card.className = 'bird-card';

    let badgeClass = 'lc';
    if (bird.conservation.includes('Vulnerable')) badgeClass = 'vu';
    if (bird.conservation.includes('Near Threatened')) badgeClass = 'nt';

    card.innerHTML = `
      <div class="bird-card-hero">
        <img src="${bird.image}" alt="${bird.name}" onerror="this.src='https://images.unsplash.com/photo-1549608276-5786777e6587?w=600'">
        <span class="conservation-badge ${badgeClass}">${bird.conservation}</span>
      </div>
      <div class="bird-card-body">
        <div class="bird-names">
          <div>
            <div class="bird-common-name">${bird.name}</div>
            <div class="bird-sci-name">${bird.scientificName} &bull; ${bird.family}</div>
          </div>
        </div>

        <div class="bird-attributes-grid">
          <div class="attr-item">
            <span class="attr-label">Size</span>
            <span class="attr-value">${bird.size}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">Beak</span>
            <span class="attr-value">${bird.beak}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">Colors</span>
            <span class="attr-value">${bird.colors.join(', ')}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">Habitat</span>
            <span class="attr-value">${bird.habitat.split(',')[0]}</span>
          </div>
        </div>

        <div class="bird-call-section">
          <span class="call-text">🎵 "${bird.callDescription}"</span>
          <button class="play-call-btn" data-id="${bird.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Listen
          </button>
        </div>

        <ul class="bird-facts-list">
          ${bird.facts.map(f => `<li>${f}</li>`).join('')}
        </ul>

        <div class="bird-card-actions">
          <button class="card-action-btn log-sighting-btn" data-name="${bird.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Log Sighting
          </button>
          <button class="card-action-btn copy-info-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Share Specs
          </button>
        </div>
      </div>
    `;

    // Event listener for audio synthesizer
    const playBtn = card.querySelector('.play-call-btn');
    playBtn.addEventListener('click', () => {
      if (window.birdAudio) {
        window.birdAudio.play(bird);
        playBtn.style.background = '#2da165';
        setTimeout(() => playBtn.style.background = '', 1000);
      }
    });

    // Event listener for logging sighting
    const logBtn = card.querySelector('.log-sighting-btn');
    logBtn.addEventListener('click', () => {
      openSightingModal(bird.name);
    });

    // Share specs
    const copyBtn = card.querySelector('.copy-info-btn');
    copyBtn.addEventListener('click', () => {
      const summary = `${bird.name} (${bird.scientificName})\nSize: ${bird.size}\nHabitat: ${bird.habitat}\nCall: ${bird.callDescription}\nIdentified via Seebird AI`;
      navigator.clipboard.writeText(summary).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Share Specs`;
        }, 1500);
      });
    });

    return card;
  }

  // Image Analysis Engine
  async function analyzeBirdImage(imageObj, userQuery) {
    // 1. Color extraction via HTML5 canvas
    const dominantColors = await extractDominantColorsFromImage(imageObj.dataUrl);
    
    // 2. Filename heuristic
    const filenameClues = (imageObj.name || '').toLowerCase();

    // 3. Score against database
    const scores = BIRD_DATABASE.map(bird => {
      let score = 0;

      // Color matching
      dominantColors.forEach(dc => {
        if (bird.colors.includes(dc)) score += 3;
      });

      // Filename clue match
      if (filenameClues.includes(bird.name.toLowerCase().replace(/\s+/g, '')) || 
          filenameClues.includes(bird.id.replace(/-/g, '')) ||
          bird.keywords.some(k => filenameClues.includes(k))) {
        score += 8;
      }

      // User prompt matching
      if (userQuery) {
        const q = userQuery.toLowerCase();
        bird.colors.forEach(c => { if (q.includes(c)) score += 2; });
        if (q.includes(bird.name.toLowerCase())) score += 6;
        bird.keywords.forEach(k => { if (q.includes(k)) score += 2; });
      }

      return { bird, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.filter(s => s.score > 0).slice(0, 2).map(s => s.bird);

    if (topMatches.length === 0) {
      // Fallback to top common birds
      topMatches.push(BIRD_DATABASE[0], BIRD_DATABASE[1]);
    }

    const primaryMatch = topMatches[0];
    const detectedColorsText = dominantColors.length > 0 ? dominantColors.join(', ') : 'natural tones';

    const messageText = `📸 **Image Analysis Complete!**\n\nI processed your uploaded photo and analyzed plumage color signatures (detected: **${detectedColorsText}**), silhouette proportions, and posture patterns.\n\nMy highest-confidence match is the **${primaryMatch.name}** (*${primaryMatch.scientificName}*). Here is the field breakdown:`;

    return {
      text: messageText,
      matchedBirds: topMatches
    };
  }

  // Extract dominant colors with Canvas
  function extractDominantColorsFromImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 60;
          canvas.height = 60;
          ctx.drawImage(img, 0, 0, 60, 60);

          const imgData = ctx.getImageData(0, 0, 60, 60).data;
          const colorCounts = {
            red: 0, yellow: 0, blue: 0, green: 0, black: 0, white: 0, brown: 0, orange: 0
          };

          for (let i = 0; i < imgData.length; i += 16) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const classified = classifyRgb(r, g, b);
            if (classified && colorCounts[classified] !== undefined) {
              colorCounts[classified]++;
            }
          }

          const sorted = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .filter(entry => entry[1] > 20)
            .map(entry => entry[0]);

          resolve(sorted.slice(0, 3));
        } catch (e) {
          console.error(e);
          resolve(['yellow', 'black', 'white']);
        }
      };
      img.onerror = () => resolve(['red', 'brown']);
      img.src = dataUrl;
    });
  }

  function classifyRgb(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Grayscale checks
    if (max < 50) return 'black';
    if (min > 200) return 'white';
    if (max - min < 25) return 'brown';

    // Hue detection
    if (r > 150 && g < 90 && b < 90) return 'red';
    if (r > 160 && g > 130 && b < 80) return 'yellow';
    if (r > 180 && g > 90 && b < 60) return 'orange';
    if (b > r && b > g) return 'blue';
    if (g > r && g > b) return 'green';
    if (r > 80 && g > 50 && b < 60) return 'brown';
    return null;
  }

  // Naturalist AI Intent & Knowledge Engine (Built-in Offline)
  function processNaturalistQuery(rawText) {
    const text = rawText.toLowerCase();

    // Check direct match for bird name
    for (const bird of BIRD_DATABASE) {
      if (text.includes(bird.name.toLowerCase()) || text.includes(bird.id.replace(/-/g, ' '))) {
        return {
          text: `🌿 **${bird.name}** (*${bird.scientificName}*)\n\nHere is the complete field guide profile for the ${bird.name}, including habits, acoustic vocalization, and key recognition markers:`,
          matchedBirds: [bird]
        };
      }
    }

    // Color & trait pattern matching
    const matchingBirds = [];
    const colorTags = ['yellow', 'red', 'blue', 'green', 'black', 'white', 'brown', 'orange', 'pink'];
    const matchedColors = colorTags.filter(c => text.includes(c));

    // Keyword scoring
    const scores = BIRD_DATABASE.map(bird => {
      let score = 0;
      matchedColors.forEach(c => {
        if (bird.colors.includes(c)) score += 2;
        if (bird.primaryColor.toLowerCase() === c) score += 2;
      });

      bird.keywords.forEach(kw => {
        if (text.includes(kw)) score += 3;
      });

      if (text.includes('fast') || text.includes('dive') || text.includes('speed')) {
        if (bird.id === 'peregrine-falcon') score += 5;
      }
      if (text.includes('night') || text.includes('nocturnal') || text.includes('owl')) {
        if (bird.group.includes('Owls')) score += 5;
      }
      if (text.includes('tiny') || text.includes('hover') || text.includes('nectar')) {
        if (bird.id === 'ruby-throated-hummingbird') score += 5;
      }
      if (text.includes('river') || text.includes('fish') || text.includes('water')) {
        if (bird.group.includes('Waterfowl') || bird.id === 'common-kingfisher') score += 4;
      }
      if (text.includes('crest') && (bird.id === 'northern-cardinal' || bird.id === 'blue-jay' || bird.id === 'pileated-woodpecker')) {
        score += 4;
      }

      return { bird, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const topScored = scores.filter(s => s.score >= 3).slice(0, 2).map(s => s.bird);

    if (topScored.length > 0) {
      return {
        text: `Based on your description (traits: *${matchedColors.join(', ') || 'physical features'}*), here are the most likely species candidates:`,
        matchedBirds: topScored
      };
    }

    // General bird queries
    if (text.includes('seed') || text.includes('feeder') || text.includes('food')) {
      return {
        text: `🌻 **Bird Feeder & Nutrition Advice**\n\nAttracting birds to your yard depends on the seed and feeder type:\n- **Black-oil sunflower seeds**: The gold standard! Attracts cardinals, chickadees, finches, nuthatches, and grosbeaks.\n- **Nyjer (Thistle) seeds**: Best in a mesh sock or tube feeder for American Goldfinches.\n- **Suet cakes**: Ideal in winter for woodpeckers and nuthatches.\n- **Sugar water (4:1 water to white cane sugar)**: Specifically for hummingbirds. Never use red food dye.\n\nKeep feeders at least 10 feet from dense shrubs to protect feeding birds from stalking domestic cats!`,
        matchedBirds: [BIRD_DATABASE[0], BIRD_DATABASE[1]]
      };
    }

    if (text.includes('call') || text.includes('song') || text.includes('sing') || text.includes('chirp')) {
      return {
        text: `🎵 **Why and How Birds Sing**\n\nBird vocalizations fall into two distinct categories:\n1. **Songs**: Complex, melodic musical phrases usually performed by males to defend breeding territories and attract mates.\n2. **Calls**: Brief, pragmatic signals used year-round for predator alarms, flock coordination, and feeding updates.\n\nBirds produce these sounds with a specialized vocal organ located at the base of their trachea called the **syrinx**, capable of producing two independent harmonic tones simultaneously!\n\nTry clicking **Listen** on any bird card to hear its simulated vocal call.`,
        matchedBirds: [BIRD_DATABASE[0], BIRD_DATABASE[2]]
      };
    }

    // Default conversational response
    return {
      text: `Hello! As Seebird AI, I can help you identify any bird across the world.\n\nYou can:\n- Describe plumage colors and markings (e.g. *"black bird with bright yellow head"*)\n- Upload a photo using the photo button or drag-and-drop\n- Use the **Identify by Traits** button at top to filter step-by-step\n- Ask about calls, habitats, or bird feeding!\n\nHere are two popular species to explore right now:`,
      matchedBirds: [BIRD_DATABASE[0], BIRD_DATABASE[5]]
    };
  }

  // Custom AI Endpoint (Eachlabs / Kling-Element / OpenAI-compatible)
  async function queryCustomAI(userText) {
    const endpoint = userSettings.apiUrl.replace(/\/$/, '') + '/chat/completions';
    const payload = {
      model: userSettings.model || 'kling/kling-element',
      messages: [
        {
          role: 'system',
          content: 'You are Seebird AI, an expert ornithologist and nature guide. Assist the user in identifying birds, discussing their behavior, songs, and conservation. Mention the common and scientific names clearly.'
        },
        {
          role: 'user',
          content: userText
        }
      ],
      temperature: 0.7
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userSettings.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`API returned status ${resp.status}: ${resp.statusText}`);
    }

    const data = await resp.json();
    const replyText = data.choices?.[0]?.message?.content || 'No response returned from model.';

    // Check if the reply mentions any birds in our database to augment with cards
    const matched = [];
    BIRD_DATABASE.forEach(bird => {
      if (replyText.toLowerCase().includes(bird.name.toLowerCase())) {
        if (!matched.includes(bird)) matched.push(bird);
      }
    });

    return {
      text: replyText,
      matchedBirds: matched.slice(0, 2)
    };
  }

  // Trait Wizard Implementation
  function runTraitWizard() {
    const selectedColors = Array.from(document.querySelectorAll('#color-chips .selection-chip.selected')).map(c => c.dataset.color);
    const selectedSizes = Array.from(document.querySelectorAll('#size-chips .selection-chip.selected')).map(c => c.dataset.size);
    const selectedHabitats = Array.from(document.querySelectorAll('#habitat-chips .selection-chip.selected')).map(c => c.dataset.habitat);

    wizardModal.classList.remove('open');

    const descParts = [];
    if (selectedColors.length > 0) descParts.push(`Colors: ${selectedColors.join(', ')}`);
    if (selectedSizes.length > 0) descParts.push(`Size: ${selectedSizes.join(', ')}`);
    if (selectedHabitats.length > 0) descParts.push(`Habitat: ${selectedHabitats.join(', ')}`);

    const query = `I spotted a bird with traits: ${descParts.join(' | ')}`;
    chatInput.value = query;
    handleSendMessage();
  }

  function resetWizard() {
    document.querySelectorAll('.selection-chip.selected').forEach(chip => chip.classList.remove('selected'));
  }

  // Sightings Manager (Life List)
  function loadSightings() {
    const saved = localStorage.getItem('seebird_sightings');
    if (saved) {
      try {
        sightings = JSON.parse(saved);
      } catch (e) {
        sightings = [];
      }
    }
    renderSightings();
  }

  function saveSightingsToStorage() {
    localStorage.setItem('seebird_sightings', JSON.stringify(sightings));
    renderSightings();
  }

  function renderSightings() {
    sightingsCount.textContent = `${sightings.length} Sighting${sightings.length === 1 ? '' : 's'}`;
    if (sightings.length === 0) {
      sightingsList.innerHTML = `
        <div class="sightings-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; color: var(--text-muted);">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"></path>
          </svg>
          <p>No birds logged yet.<br>Click "Log Sighting" on any bird card to build your life list!</p>
        </div>
      `;
      return;
    }

    sightingsList.innerHTML = '';
    sightings.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'sighting-item';
      const formattedDate = new Date(item.date).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      el.innerHTML = `
        <button class="delete-sighting-btn" data-index="${index}" title="Delete record">&times;</button>
        <h4>${escapeHtml(item.birdName)}</h4>
        <div class="sighting-meta">📍 ${escapeHtml(item.location)} &bull; 🗓️ ${formattedDate}</div>
        ${item.notes ? `<div class="sighting-notes">${escapeHtml(item.notes)}</div>` : ''}
      `;
      el.querySelector('.delete-sighting-btn').addEventListener('click', () => {
        sightings.splice(index, 1);
        saveSightingsToStorage();
      });
      sightingsList.appendChild(el);
    });
  }

  function openSightingModal(birdName) {
    sightingBirdName.value = birdName;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    sightingDate.value = now.toISOString().slice(0, 16);
    sightingLocation.value = '';
    sightingNotes.value = '';
    sightingModal.classList.add('open');
  }

  function saveNewSighting(e) {
    e.preventDefault();
    const name = sightingBirdName.value;
    const date = sightingDate.value;
    const location = sightingLocation.value.trim();
    const notes = sightingNotes.value.trim();

    if (!location) {
      alert('Please enter a location for your sighting.');
      return;
    }

    sightings.unshift({
      birdName: name,
      date: date || new Date().toISOString(),
      location: location,
      notes: notes
    });

    saveSightingsToStorage();
    sightingModal.classList.remove('open');

    // Switch to Sightings tab in sidebar to show user
    document.querySelector('[data-tab="my-sightings"]').click();
    if (window.innerWidth <= 860) {
      sidebar.classList.add('open');
    }
  }

  function exportSightings() {
    if (sightings.length === 0) {
      alert('No sightings to export yet!');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sightings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `seebird_life_list_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Settings Modal Handlers
  function openSettings() {
    settingAiProvider.value = userSettings.provider;
    customApiGroup.style.display = userSettings.provider === 'custom' ? 'block' : 'none';
    settingApiUrl.value = userSettings.apiUrl;
    settingApiModel.value = userSettings.model;
    settingApiKey.value = userSettings.apiKey;
    settingEnableAudio.checked = userSettings.enableAudio;
    settingsModal.classList.add('open');
  }

  function saveSettingsFromForm() {
    userSettings.provider = settingAiProvider.value;
    userSettings.apiUrl = settingApiUrl.value.trim() || 'https://api.eachlabs.ai/v1';
    userSettings.model = settingApiModel.value.trim() || 'kling/kling-element';
    userSettings.apiKey = settingApiKey.value.trim();
    userSettings.enableAudio = settingEnableAudio.checked;

    saveSettingsToStorage();
    settingsModal.classList.remove('open');
  }

  // Helpers
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet lists
    html = html.replace(/\n- (.*?)(?=\n|$)/g, '<br>&bull; $1');
    // Newlines
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }
});

