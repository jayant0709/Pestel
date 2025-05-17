import { connectMongoDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import Analysis from "@/models/Analysis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data || !data.analysis_id) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Verify the analysis exists and belongs to the user
    const analysis = await Analysis.findOne({
      _id: data.analysis_id,
      email: session.user.email,
    });

    if (!analysis) {
      return NextResponse.json(
        {
          message: "Analysis not found or doesn't belong to the user",
          success: false,
        },
        { status: 404 }
      );
    }

    // Create the report with the full data structure
    const report = await Report.create({
      email: session.user.email,
      analysis_id: data.analysis_id,
      individual_reports: data.individual_reports || {},
      final_report: data.final_report || {},
      report: data.report || {},
      success: data.success || true,
      timestamp: data.timestamp || new Date(),
    });

    return NextResponse.json(
      {
        message: "Report saved successfully",
        success: true,
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Failed to save report",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET handler to retrieve reports for the authenticated user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const analysis_id = url.searchParams.get("analysis_id");

    await connectMongoDB();

    let query = { email: session.user.email };

    // If analysis_id is provided, filter by it
    if (analysis_id) {
      query.analysis_id = analysis_id;
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate("analysis_id", "business_name industry");

    return NextResponse.json({
      message: "Reports retrieved successfully",
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve reports",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
