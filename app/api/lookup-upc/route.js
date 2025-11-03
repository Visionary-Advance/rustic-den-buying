import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const upc = searchParams.get('upc');

  if (!upc) {
    return NextResponse.json(
      { error: 'UPC code is required' },
      { status: 400 }
    );
  }

  if (upc.length < 3) {
    return NextResponse.json(
      { error: 'UPC code must be at least 3 characters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.UPC_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'API key not configured. Please add your UPC Database API key to .env.local' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.upcdatabase.org/search/?query=${encodeURIComponent(upc)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 403 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No products found for this UPC code' },
          { status: 404 }
        );
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('UPC lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup UPC code' },
      { status: 500 }
    );
  }
}
