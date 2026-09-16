import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const qwen = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL,
  });

  try {
    console.log("🔍 Listando modelos disponibles...\n");
    
    // Intenta listar modelos (algunos endpoints lo permiten)
    const models = await (qwen.models as any).list();
    console.log("Modelos disponibles:");
    models.data.forEach((model: any) => {
      console.log(`- ${model.id}`);
    });
  } catch (error: any) {
    console.log("⚠️ El endpoint de listado no está disponible");
    console.log("Error:", error.message);
    
    // Prueba con diferentes nombres de modelos
    console.log("\n🧪 Probando modelos comunes:\n");
    
    const modelsToTest = [
      "text-embedding-v1",
      "text-embedding-v2",
      "text-embedding-aliyun-v1",
      "qwen-dense-text-embedding",
      "qwen-embedding-v1",
      "embedding-v1",
      "text_embedding_v3",
      "text_embedding_v1",
    ];

    for (const model of modelsToTest) {
      try {
        console.log(`Probando: ${model}...`);
        const response = await qwen.embeddings.create({
          model: model,
          input: "test",
        });
        console.log(`✅ ¡ÉXITO! Modelo '${model}' funciona`);
        console.log(`   Dimensiones: ${response.data[0]?.embedding?.length}`);
        break;
      } catch (err: any) {
        console.log(`   ❌ No funciona: ${err.error?.message || err.message}`);
      }
    }
  }
}

listModels().catch(console.error);