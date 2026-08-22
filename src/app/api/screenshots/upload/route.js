import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Image file is required." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Only PNG, JPG and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: "Image must be smaller than 5MB.",
        },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop();

    const fileName = `${session.user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const { error: uploadError } = await supabase.storage
      .from("memory-images")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) {
  console.error("Storage error:", uploadError);

  return NextResponse.json(
    {
      message: "Failed to upload image.",
    },
    { status: 500 }
  );
}

    const { data: publicUrlData } =
      supabase.storage
        .from("memory-images")
        .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const screenshot = await prisma.screenshot.create({
      data: {
        userId: session.user.id,
        imageUrl,
        fileName,
        status: "uploaded",
      },
    });

    return NextResponse.json(
      {
        message: "Screenshot uploaded successfully.",
        screenshot,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}