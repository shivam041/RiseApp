import SwiftUI
import SwiftData

struct AICoachView: View {
    // 1. THE MISSING PIECE: The Database Connection
    // This was missing, which caused the "no member insert" error
    @Environment(\.modelContext) private var modelContext
    
    // Access Data to feed the AI
    @Query private var tasks: [DailyTask]
    @Query private var habits: [Habit]
    
    @State private var messages: [ChatMessage] = [
        ChatMessage(text: "Ready to dominate the day? Ask me anything about your schedule.", isUser: false, date: Date())
    ]
    @State private var inputText = ""
    @State private var isTyping = false
    
    var body: some View {
        ZStack {
            // 1. Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // 2. Header
                HStack {
                    Text("RISE INTELLIGENCE")
                        .font(.system(size: 14, weight: .black, design: .monospaced))
                        .foregroundStyle(.purple)
                        .tracking(2)
                    Spacer()
                    Image(systemName: "brain.head.profile")
                        .foregroundStyle(.purple)
                }
                .padding()
                .background(.ultraThinMaterial)
                
                // 3. Chat Area
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 15) {
                            ForEach(messages) { msg in
                                ChatBubble(message: msg)
                            }
                            
                            if isTyping {
                                HStack {
                                    TypingIndicator()
                                    Spacer()
                                }
                                .padding(.leading)
                            }
                            
                            // Invisible spacer to push content up when keyboard opens
                            Color.clear.frame(height: 10).id("BottomID")
                        }
                        .padding()
                    }
                    // FIX: Updated syntax for iOS 17+ to remove warning
                    .onChange(of: messages.count) {
                        withAnimation {
                            proxy.scrollTo("BottomID", anchor: .bottom)
                        }
                    }
                    .onChange(of: isTyping) {
                        if isTyping {
                            withAnimation { proxy.scrollTo("BottomID", anchor: .bottom) }
                        }
                    }
                }
                
                // 4. Input Area
                HStack {
                    TextField("Ask for advice...", text: $inputText)
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(20)
                        .foregroundStyle(.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(.white.opacity(0.1), lineWidth: 1)
                        )
                        .onSubmit { sendMessage() }
                    
                    Button {
                        sendMessage()
                    } label: {
                        Image(systemName: "arrow.up")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .frame(width: 45, height: 45)
                            .background(inputText.isEmpty ? Color.gray.opacity(0.3) : Color.purple)
                            .clipShape(Circle())
                    }
                    .disabled(inputText.isEmpty)
                }
                .padding()
                .background(.ultraThinMaterial)
                .padding(.bottom, 80) // Lift above tab bar
            }
        }
    }
    
    // --- LOGIC ---
    
    func sendMessage() {
        guard !inputText.isEmpty else { return }
        
        let userMsg = inputText
        inputText = ""
        
        // 1. Show User Message
        withAnimation {
            messages.append(ChatMessage(text: userMsg, isUser: true, date: Date()))
            isTyping = true
        }
        
        // 2. Prepare Context
        let activeTasks = tasks.filter { !$0.isCompleted }.map { $0.title }.joined(separator: ", ")
        let context = "Pending Tasks: \(activeTasks)."
        
        Task {
            do {
                // 3. Get Response
                let response = try await GeminiService.shared.sendMessage(message: userMsg, context: context)
                
                await MainActor.run {
                    isTyping = false
                    
                    // --- COMMAND CHECKER ---
                    if response.starts(with: "{") && response.contains("create_task") {
                        handleCommand(jsonString: response)
                    } else {
                        // Normal Reply
                        withAnimation {
                            messages.append(ChatMessage(text: response, isUser: false, date: Date()))
                        }
                        HapticManager.shared.success()
                    }
                }
            } catch {
                isTyping = false
                print("Error: \(error)")
            }
        }
    }
    
    func handleCommand(jsonString: String) {
        // Parse the JSON
        guard let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              let action = json["action"],
              let title = json["title"] else { return }
        
        if action == "create_task" {
            // 1. Create the Task in SwiftData
            let newTask = DailyTask(title: title, notes: "Added by Rise AI")
            
            // This line will now work because we added the variable at the top!
            modelContext.insert(newTask)
            
            // 2. Show Success Message
            withAnimation {
                messages.append(ChatMessage(text: "✅ I've added '\(title)' to your mission list.", isUser: false, date: Date()))
            }
            HapticManager.shared.success()
        }
    }
}

// --- SUBVIEWS ---

struct ChatBubble: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.isUser { Spacer() }
            
            Text(message.text)
                .padding()
                .background(message.isUser ? Color.purple : Color.white.opacity(0.1))
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(.white.opacity(0.1), lineWidth: 1)
                )
                .frame(maxWidth: 280, alignment: message.isUser ? .trailing : .leading)
            
            if !message.isUser { Spacer() }
        }
    }
}

struct TypingIndicator: View {
    @State private var offset: CGFloat = 0
    
    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(Color.purple)
                    .frame(width: 8, height: 8)
                    .offset(y: offset)
                    .animation(
                        .easeInOut(duration: 0.5)
                        .repeatForever()
                        .delay(Double(index) * 0.2),
                        value: offset
                    )
            }
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .onAppear { offset = -5 }
    }
}
