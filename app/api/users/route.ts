import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    await connectDB();
    
    const query = type ? { account_type: type } : {};
    const users = await User.find(query)
      .select("-password")
      .sort({ created_at: -1 });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}