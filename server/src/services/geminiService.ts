import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractPrescriptionData = async (imageBase64: string, mimeType: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
    Analyze this prescription image and extract the following information in strict JSON format:
    {
      "doctorName": "string or null",
      "doctorSpecialty": "string or null",
      "doctorReg": "string or null",
      "clinicName": "string or null",
      "medicines": [
        {
          "brandedName": "string",
          "dosage": "string",
          "duration": "string"
        }
      ],
      "ocrConfidence": number (0 to 100 representing your confidence in the extraction)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType,
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text();
    if (!text) {
        throw new Error("Empty response from Gemini");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini OCR Error:', error);
    throw new Error('Failed to process prescription image via AI');
  }
};

export const matchDrugs = async (molecules: string[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
    For the following active pharmaceutical ingredients (molecules), identify their typical drug class and provide a confidence score (0-100) for your identification.
    Molecules: ${molecules.join(', ')}

    Return the result in strict JSON format:
    {
      "matches": [
        {
          "name": "string (the molecule name)",
          "drugClass": "string",
          "confidence": number
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text();
    if (!text) {
        throw new Error("Empty response from Gemini");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Drug Match Error:', error);
    throw new Error('Failed to match drugs via AI');
  }
};
