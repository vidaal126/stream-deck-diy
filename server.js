const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoints to get and save configuration
app.get('/api/config', (req, res) => {
  fs.readFile(CONFIG_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler arquivo de configuração' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar arquivo de configuração' });
    }
    res.json({ success: true });
    // Broadcast configuration update to all sockets
    broadcast({ type: 'config_updated', config: newConfig });
  });
});

// Helper to broadcast WebSocket messages to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// System Command Execution Logic
function executeAction(actionType, actionValue) {
  console.log(`Executando ação [${actionType}]: ${actionValue}`);

  switch (actionType) {
    case 'volume':
      if (actionValue === 'up') {
        exec('pactl set-sink-volume @DEFAULT_SINK@ +5% || amixer -D pulse sset Master 5%+ || amixer sset Master 5%+');
      } else if (actionValue === 'down') {
        exec('pactl set-sink-volume @DEFAULT_SINK@ -5% || amixer -D pulse sset Master 5%- || amixer sset Master 5%-');
      } else if (actionValue === 'mute') {
        exec('pactl set-sink-mute @DEFAULT_SINK@ toggle || amixer -D pulse sset Master toggle || amixer sset Master toggle');
      }
      break;

    case 'media':
      if (actionValue === 'play') {
        exec('playerctl play-pause || xdotool key XF86AudioPlay');
      } else if (actionValue === 'prev') {
        exec('playerctl previous || xdotool key XF86AudioPrev');
      } else if (actionValue === 'next') {
        exec('playerctl next || xdotool key XF86AudioNext');
      }
      break;

    case 'keypress':
      // Map common modifiers to xdotool syntax
      let key = actionValue.toLowerCase();
      // Replace super/win with Super_L, control with ctrl, etc.
      key = key.replace(/super|win/g, 'Super_L');
      key = key.replace(/control/g, 'ctrl');
      exec(`/home/linuxbrew/.linuxbrew/bin/xdotool key --clearmodifiers "${key}"`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Erro ao executar xdotool para tecla ${actionValue}:`, stderr || err.message);
        }
      });
      break;

    case 'cmd':
      // Open applications or run CLI commands
      exec(actionValue, (err, stdout, stderr) => {
        if (err) {
          console.error(`Erro ao executar comando: ${actionValue}`, stderr || err.message);
        }
      });
      break;

    default:
      console.warn(`Tipo de ação desconhecido: ${actionType}`);
  }
}

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('Dispositivo conectado ao Stream Deck!');

  // Send initial config
  fs.readFile(CONFIG_FILE, 'utf8', (err, data) => {
    if (!err) {
      ws.send(JSON.stringify({ type: 'config', config: JSON.parse(data) }));
    }
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'trigger_action') {
        executeAction(data.actionType, data.actionValue);
      }
    } catch (e) {
      console.error('Erro ao processar mensagem do websocket:', e);
    }
  });

  ws.on('close', () => {
    console.log('Dispositivo desconectado.');
  });
});

// Periodic System Stats Broadcast (CPU, RAM, Temp)
setInterval(async () => {
  try {
    const [cpu, mem, currentLoad] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.currentLoad()
    ]);

    const stats = {
      cpuUsage: Math.round(currentLoad.currentLoad),
      ramUsage: Math.round((mem.active / mem.total) * 100),
      ramActiveGB: (mem.active / 1024 / 1024 / 1024).toFixed(1),
      ramTotalGB: (mem.total / 1024 / 1024 / 1024).toFixed(1),
      cpuModel: cpu.brand
    };

    broadcast({ type: 'system_stats', stats });
  } catch (error) {
    // Ignore stats fetch errors to prevent crash
  }
}, 2000);

// Get Local Network IP Addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SERVIDOR STREAM DECK INICIADO!`);
  console.log(`==================================================`);
  console.log(`Acesse no seu computador: http://localhost:${PORT}`);
  console.log(`\nNo seu CELULAR ANTIGO (conectado ao mesmo Wi-Fi), acesse:`);
  
  const ips = getLocalIPs();
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`👉 http://${ip}:${PORT}`);
    });
  } else {
    console.log(`👉 http://<ip-do-seu-computador>:${PORT}`);
  }
  console.log(`==================================================\n`);
});
