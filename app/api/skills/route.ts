import { NextResponse } from "next/server";
import { getAllSkills } from "@/server/queries/skills";

export async function GET() {
  try {
    const skills = await getAllSkills();
    return NextResponse.json(skills);
  } catch (error: any) {
    console.error("Error in /api/skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills", details: error.message },
      { status: 500 }
    );
  }
}

