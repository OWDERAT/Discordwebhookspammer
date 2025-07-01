const form = document.getElementById('webhookForm');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const messageBox = document.getElementById('messageBox');
const webhookInfo = document.getElementById('webhookInfo');
const avatar = document.getElementById('avatar');
const name = document.getElementById('name');
const token = document.getElementById('token');

let isSpamming = false;
let webhookUrl = '';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSpamming) return;

  webhookUrl = document.getElementById('webhookUrl').value;
  const message = document.getElementById('message').value;
  const delay = parseInt(document.getElementById('delay').value);

  // Validate Webhook URL
  try {
    const response = await fetch(webhookUrl, { method: 'GET' });
    if (!response.ok) throw new Error('Invalid webhook URL');
    const data = await response.json();
    
    // Display webhook info
    webhookInfo.classList.remove('hidden');
    name.textContent = data.name || 'Unknown';
    token.textContent = webhookUrl.split('/').pop();
    avatar.src = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
      : 'https://via.placeholder.com/64';
  } catch (error) {
    showMessage('Invalid webhook URL', 'error');
    return;
  }

  // Start spamming
  isSpamming = true;
  startButton.disabled = true;
  stopButton.disabled = false;
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
    }
  };

  sendMessage();
});

stopButton.addEventListener('click', async () => {
  if (!isSpamming) return;
  isSpamming = false;
  startButton.disabled = false;
  stopButton.disabled = true;

  // Show confirmation prompt for webhook deletion
  const shouldDelete = confirm('Do you want to delete this webhook?');
  if (shouldDelete) {
    try {
      const response = await fetch(webhookUrl, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Webhook deleted successfully', 'success');
        webhookInfo.classList.add('hidden'); // Hide webhook info
        form.reset(); // Clear form
      } else {
        showMessage('Failed to delete webhook', 'error');
      }
    } catch (error) {
      showMessage('Error deleting webhook', 'error');
    }
  }
});

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.classList.remove('hidden', 'success', 'error');
  messageBox.classList.add(type);
  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 3000);
}

// Stop spamming on page unload
window.addEventListener('beforeunload', () => {
  isSpamming = false;
});
