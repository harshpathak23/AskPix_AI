
import { NextResponse } from 'next/server';

/**
 * This API route is intentionally disabled.
 * The application uses Next.js Server Actions (`src/app/actions.ts`) for this functionality,
 * as API routes are not compatible with the static export (`output: 'export'`)
 * required for the Capacitor build. This file is left here with inert content
 * to prevent build errors related to its absence, but it removes the problematic
 * import of server-side Genkit code that was crashing the `next build` process.
 */
export async function POST(req: Request) {
  return NextResponse.json(
    { error: 'This API route is disabled. Please use the appropriate Server Action.' },
    { status: 404 }
  );
}
