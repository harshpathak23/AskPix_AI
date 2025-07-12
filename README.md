# AskPix AI

This is a Next.js application that uses AI to solve questions from an image. It is designed to be deployed to Vercel and built as a native Android app using Capacitor.

## Deploying to Vercel (Web App)

The web version of this application, which includes the AI server, can be deployed for free on Vercel.

1.  **Connect to GitHub:** Push your project to a GitHub repository.
2.  **Import to Vercel:** Go to your [Vercel dashboard](https://vercel.com/new) and import the project from your GitHub repository. Vercel will automatically detect it as a Next.js app.
3.  **Add Environment Variables:** Before deploying, you must add two environment variables for your AI and YouTube API keys.
    *   In your Vercel project settings, go to "Environment Variables".
    *   Add a variable named `GENAI_API_KEY` and paste your Google AI API key as the value.
    *   Add another variable named `YOUTUBE_API_KEY` and paste your restricted YouTube Data API v3 key as the value.
4.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application.
5.  **Get URL:** Once deployed, Vercel will provide you with a public URL (e.g., `https://your-project-name.vercel.app`). You will need this for the Android app build.

## Building the Android App (via GitHub)

The Android app can be built automatically using GitHub Actions. This is the recommended method.

1.  **Deploy to Vercel:** Follow the steps above to deploy the web app and get your public URL.
2.  **Add GitHub Secret:** You must provide your Vercel URL to the GitHub build process.
    *   In your GitHub repository, go to "Settings" > "Secrets and variables" > "Actions".
    *   Click "New repository secret".
    *   Create a secret named `VERCEL_URL` and paste your full Vercel deployment URL as the value.
3.  **Run the Build Workflow:**
    *   Go to the "Actions" tab in your GitHub repository.
    *   In the left sidebar, click on "Build Android APK for Testing".
    *   Click the "Run workflow" button on the right, and then click the green "Run workflow" button in the dropdown.
4.  **Download the APK:**
    *   The build will take a few minutes. Once it's complete, click on the completed workflow run.
    *   Under the "Artifacts" section, you will see `app-debug`. Click it to download the `app-debug.apk` file.
    *   You can then transfer and install this APK file on your Android device.

## Restricting Your YouTube API Key

For security, it is crucial to restrict your YouTube API key so it can only be used for the YouTube Data API.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Click on the name of your API key.
3.  Under **API restrictions**, select "Restrict key".
4.  In the dropdown, select the **"YouTube Data API v3"** and click OK.
5.  Save the changes.
