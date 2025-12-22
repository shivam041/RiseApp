import Foundation

struct ChatMessage: Identifiable, Equatable {
    let id = UUID()
    let text: String
    let isUser: Bool
    let date: Date
}

class GeminiService {
    static let shared = GeminiService()
    
    // ⚠️ KEEP YOUR KEY HERE
    private let apiKey = "AIzaSyA9Fjaa8zs9AcX5zX6YoE_DNg0YBNO79Rs"
    
    func sendMessage(message: String, context: String) async throws -> String {
        if apiKey.isEmpty || apiKey.contains("PASTE_YOUR_KEY") {
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            return "⚠️ Please paste your API Key into GeminiService.swift!"
        }
        
        let model = "gemini-2.5-flash" // The working model from your scanner
        let urlString = "https://generativelanguage.googleapis.com/v1beta/models/\(model):generateContent?key=\(apiKey)"
        
        guard let url = URL(string: urlString) else { return "Error: Invalid URL" }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // --- NEW: INTELLIGENT PROMPT WITH TOOLS ---
        let fullPrompt = """
        SYSTEM INSTRUCTION:
        You are Rise AI, an elite productivity coach.
        
        CAPABILITIES:
        1. If the user asks to ADD A TASK (e.g. "Remind me to call mom", "Add task Gym"), you must output a JSON command.
           FORMAT: {"action": "create_task", "title": "Call Mom"}
           
        2. If the user asks for ADVICE, reply normally as a coach (concise, intense).
        
        USER DATA CONTEXT:
        \(context)
        
        USER QUESTION:
        \(message)
        
        IMPORTANT: If you output JSON, output ONLY JSON. Do not add markdown or extra text.
        """
        
        let body: [String: Any] = [
            "contents": [ [ "parts": [ ["text": fullPrompt] ] ] ]
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let candidates = json["candidates"] as? [[String: Any]],
           let content = candidates.first?["content"] as? [String: Any],
           let parts = content["parts"] as? [[String: Any]],
           let text = parts.first?["text"] as? String {
            
            // Clean up any potential markdown formatting from the AI
            return text.replacingOccurrences(of: "```json", with: "")
                       .replacingOccurrences(of: "```", with: "")
                       .trimmingCharacters(in: .whitespacesAndNewlines)
        }
        
        return "Error: Could not decode Gemini response."
    }
}
