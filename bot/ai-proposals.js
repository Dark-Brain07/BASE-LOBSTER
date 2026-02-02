const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROPOSAL_TOPICS = {
    charity_donation: {
        name: "Charity Donation",
        emoji: "💝",
        prompts: [
            "ocean cleanup initiative",
            "education funding for underprivileged children",
            "food bank support",
            "environmental conservation"
        ]
    },
    community_event: {
        name: "Community Event",
        emoji: "🎉",
        prompts: [
            "virtual community meetup",
            "governance workshop",
            "developer hackathon",
            "community AMA session"
        ]
    },
    feature_request: {
        name: "Feature Request",
        emoji: "⚡",
        prompts: [
            "new governance dashboard feature",
            "mobile app development",
            "multi-language support",
            "analytics dashboard"
        ]
    },
    partnership_proposal: {
        name: "Partnership",
        emoji: "🤝",
        prompts: [
            "partnership with other DAOs",
            "collaboration with Base ecosystem projects",
            "integration with DeFi protocols",
            "media partnership"
        ]
    }
};

async function generateProposal(category) {
    const topic = PROPOSAL_TOPICS[category];
    if (!topic) throw new Error(`Unknown category: ${category}`);

    const randomPrompt = topic.prompts[Math.floor(Math.random() * topic.prompts.length)];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are crafting a governance proposal for the BASE LOBSTER ($BLSTR) DAO on Base blockchain.

Category: ${topic.name} ${topic.emoji}
Topic Focus: ${randomPrompt}

Requirements:
- The proposal must be halal-compliant (no gambling, no speculation)
- Focus on community benefit and ethical outcomes
- Be specific and actionable
- Include clear success metrics

Generate a proposal in the following JSON format:
{
  "title": "Short, descriptive title (max 60 chars)",
  "description": "Detailed proposal description in markdown format (200-400 words). Include background, objectives, implementation plan, and expected outcomes.",
  "amount": "If requesting treasury funds, specify amount in ETH (e.g., '0.1'), otherwise 'null'",
  "category": "${category}"
}

Return ONLY the JSON object, no other text.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const proposal = JSON.parse(jsonMatch[0]);
        proposal.isAIGenerated = true;
        proposal.generatedAt = new Date().toISOString();

        return proposal;
    } catch (error) {
        console.error("Error generating proposal:", error.message);
        throw error;
    }
}

async function generateMultipleProposals(count = 3) {
    const categories = Object.keys(PROPOSAL_TOPICS);
    const proposals = [];

    for (let i = 0; i < count; i++) {
        const category = categories[i % categories.length];
        try {
            const proposal = await generateProposal(category);
            proposals.push(proposal);
            console.log(`✅ Generated proposal: ${proposal.title}`);
            await new Promise(r => setTimeout(r, 2000)); // Rate limiting
        } catch (error) {
            console.error(`❌ Failed to generate proposal for ${category}:`, error.message);
        }
    }

    return proposals;
}

module.exports = { generateProposal, generateMultipleProposals, PROPOSAL_TOPICS };
