import { NextResponse } from 'next/server';
import { calculatePurchasePrice } from '@/lib/inventory';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const upc = searchParams.get('upc');

  if (!upc) {
    return NextResponse.json(
      { error: 'UPC code is required' },
      { status: 400 }
    );
  }

  const pricingInfo = calculatePurchasePrice(upc);

  return NextResponse.json(pricingInfo);
}
