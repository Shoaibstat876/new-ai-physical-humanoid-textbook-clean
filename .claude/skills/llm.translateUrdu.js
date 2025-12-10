export default defineSkill({
  name: "translateUrdu",
  description: "Translate English to Urdu",
  args: { text: "string" },

  async run({ text }, { openai }) {
    const res = await openai.responses.create({
      model: "gpt-4.1",
      input: `Translate this to Urdu:\n${text}`
    });

    return res.output_text;
  }
});
