export default defineSkill({
  name: "getUserPreferredLevel",
  description: "Get personalization level from BetterAuth user",
  async run(_, { http }) {
    const user = await http.get("http://localhost:3005/auth/me");
    return { level: user.preferredLevel || "beginner" };
  }
});
