import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart"
import { prisma } from "../lib/prisma";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream"
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {

  app.register(fastifyMultipart, {
    limits: {
      files: 1,
      fieldSize: 1_040_576 * 25 // 25MB
    }
  });

  app.post("/videos", async (request, reply) => {

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const extension = path.extname(data.filename);

    if (extension !== ".mp3") {
      return reply.status(400).send({ error: "Invalid input type, please upload a MP3" });
    }

    const fileBaseName = path.basename(data.filename, extension);

    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

    if (!fs.existsSync(path.resolve(__dirname, '../../temp'))) {
      fs.mkdirSync(path.resolve(__dirname, '../../temp'));
    }

    const uploadDestination = path.resolve(__dirname, '../../temp', fileUploadName);

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination
      }
    });

    return reply.send(video)
  });
}