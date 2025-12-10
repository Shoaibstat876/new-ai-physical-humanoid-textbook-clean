export default defineSkill({
  name: "answer",
  description: "Answer a question using provided context",
  args: { context: "string", question: "string" },

  async run({ context, question }, { openai }) {
    const prompt = `
You are an AI textbook tutor. Use the given context to answer.

CONTEXT:
${context}

QUESTION:
${question}
`;

    const res = await openai.responses.create({
      model: "gpt-4.1",
      input: prompt
    });

    return res.output_text;
  }
});
