import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { ingredients } = await request.json();

        if (!ingredients || ingredients.length === 0) {
            return NextResponse.json(
                { error: "No ingredients provided" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use a specific model version to avoid 404s
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        const ingredientList = ingredients
            .map((i: any) => `- ${i.name} ${i.quantity ? `(${i.quantity})` : ""}`)
            .join("\n");

        const prompt = `
      Tu es un chef étoilé expert en cuisine créative et anti-gaspillage.
      Voici les ingrédients dont je dispose dans ma cuisine :
      ${ingredientList}

      Ton objectif est de générer une recette délicieuse et réalisable avec ces ingrédients.
      Tu peux suggérer d'ajouter quelques ingrédients de base (sel, poivre, huile, eau) si nécessaire, mais essaie de t'en tenir au stock principal.

      Génère la réponse au format HTML (sans balises <html> ou <body>, juste le contenu) pour l'intégrer directement dans une div.
      Utilise des balises <h3>, <h4>, <ul>, <li>, <p>, <strong>.
      Sois chaleureux et précis. Donne un titre créatif à la recette.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanHtml = text.replace(/```html/g, "").replace(/```/g, "");

        return NextResponse.json({ recipe: cleanHtml });
    } catch (error: any) {
        console.error("Error generating recipe:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate recipe" },
            { status: 500 }
        );
    }
}
