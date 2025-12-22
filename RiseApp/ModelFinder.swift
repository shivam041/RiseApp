import SwiftUI

struct ModelFinder: View {
    @State private var models: [String] = []
    @State private var status = "Tap 'Scan' to find available models..."
    
    // ⚠️ PASTE YOUR KEY HERE
    private let apiKey = "AIzaSyA9Fjaa8zs9AcX5zX6YoE_DNg0YBNO79Rs"
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 20) {
                Text("Gemini Model Scanner")
                    .font(.title).bold()
                    .foregroundStyle(.cyan)
                
                Text(status)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .padding()
                
                Button("SCAN FOR MODELS") {
                    fetchModels()
                }
                .padding()
                .background(Color.cyan)
                .foregroundStyle(.black)
                .cornerRadius(10)
                
                List(models, id: \.self) { model in
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text(model)
                            .foregroundStyle(.black)
                            .bold()
                    }
                    .onTapGesture {
                        print("Selected: \(model)")
                    }
                }
                .scrollContentBackground(.hidden)
            }
        }
    }
    
    func fetchModels() {
        guard !apiKey.isEmpty, !apiKey.contains("PASTE") else {
            status = "⚠️ Add API Key first!"
            return
        }
        
        status = "Scanning Google's servers..."
        let urlString = "https://generativelanguage.googleapis.com/v1beta/models?key=\(apiKey)"
        guard let url = URL(string: urlString) else { return }
        
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let modelsList = json["models"] as? [[String: Any]] {
                    
                    // Filter for "generateContent" capable models
                    let availableModels = modelsList.compactMap { dict -> String? in
                        guard let name = dict["name"] as? String,
                              let methods = dict["supportedGenerationMethods"] as? [String],
                              methods.contains("generateContent") else { return nil }
                        // Remove "models/" prefix for cleaner reading
                        return name.replacingOccurrences(of: "models/", with: "")
                    }
                    
                    await MainActor.run {
                        self.models = availableModels
                        self.status = "Found \(availableModels.count) active models!"
                    }
                } else {
                    await MainActor.run { status = "Failed to parse list." }
                    print(String(data: data, encoding: .utf8) ?? "Raw Data")
                }
            } catch {
                await MainActor.run { status = "Error: \(error.localizedDescription)" }
            }
        }
    }
}

#Preview {
    ModelFinder()
}
