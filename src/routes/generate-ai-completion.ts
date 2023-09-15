import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { openai } from "../lib/openai";



export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post("/ai/complete", async (request, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { videoId, template, temperature } = bodySchema.parse(request.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    });

    if (!video.transcription) {
      return reply.status(400).send({
        message: "Video does not have a transcription yet",
      });
    }

    const promptMessage = template.replace("{transcription}", video.transcription);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature,
      messages: [
        { role: 'user', content: promptMessage },
      ]
    });

    return response;
  });
}