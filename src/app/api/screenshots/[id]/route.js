import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const memory = await prisma.screenshot.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!memory) {
      return NextResponse.json(
        { message: "Memory not found." },
        { status: 404 }
      );
    }

    const { error: storageError } =
      await supabase.storage
        .from("memory-images")
        .remove([memory.fileName]);

    if (storageError) {
      console.error(
        "Storage deletion error:",
        storageError
      );
    }

    await prisma.screenshot.delete({
      where: {
        id: memory.id,
      },
    });

    return NextResponse.json({
      message: "Memory deleted successfully.",
    });
  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}