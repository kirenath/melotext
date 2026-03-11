import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { NextResponse } from "next/server";

/** 允许的音频 MIME 类型 */
const ALLOWED_TYPES = new Set([
  "audio/mpeg",    // .mp3
  "audio/wav",     // .wav
  "audio/flac",    // .flac
  "audio/mp4",     // .m4a
  "audio/x-m4a",   // .m4a (变体)
]);

/** 允许的文件扩展名 */
const ALLOWED_EXTENSIONS = new Set(["mp3", "wav", "flac", "m4a"]);

/** 最大文件大小 100MB（CF Tunnel 限制） */
const MAX_SIZE = 100 * 1024 * 1024;

export async function POST(req: Request) {
  const { filename, filetype } = await req.json();

  // 校验参数存在
  if (!filename || !filetype) {
    return NextResponse.json(
      { error: "缺少文件名或文件类型" },
      { status: 400 }
    );
  }

  // 校验文件扩展名
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `不支持的文件格式（.${ext}），仅允许 MP3、WAV、FLAC、M4A` },
      { status: 400 }
    );
  }

  // 校验 MIME 类型
  if (!ALLOWED_TYPES.has(filetype)) {
    return NextResponse.json(
      { error: `不支持的文件类型（${filetype}）` },
      { status: 400 }
    );
  }

  const key = `audio-${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: filetype,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 1800 }); // 30分钟
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

  return Response.json({ url, publicUrl, key });
}
