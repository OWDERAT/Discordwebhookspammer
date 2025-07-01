# LMXAR Discord Webhook Spammer

A modern web interface for sending messages to a Discord webhook with customizable delay, rate limit detection, and webhook deletion option.

## Features
- Enter a Discord webhook URL, message, and delay (in milliseconds).
- Start and stop sending messages with dedicated buttons.
- On stopping, a prompt asks, "Do you want to delete this webhook?" (OK to delete, Cancel to do nothing).
- Displays webhook details (name, avatar, token) on the right.
- Shows success ("Messages sent successfully: X") or error ("You are being rate limited") messages in the bottom-right corner.

## Deployment on Netlify
1. **Create a GitHub Repository**:
   - Push this project to a GitHub repository.

2. **Deploy to Netlify**:
   - Sign up/log in to Netlify (https://app.netlify.com).
   - Click "New site from Git" and connect your GitHub repository.
   - Set the build command to blank (no build step needed).
   - Set the publish directory to `.` (root directory).
   - Deploy the site.

3. **Access the Site**:
   - Netlify will provide a URL (e.g., `https://lmxar-webhook-spammer.netlify.app`).

## Usage
- Enter a valid Discord webhook URL, message, and delay.
- Click "Start Spamming" to begin sending messages.
- Click "Stop Spamming" to halt and choose whether to delete the webhook.
- Monitor success or rate limit messages in the bottom-right corner.
