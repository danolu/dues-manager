import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    return NextResponse.json({ error: "Settings not configured" }, { status: 404 });
  }

  const due = await prisma.due.findFirst({
    where: {
      userId: session.id,
      tenure: settings.tenure
    }
  });

  if (!due) {
    return NextResponse.json({ error: "Kindly pay your dues." }, { status: 404 });
  }

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json({
      receipt: {
        organization: settings.name,
        tenure: settings.tenure,
        amount: due.amount.toString(),
        ref: due.ref,
        paidAt: due.createdAt
      }
    });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  page.drawText(`${settings.name} - Dues Receipt`, {
    x: 50,
    y: height - 70,
    font: bold,
    size: 20,
    color: rgb(0.1, 0.1, 0.1)
  });

  const rows = [
    `Tenure: ${settings.tenure}`,
    `Amount: ${due.amount.toString()}`,
    `Reference: ${due.ref}`,
    `Paid At: ${new Date(due.createdAt).toISOString()}`
  ];

  rows.forEach((line, index) => {
    page.drawText(line, {
      x: 50,
      y: height - 120 - index * 24,
      font,
      size: 13,
      color: rgb(0.2, 0.2, 0.2)
    });
  });

  const bytes = await pdf.save();
  const filename = `${settings.name.replace(/\s+/g, "_")}_Due_${settings.tenure}_receipt.pdf`;
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${filename}\"`
    }
  });
}
