import { NextResponse } from 'next/server';
import getConfig from 'next/config';

export async function GET() {
  // Get only the public configuration
  const { publicRuntimeConfig } = getConfig();
  
  // Return only the necessary public settings
  return NextResponse.json({
    publicRuntimeConfig: {
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: publicRuntimeConfig.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    }
  });
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
