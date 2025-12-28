
import { GoogleGenAI } from "@google/genai";

export async function generateStudioPortrait(
  imageSource1: string,
  imageSource2: string | null,
  posePrompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data1 = imageSource1.replace(/^data:image\/\w+;base64,/, '');
  const parts: any[] = [
    {
      inlineData: {
        data: base64Data1,
        mimeType: 'image/png',
      },
    }
  ];

  let identityProtocol = `
    MASTER IDENTITY LOCK SYSTEM:
    - THE SUBJECT: Use the exact facial features, skin tone, hair texture, and facial hair of the person in Image 1.
    - ACCESSORIES: Critical! If the subject in Image 1 is wearing GLASSES, EARRINGS, PIERCINGS, or any HEADWEAR (Hat/Cap), these MUST be rendered identically in the result.
  `;
  
  if (imageSource2) {
    const base64Data2 = imageSource2.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        data: base64Data2,
        mimeType: 'image/png',
      },
    });
    identityProtocol += `
    - SECOND SUBJECT: Apply the same 1:1 Identity and Accessory lock for the person in Image 2.
    `;
  }

  const masterSystemPrompt = `
    ${identityProtocol}

    POSE TRANSFER TASK:
    The subject(s) must be reimagined in a professional studio photography session.
    
    STRICT POSE SPECIFICATION:
    ${posePrompt}
    
    TECHNICAL EXECUTION:
    - Replace the user's original pose with the POSE SPECIFICATION provided.
    - Render the clothing and background exactly as described in the prompt parts.
    - Ensure perfect volumetric lighting that matches the new studio environment while maintaining the integrity of the subject's face.
    - Final output must be an 8K Masterpiece, photorealistic, indistinguishable from a real high-end studio photograph.
  `;

  parts.push({ text: masterSystemPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    let generatedImageUrl = '';
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
        throw new Error("O motor de imagem não retornou dados. Tente uma foto com iluminação melhor.");
    }
    return generatedImageUrl;
  } catch (error: any) {
    console.error("Studio Engine Error:", error);
    throw new Error(error.message || "Erro na geração da pose. Verifique se o rosto está bem visível.");
  }
}
