import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video-";
import { generateAICompletionRoute } from "./routes/generate-ai-completion";
import { createTranscriptionRoute } from "./routes/create-transcriptions";
const app = fastify();


app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAICompletionRoute);

app.register(fastifyCors, {
  origin: "*",
})

app.listen({
  port: 3333,
}).then((address) => {
  console.log(`Server is listening on ${address}`);
});