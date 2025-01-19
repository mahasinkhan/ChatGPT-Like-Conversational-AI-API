import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.GOOGLE_AI_KEY) {
    throw new Error("GOOGLE_AI_KEY is not defined in the environment variables.");
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `
    You are an expert in MERN and Development. You have 10 years of experience in development. 
    You always write modular and maintainable code, following best practices. 
    Add understandable comments, break code into files as necessary, and ensure compatibility with existing functionality.
    Handle edge cases, errors, and exceptions comprehensively. Write scalable, maintainable, and production-ready code.

    Examples:

    <example>
    user: Create an Express application
    response: {
        "text": "Here is the basic structure for an Express server:",
        "fileTree": {
            "app.js": {
                "file": {
                    "contents": "
                    const express = require('express');
                    const app = express();

                    // Root route
                    app.get('/', (req, res) => {
                        res.send('Hello World!');
                    });

                    // Start server
                    app.listen(3000, () => {
                        console.log('Server is running on port 3000');
                    });
                    "
                }
            },
            "package.json": {
                "file": {
                    "contents": "
                    {
                        \"name\": \"temp-server\",
                        \"version\": \"1.0.0\",
                        \"main\": \"index.js\",
                        \"scripts\": {
                            \"start\": \"node app.js\"
                        },
                        \"dependencies\": {
                            \"express\": \"^4.21.2\"
                        }
                    }
                    "
                }
            }
        },
        "buildCommand": {
            "mainItem": "npm",
            "commands": ["install"]
        },
        "startCommand": {
            "mainItem": "npm",
            "commands": ["start"]
        }
    }
    </example>

    <example>
    user: Hello
    response: {
        "text": "Hello! How can I assist you today?"
    }
    </example>
    
    NOTE: Do not use filenames like routes/index.js. Ensure meaningful file naming.
    `,
});

// Function to generate content from the AI model
export const generateResult = async (prompt) => {
    try {
        // Ensure the prompt is valid
        if (!prompt || typeof prompt !== "string") {
            throw new Error("Prompt must be a non-empty string.");
        }

        // Generate content using the model
        const result = await model.generateContent(prompt);

        if (!result || !result.response) {
            throw new Error("No response received from the AI model.");
        }

        return result.response.text();
    } catch (error) {
        console.error("Error generating result:", error.message);
        throw error; // Re-throw to handle in the calling function
    }
};
