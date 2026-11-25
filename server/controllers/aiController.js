const { generateAIResponse } = require("../utils/ai");

const testAI = async (req, res) => {
  try {
    const result = await generateAIResponse(
      "Reply with exactly: AI is working"
    );

    res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.error("AI Test Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testAI,
};