import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Receipt from "@/lib/models/receipt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_name, date, total_amount, currency, items } = body;
    console.log("Saving items:", JSON.stringify(items));

    await dbConnect();

    const receipt = new Receipt({
      merchant_name,
      date,
      total_amount,
      currency,
      items: items ?? [],
    });

    await receipt.save();

    return NextResponse.json({ success: true, id: receipt._id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Failed to save receipt" }, { status: 500 });
  }
}
