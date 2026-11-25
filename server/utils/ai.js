const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIResponse = async (prompt) => {
  try {
    console.log("OpenAI API key exists:",
      !!process.env.OPENAI_API_KEY
    );

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: prompt,
    });

    console.log("OpenAI response received");

    return response.output_text;
  } catch (error) {
    console.error("========== OPENAI ERROR ==========");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Type:", error.type);
    console.error("==================================");

    throw error;
  }
};

module.exports = {
  generateAIResponse,
};