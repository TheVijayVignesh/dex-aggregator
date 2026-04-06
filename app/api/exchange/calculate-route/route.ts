import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { findOptimalRouteWithDetails } from '@/lib/services/pathfinding';
import { z } from 'zod';

// Input validation schema
const calculateRouteSchema = z.object({
  fromCurrency: z.string().min(1).max(10),
  toCurrency: z.string().min(1).max(10),
  amount: z.number().min(0.00000001).max(1000000000),
});

export async function POST(request: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to calculate exchange routes' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = calculateRouteSchema.parse(body);

    console.log(`🔄 Route calculation request: ${validatedData.amount} ${validatedData.fromCurrency} → ${validatedData.toCurrency} for user ${userId}`);

    // Calculate optimal route
    const result = await findOptimalRouteWithDetails(
      validatedData.fromCurrency,
      validatedData.toCurrency,
      validatedData.amount
    );

    // Return successful result
    return NextResponse.json({
      success: true,
      data: {
        userId,
        ...result,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Route calculation error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      if (error.message.includes('not found in market data')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('No exchange path found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 422 }
        );
      }
    }

    // Handle unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing available currencies
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This would be implemented to return available currencies
    // For now, return a sample list
    const availableCurrencies = [
      'USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY',
      'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'DOT', 'DOGE'
    ];

    return NextResponse.json({
      success: true,
      data: {
        availableCurrencies,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Available currencies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
