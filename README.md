# AskPix AI

This is a Next.js application that uses AI to solve questions from an image. It is designed to be deployed to Vercel and built as a native Android app using Capacitor.

## Deploying to Vercel (Web App)

The web version of this application, which includes the AI server, can be deployed for free on Vercel.

1.  **Connect to GitHub:** Push your project to a GitHub repository.
2.  **Import to Vercel:** Go to your [Vercel dashboard](https://vercel.com/new) and import the project from your GitHub repository. Vercel will automatically detect it as a Next.js app.
3.  **Add Environment Variable:** Before deploying, you must add your AI API key as an environment variable.
    *   In the Vercel project settings, go to "Environment Variables".
    *   Add a new variable with the name `GENAI_API_KEY` and paste your Google AI API key as the value.
4.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application.
5.  **Get URL:** Once deployed, Vercel will provide you with a public URL (e.g., `https://your-project-name.vercel.app`). You will need this for the Android app build.

## Building the Android App

The Android app is a native shell that loads your deployed Vercel web app. It requires the web app to be deployed first.

1.  **Deploy to Vercel:** Follow the steps above to deploy the web app and get your public URL.
2.  **Configure API URL:** You need to tell the Android build where your live AI server is. Open a terminal and run the following command, replacing `<your-vercel-url>` with the URL you got from Vercel:

    ```bash
    NEXT_PUBLIC_API_BASE_URL=https://<your-vercel-url> npm run cap:sync
    ```
    This command rebuilds the app with the correct server URL and syncs it with the Android project.
3.  **Build in Android Studio:**
    *   Open Android Studio.
    *   Choose "Open an existing project".
    *   Navigate to your project's `android` folder and open it.
    *   Wait for Gradle to sync.
    *   Build the app using "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)".
    *   The final `app-debug.apk` file can be found in `android/app/build/outputs/apk/debug/`.
