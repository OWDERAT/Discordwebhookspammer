const form = document.getElementById('webhookForm');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const singleMessageButton = document.getElementById('singleMessageButton');
const messageBox = document.getElementById('messageBox');
const webhookInfo = document.getElementById('webhookInfo');
const avatar = document.getElementById('avatar');
const name = document.getElementById('name');
const token = document.getElementById('token');
const webhookUrlInput = document.getElementById('webhookUrl');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

let isSpamming = false;
let webhookUrl = '';
let debounceTimeout = null;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.classList.remove('hidden', 'success', 'error');
  messageBox.classList.add(type);
  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 3000);
}

async function validateWebhook(url) {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error('Invalid webhook URL');
    const data = await response.json();
    webhookInfo.classList.remove('hidden');
    name.textContent = data.name || 'Unknown';
    token.textContent = url.split('/').pop();
    avatar.src = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
      : 'https://via.placeholder.com/64';
    singleMessageButton.disabled = false;
  } catch (error) {
    webhookInfo.classList.add('hidden');
    singleMessageButton.disabled = true;
    showMessage('Invalid webhook URL', 'error');
  }
}

// Real-time webhook validation with debouncing
webhookUrlInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const url = webhookUrlInput.value.trim();
    if (url) {
      webhookUrl = url;
      validateWebhook(url);
    } else {
      webhookInfo.classList.add('hidden');
      singleMessageButton.disabled = true;
    }
  }, 500); // 500ms debounce
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSpamming) return;

  webhookUrl = webhookUrlInput.value;
  const message = document.getElementById('message').value;
  const delay = parseInt(document.getElementById('delay').value);

  // Start spamming
  isSpamming = true;
  startButton.disabled = true;
  stopButton.disabled = false;
  singleMessageButton.disabled = true;
  let sentCount = 0;

  const sendMessage = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      if (response.status === 429) {
        showMessage('You are being rate limited', 'error');
        isSpamming = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        singleMessageButton.disabled = false;
        return;
      }
      if (!response.ok) throw new Error('Failed to send message');
      sentCount++;
      showMessage(`Messages sent successfully: ${sentCount}`, 'success');
      if (isSpamming) setTimeout(sendMessage, delay);
    } catch (error) {
      showMessage('Error sending message', 'error');
      isSpamming = false;
      startButton.disabled = false;
      stopButton.disabled = true;
      singleMessageButton.disabled = false;
    }
  };

  sendMessage();
});

singleMessageButton.addEventListener('click', async () => {
  const message = document.getElementById('message').value;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    if (response.status === 429) {
      showMessage('You are being rate limited', 'error');
      return;
    }
    if (!response.ok) throw new Error('Failed to send message');
    showMessage('Message sent successfully', 'success');
  } catch (error) {
    showMessage('Error sending message', 'error');
  }
});

stopButton.addEventListener('click', () => {
  if (!isSpamming) return;
  isSpamming = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  singleMessageButton.disabled = false;

  // Show custom modal
  deleteModal.classList.remove('hidden');
});

confirmDelete.addEventListener('click', async () => {
  try {
    const response = await fetch(webhookUrl, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Webhook deleted successfully', 'success');
      webhookInfo.classList.add('hidden');
      form.reset();
      singleMessageButton.disabled = true;
    } else {
      showMessage('Failed to delete webhook', 'error');
    }
  } catch (error) {
    showMessage('Error deleting webhook', 'error');
  }
  deleteModal.classList.add('hidden');
});

cancelDelete.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
});

// Stop spamming on page unload
window.addEventListener('beforeunload', () => {
  isSpamming = false;
});
