export default defineSkill({
  name: "personalizeDoc",
  description: "Rewrite textbook content for a specific level",
  args: { doc_id: "string", level: "string" },

  async run({ doc_id, level }, { openai }) {
    const content = await loadDocMarkdown(doc_id);

    const prompt = `
Rewrite the textbook chapter for a ${level} student.
Keep structure, simplify examples, and improve clarity.
    
CONTENT:
${content}
`;

    const res = await openai.responses.create({
      model: "gpt-4.1",
      input: prompt
    });

    return res.output_text;
  }
});
