# OBD Diagnostic App - Setup Instructions

## 🔑 API Key Setup (For New Developers)

If you've just cloned this repo, you need to add the Anthropic API key to run the AI features.

### Step 1: Create Your Config File

1. Navigate to the `src` folder
2. Copy `config.example.ts` and rename it to `config.local.ts`:
   ```bash
   cp src/config.example.ts src/config.local.ts
   ```

### Step 2: Add the API Key

1. Open `src/config.local.ts`
2. Replace `'YOUR_API_KEY_HERE'` with the actual API key
3. Ask your teammate for the API key (via Slack, text, etc.)
4. Save the file

The file should look like:
```typescript
export const config = {
  anthropicApiKey: 'sk-ant-api03-actual-key-goes-here',
};
```

### Step 3: Install Dependencies

```bash
# Install npm packages
npm install

# Install iOS dependencies
cd ios && pod install && cd ..
```

### Step 4: Run the App

```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

---

## 🔒 Security Note

**NEVER commit `src/config.local.ts` to GitHub!**

This file is already in `.gitignore`, so it won't be accidentally committed. The API key should only be shared privately between team members.

---

## 📱 Testing the AI

Once set up:
1. Open the app
2. Go to the "AI Assistant" tab
3. Send a message to test the Claude AI integration
4. If you see real AI responses (not mock), it's working!

---

## 💰 API Credits

We're using a shared Anthropic API account for development. The key has pay-as-you-go credits. Be mindful of usage during development.

For production deployment, we'll implement a subscription model where users pay for unlimited AI diagnostics.

---

## 🐛 Troubleshooting

**"Credit balance too low" error:**
- Ask the account owner to add more credits at console.anthropic.com/settings/billing

**"Cannot find module config.local":**
- Make sure you created `src/config.local.ts` (step 1-2 above)

**Metro bundler issues:**
- Try `npm start -- --reset-cache`
- Or restart Metro and rebuild
