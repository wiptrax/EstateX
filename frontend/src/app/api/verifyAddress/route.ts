import { NextResponse } from "next/server";

const VALID_ADMIN_ADDRESS = "3a94baaef8c1ac6fd16bbf8dc6c6393655f65ab0";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ success: false, message: "Address is required" }, { status: 400 });
    }

    if (address === VALID_ADMIN_ADDRESS) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
