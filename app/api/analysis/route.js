import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from '@/lib/mongodb';
import Analysis from '@/models/Analysis';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        message: "Unauthorized",
        success: false,
      }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Ensure the email matches the authenticated user
    if (data.email !== session.user.email) {
      return NextResponse.json({
        message: "Invalid user email",
        success: false,
      }, { status: 400 });
    }

    // Validate required fields
    if (!data.business_name || !data.industry || !data.geographical_focus || !data.target_market) {
      return NextResponse.json({
        message: "Missing required fields",
        success: false,
      }, { status: 400 });
    }

    // Ensure political_factors object exists
    if (!data.political_factors) {
      data.political_factors = {
        government_policies: false,
        political_stability: false,
        tax_regulations: false,
        industry_regulations: false,
        global_trade_agreements: false,
        notes: '',
      };
    }

    const analysis = await Analysis.create(data);

    return NextResponse.json({
      message: "Analysis created successfully",
      success: true,
      data: analysis
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      message: "Failed to create analysis",
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        message: "Unauthorized",
        success: false,
      }, { status: 401 });
    }

    await connectDB();
    const analyses = await Analysis.find({ email: session.user.email }).sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Analyses retrieved successfully",
      success: true,
      data: analyses
    });

  } catch (error) {
    return NextResponse.json({
      message: "Failed to retrieve analyses",
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
