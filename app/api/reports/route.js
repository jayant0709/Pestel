import { connectMongoDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, content } = await req.json();
    await connectMongoDB();
    await Report.create({ email, content });
    return NextResponse.json({ message: "Report saved" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
