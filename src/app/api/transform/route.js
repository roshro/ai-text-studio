import Groq from "groq-sdk";

function buildInstructions(mode, target, tone) {
    const base = "You are a helpful writing assistant. Be clear, consise, and your responses should be easily reusable. Do not add extra commentary.";

    if(mode === "summarize") {
        return `${base} Summarize the given text into maximum of 5 bullet points`;
    }
    else if(mode === "rewrite") {
        return `${base} Rewrite the given text into a ${tone ? tone : "simple"} tone. You should preserve the meaning.`
    }
    else {
        return `${base} Translate the given statements to ${target}. Do not change the names or products mentioned.`
    }
}

export async function POST(req) {
    try {
        const {input, mode, tone, target} = await req.json();

        const cleanedInput = input ? input.trim(): "";

        if(!cleanedInput) {
            return Response.json({error: "Text required"}, {status: 400});
        }

        const client = new Groq({apiKey: process.env.GROQ_API_KEY});

        const aiResponse = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: buildInstructions(mode, target, tone),
                },
                {
                    role: "user",
                    content: cleanedInput,
                },
            ],
            temperature: 0.7,
        });

        return Response.json({
            output:
                aiResponse.choices?.[0]?.message?.content || "",
        });
    }
    catch(err) {
        return Response.json({
            error: `Server error ${err}`,
            status: 500
        })
    }
}