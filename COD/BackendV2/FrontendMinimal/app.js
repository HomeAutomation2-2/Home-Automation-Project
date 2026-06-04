const state = {
  serverUrl: localStorage.getItem('backendV2.serverUrl') || 'http://localhost:3500',
  token: localStorage.getItem('backendV2.token') || '',
  rooms: [],
  lights: [],
  programs: [],
  presence: [],
  logs: [],
};

const elements = {
  serverUrl: document.getElementById('serverUrl'),
  phoneInput: document.getElementById('phoneInput'),
  passwordInput: document.getElementById('passwordInput'),
  authOutput: document.getElementById('authOutput'),
  healthOutput: document.getElementById('healthOutput'),
  summary: document.getElementById('summary'),
  roomsList: document.getElementById('roomsList'),
  lightsList: document.getElementById('lightsList'),
  programsList: document.getElementById('programsList'),
  presenceList: document.getElementById('presenceList'),
  logsList: document.getElementById('logsList'),
};

elements.serverUrl.value = state.serverUrl;
renderAuth();

document.getElementById('saveServerButton').addEventListener('click', () => {
  state.serverUrl = normalizeUrl(elements.serverUrl.value);
  elements.serverUrl.value = state.serverUrl;
  localStorage.setItem('backendV2.serverUrl', state.serverUrl);
});

document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('logoutButton').addEventListener('click', logout);
document.getElementById('healthButton').addEventListener('click', checkHealth);
document.getElementById('embeddedButton').addEventListener('click', simulateEmbeddedRegister);
document.getElementById('loadDataButton').addEventListener('click', loadData);
document.getElementById('toggleFirstLightButton').addEventListener('click', toggleFirstLight);
document.getElementById('sendTempButton').addEventListener('click', sendMockTemperature);

function normalizeUrl(value) {
  return value.trim().replace(/\/$/, '');
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${state.serverUrl}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(typeof data === 'string' ? data : data.message || 'Request failed');
  }

  return data;
}

async function login() {
  try {
    const data = await api('/auth-sessions/login', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: elements.phoneInput.value,
        password_plaintext: elements.passwordInput.value,
      }),
    });

    state.token = data.token;
    localStorage.setItem('backendV2.token', state.token);
    await loadMe();
  } catch (error) {
    elements.authOutput.textContent = `Login failed: ${error.message}`;
  }
}

async function loadMe() {
  const profile = await api('/users/me');
  elements.authOutput.textContent = JSON.stringify(profile, null, 2);
}

function logout() {
  state.token = '';
  localStorage.removeItem('backendV2.token');
  renderAuth();
}

function renderAuth() {
  elements.authOutput.textContent = state.token
    ? 'Token salvat. Apasa "Incarca date".'
    : 'Nu esti autentificat.';
}

async function checkHealth() {
  try {
    const data = await api('/health');
    elements.healthOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    elements.healthOutput.textContent = `Health failed: ${error.message}`;
  }
}

async function simulateEmbeddedRegister() {
  try {
    const data = await api('/embedded/register', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'ESP32_MAIN_GATEWAY',
        device_type: 'gateway',
        firmware_version: 'frontend-minimal-test',
        ip_address: '192.168.1.93',
        capabilities: ['lights', 'heating', 'temperature_gateway'],
      }),
    });

    elements.healthOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    elements.healthOutput.textContent = `Embedded register failed: ${error.message}`;
  }
}

async function loadData() {
  try {
    const requests = [
      api('/rooms'),
      api('/light-zones'),
      api('/heating-programs'),
    ];

    if (state.token) {
      requests.push(api('/users/presence'));
      requests.push(api('/users/logs'));
    }

    const [rooms, lights, programs, presence = [], logs = []] = await Promise.all(requests);
    state.rooms = rooms;
    state.lights = lights;
    state.programs = programs;
    state.presence = presence;
    state.logs = logs;
    renderAll();
  } catch (error) {
    elements.summary.innerHTML = `<div class="error">Load failed: ${escapeHtml(error.message)}</div>`;
  }
}

async function toggleFirstLight() {
  if (state.lights.length === 0) {
    await loadData();
  }

  const firstLight = state.lights[0];
  if (!firstLight) return;

  await api(`/light-zones/${firstLight.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_on: !firstLight.is_on }),
  });

  await loadData();
}

async function sendMockTemperature() {
  await api('/embedded/readings/temperature', {
    method: 'POST',
    body: JSON.stringify({
      device_id: 'ESP32_MAIN_GATEWAY',
      room_code: 'ROOM1',
      value: Number((20 + Math.random() * 4).toFixed(2)),
      humidity: Number((40 + Math.random() * 10).toFixed(2)),
    }),
  });

  await loadData();
}

function renderAll() {
  elements.summary.innerHTML = [
    summaryItem('Rooms', state.rooms.length),
    summaryItem('Lights on', state.lights.filter((item) => item.is_on).length),
    summaryItem('Programs', state.programs.length),
    summaryItem('Users home', state.presence.filter((item) => item.is_home).length),
  ].join('');

  elements.roomsList.innerHTML = state.rooms.map(renderRoom).join('');
  elements.lightsList.innerHTML = state.lights.map(renderLight).join('');
  elements.programsList.innerHTML = state.programs.map(renderProgram).join('');
  elements.presenceList.innerHTML = state.presence.map(renderPresence).join('');
  elements.logsList.innerHTML = state.logs.slice(0, 12).map(renderLog).join('');
}

function summaryItem(label, value) {
  return `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderRoom(room) {
  return `
    <div class="list-item">
      <strong>${escapeHtml(room.name)}</strong>
      <span>${room.current_temp} C / program ${room.temp_program_id ?? '-'}</span>
    </div>
  `;
}

function renderLight(light) {
  return `
    <div class="list-item">
      <strong>${escapeHtml(light.name)}</strong>
      <span>Room ${light.room_id} - ${light.is_on ? 'ON' : 'OFF'}</span>
    </div>
  `;
}

function renderProgram(program) {
  return `
    <div class="list-item">
      <strong>${escapeHtml(program.name)}</strong>
      <span>${program.schedule.length} subprogram(e)</span>
    </div>
  `;
}

function renderPresence(user) {
  return `
    <div class="list-item">
      <strong>${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</strong>
      <span>${user.is_home ? 'Acasa' : 'Plecat'} - ${escapeHtml(user.last_access_event)}</span>
    </div>
  `;
}

function renderLog(log) {
  return `
    <div class="list-item">
      <strong>${escapeHtml(log.type)}</strong>
      <span>${escapeHtml(log.message)}</span>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
