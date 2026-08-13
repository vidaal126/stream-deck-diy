// DIY Stream Deck Client Logic

let socket;
let currentProfileId = 'media';
let configData = { profiles: [] };
let isEditMode = false;
let statsTimeout;

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = statusIndicator.querySelector('.status-text');
const clockEl = document.getElementById('clock');
const profilesListEl = document.getElementById('profiles-list');
const buttonsGridEl = document.getElementById('buttons-grid');
const toggleEditBtn = document.getElementById('toggle-edit-mode');
const editBanner = document.getElementById('edit-banner');
const closeEditBtn = document.getElementById('close-edit-mode');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const modalTitle = document.getElementById('modal-title');

// Form Fields
const formBtnId = document.getElementById('edit-btn-id');
const formProfileId = document.getElementById('edit-profile-id');
const formLabel = document.getElementById('btn-label');
const formIcon = document.getElementById('btn-icon');
const formColor = document.getElementById('btn-color');
const formActionType = document.getElementById('btn-action-type');
const formActionValue = document.getElementById('btn-action-value');
const actionValueGroup = document.getElementById('action-value-group');
const actionValueLabel = document.getElementById('action-value-label');
const actionHelpText = document.getElementById('action-help-text');

// Initialize Web Clock
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toTimeString().split(' ')[0];
}
setInterval(updateClock, 1000);
updateClock();

// Establish WebSocket connection with auto-reconnection
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('Conectado ao servidor.');
    statusIndicator.className = 'status-indicator online';
    statusText.textContent = 'Online';
  };

  socket.onclose = () => {
    console.log('Conexão fechada. Tentando reconectar...');
    statusIndicator.className = 'status-indicator offline';
    statusText.textContent = 'Desconectado';
    
    // Clear stats bars
    document.getElementById('cpu-bar').style.width = '0%';
    document.getElementById('cpu-val').textContent = '0%';
    document.getElementById('ram-bar').style.width = '0%';
    document.getElementById('ram-val').textContent = '0%';
    
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'config') {
        configData = data.config;
        renderSidebar();
        renderGrid();
      } else if (data.type === 'config_updated') {
        configData = data.config;
        renderSidebar();
        renderGrid();
      } else if (data.type === 'system_stats') {
        updateStats(data.stats);
      }
    } catch (e) {
      console.error('Erro ao ler dados do WebSocket:', e);
    }
  };
}

// Update CPU & RAM UI Status Bars
function updateStats(stats) {
  const cpuBar = document.getElementById('cpu-bar');
  const cpuVal = document.getElementById('cpu-val');
  const ramBar = document.getElementById('ram-bar');
  const ramVal = document.getElementById('ram-val');

  if (cpuBar && cpuVal) {
    cpuBar.style.width = `${stats.cpuUsage}%`;
    cpuVal.textContent = `${stats.cpuUsage}%`;
  }
  if (ramBar && ramVal) {
    ramBar.style.width = `${stats.ramUsage}%`;
    ramVal.textContent = `${stats.ramUsage}%`;
  }
}

// Send Trigger Command to Server
function triggerAction(actionType, actionValue) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'trigger_action',
      actionType,
      actionValue
    }));
  }
}

// Render Sidebar Navigation
function renderSidebar() {
  profilesListEl.innerHTML = '';
  configData.profiles.forEach(profile => {
    const tab = document.createElement('div');
    tab.className = `profile-tab ${profile.id === currentProfileId ? 'active' : ''}`;
    tab.dataset.id = profile.id;
    tab.innerHTML = `
      <i data-lucide="${profile.icon || 'layers'}"></i>
      <span>${profile.name}</span>
    `;
    
    tab.addEventListener('click', () => {
      // Vibrate phone
      vibrate(10);
      currentProfileId = profile.id;
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGrid();
    });
    
    profilesListEl.appendChild(tab);
  });
  
  if (window.lucide) lucide.createIcons();
}

// Render Grid Buttons
function renderGrid() {
  buttonsGridEl.innerHTML = '';
  const activeProfile = configData.profiles.find(p => p.id === currentProfileId);
  if (!activeProfile) return;

  const maxButtons = 12; // Standard grid size: 4x3 or 6x2
  
  for (let i = 0; i < maxButtons; i++) {
    const btn = activeProfile.buttons[i];
    
    if (btn) {
      // Render configured button
      const btnEl = document.createElement('button');
      btnEl.className = 'deck-btn';
      btnEl.style.borderTop = `4px solid ${btn.color || '#2563eb'}`;
      btnEl.innerHTML = `
        <div class="deck-btn-icon" style="color: ${btn.color || '#2563eb'}">
          <i data-lucide="${btn.icon || 'box'}"></i>
        </div>
        <div class="deck-btn-label">${btn.label}</div>
      `;
      
      if (isEditMode) {
        btnEl.innerHTML += `<span class="edit-indicator"><i data-lucide="pencil" style="width: 10px; height: 10px;"></i></span>`;
        btnEl.addEventListener('click', () => openEditModal(btn, currentProfileId, i));
      } else {
        btnEl.addEventListener('click', () => {
          vibrate(45);
          triggerAction(btn.actionType, btn.actionValue);
        });
      }
      
      buttonsGridEl.appendChild(btnEl);
    } else {
      // Render placeholder or empty slot
      const placeholderEl = document.createElement('button');
      if (isEditMode) {
        placeholderEl.className = 'deck-btn empty-btn';
        placeholderEl.innerHTML = `
          <div class="deck-btn-icon"><i data-lucide="plus"></i></div>
          <div class="deck-btn-label" style="color: var(--text-muted)">Adicionar</div>
        `;
        placeholderEl.addEventListener('click', () => openEditModal(null, currentProfileId, i));
      } else {
        placeholderEl.className = 'deck-btn empty-placeholder';
        placeholderEl.innerHTML = `
          <div class="deck-btn-icon"><i data-lucide="minus"></i></div>
        `;
      }
      buttonsGridEl.appendChild(placeholderEl);
    }
  }
  
  if (window.lucide) lucide.createIcons();
}

// Edit Mode State Management
function setEditMode(active) {
  isEditMode = active;
  if (isEditMode) {
    document.body.classList.add('edit-mode-active');
    buttonsGridEl.classList.add('edit-mode');
    toggleEditBtn.classList.add('active');
    editBanner.classList.remove('hidden');
  } else {
    document.body.classList.remove('edit-mode-active');
    buttonsGridEl.classList.remove('edit-mode');
    toggleEditBtn.classList.remove('active');
    editBanner.classList.add('hidden');
  }
  renderGrid();
}

toggleEditBtn.addEventListener('click', () => {
  vibrate(20);
  setEditMode(!isEditMode);
});

closeEditBtn.addEventListener('click', () => {
  vibrate(20);
  setEditMode(false);
});

// Modal operations
function openEditModal(button, profileId, index) {
  vibrate(30);
  formProfileId.value = profileId;
  formBtnId.value = button ? button.id : `btn_${Date.now()}`;
  
  if (button) {
    modalTitle.textContent = 'Editar Botão';
    formLabel.value = button.label;
    formIcon.value = button.icon;
    formColor.value = button.color;
    formActionType.value = button.actionType;
    formActionValue.value = button.actionValue;
    deleteBtn.style.display = 'block';
  } else {
    modalTitle.textContent = 'Adicionar Novo Botão';
    formLabel.value = '';
    formIcon.value = 'link';
    formColor.value = '#2563eb';
    formActionType.value = 'cmd';
    formActionValue.value = '';
    deleteBtn.style.display = 'none';
  }

  handleActionTypeChange();
  editModal.showModal();
}

function closeModal() {
  editModal.close();
}

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Dynamic validation/help text inside form
function handleActionTypeChange() {
  const type = formActionType.value;
  if (type === 'volume' || type === 'media') {
    actionValueGroup.style.display = 'none';
    formActionValue.removeAttribute('required');
  } else {
    actionValueGroup.style.display = 'flex';
    formActionValue.setAttribute('required', '');
    
    if (type === 'keypress') {
      actionValueLabel.textContent = 'Combinação de Teclas (xdotool)';
      formActionValue.placeholder = 'Ex: ctrl+alt+t ou super+d';
      actionHelpText.textContent = 'Use chaves como ctrl, alt, shift, super conectadas com "+".';
    } else if (type === 'cmd') {
      actionValueLabel.textContent = 'Comando do Sistema';
      formActionValue.placeholder = 'Ex: xdg-open https://youtube.com ou code .';
      actionHelpText.textContent = 'Executará este comando diretamente no shell do PC.';
    }
  }
}

formActionType.addEventListener('change', handleActionTypeChange);

// Handle preset colors click
document.querySelectorAll('.preset-color').forEach(preset => {
  preset.addEventListener('click', (e) => {
    formColor.value = e.target.dataset.color;
  });
});

// Save configuration back to server
editForm.onsubmit = async (e) => {
  e.preventDefault();
  
  const profileId = formProfileId.value;
  const btnId = formBtnId.value;
  const activeProfile = configData.profiles.find(p => p.id === profileId);
  if (!activeProfile) return;

  const type = formActionType.value;
  let val = formActionValue.value;
  if (type === 'volume') {
    // If it was simplified but we need direction
    if (formLabel.value.toLowerCase().includes('-')) val = 'down';
    else if (formLabel.value.toLowerCase().includes('mudo')) val = 'mute';
    else val = 'up';
  } else if (type === 'media') {
    if (formLabel.value.toLowerCase().includes('ant') || formLabel.value.toLowerCase().includes('voltar')) val = 'prev';
    else if (formLabel.value.toLowerCase().includes('próx') || formLabel.value.toLowerCase().includes('avan')) val = 'next';
    else val = 'play';
  }

  const updatedButton = {
    id: btnId,
    label: formLabel.value,
    icon: formIcon.value,
    color: formColor.value,
    actionType: type,
    actionValue: val
  };

  // Find index of button
  const existingBtnIndex = activeProfile.buttons.findIndex(b => b.id === btnId);
  if (existingBtnIndex > -1) {
    activeProfile.buttons[existingBtnIndex] = updatedButton;
  } else {
    activeProfile.buttons.push(updatedButton);
  }

  await saveConfig();
  closeModal();
};

// Delete Button Handler
deleteBtn.addEventListener('click', async () => {
  if (confirm('Deseja realmente excluir este botão?')) {
    const profileId = formProfileId.value;
    const btnId = formBtnId.value;
    const activeProfile = configData.profiles.find(p => p.id === profileId);
    if (activeProfile) {
      activeProfile.buttons = activeProfile.buttons.filter(b => b.id !== btnId);
      await saveConfig();
    }
    closeModal();
  }
});

// Sync config data to server API
async function saveConfig() {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    const result = await response.json();
    if (result.success) {
      console.log('Configuração salva com sucesso!');
    }
  } catch (e) {
    console.error('Erro ao salvar configuração no servidor:', e);
  }
}

// Vibration Helper (Web Vibrations API)
function vibrate(duration) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

// Start everything
connectWebSocket();
