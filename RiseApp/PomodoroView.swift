import SwiftUI
import ActivityKit
import Combine // <--- ADDED THIS IMPORT

struct PomodoroView: View {
    @State private var timeRemaining: Int = 25 * 60
    @State private var totalTime: Int = 25 * 60
    @State private var isActive = false
    @State private var isWorkMode = true
    
    // Live Activity State
    @State private var currentActivity: Activity<TimerAttributes>? = nil
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var progress: Double {
        Double(totalTime - timeRemaining) / Double(totalTime)
    }
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack(spacing: 40) {
                
                // HEADER
                Text(isWorkMode ? "FOCUS" : "REST")
                    .font(.system(size: 20, weight: .black, design: .monospaced))
                    .foregroundStyle(isWorkMode ? .cyan : .green)
                    .tracking(5)
                    .padding(.top, 30)
                
                // CIRCULAR TIMER
                ZStack {
                    // Track
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 20)
                    
                    // Progress
                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(
                            isWorkMode ? Color.cyan : Color.green,
                            style: StrokeStyle(lineWidth: 20, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1), value: progress)
                        .shadow(color: (isWorkMode ? Color.cyan : Color.green).opacity(0.5), radius: 20)
                    
                    // Time Text
                    VStack(spacing: 5) {
                        Text(formatTime(timeRemaining))
                            .font(.system(size: 64, weight: .thin, design: .monospaced))
                            .foregroundStyle(.white)
                            .contentTransition(.numericText())
                        
                        Text(isWorkMode ? "Work Session" : "Break Time")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(40)
                
                // CONTROLS
                HStack(spacing: 30) {
                    // Reset
                    Button {
                        resetTimer()
                    } label: {
                        Image(systemName: "arrow.counterclockwise")
                            .font(.title2)
                            .foregroundStyle(.white)
                            .frame(width: 60, height: 60)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }
                    .buttonStyle(BouncyButton())
                    
                    // Play/Pause
                    Button {
                        toggleTimer()
                    } label: {
                        Image(systemName: isActive ? "pause.fill" : "play.fill")
                            .font(.title)
                            .foregroundStyle(.black)
                            .frame(width: 80, height: 80)
                            .background(isWorkMode ? Color.cyan : Color.green)
                            .clipShape(Circle())
                            .shadow(color: (isWorkMode ? Color.cyan : Color.green).opacity(0.5), radius: 15)
                    }
                    .buttonStyle(BouncyButton())
                    
                    // Skip
                    Button {
                        skipSession()
                    } label: {
                        Image(systemName: "forward.end.fill")
                            .font(.title2)
                            .foregroundStyle(.white)
                            .frame(width: 60, height: 60)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }
                    .buttonStyle(BouncyButton())
                }
                
                Spacer()
            }
        }
        .onReceive(timer) { _ in
            guard isActive else { return }
            if timeRemaining > 0 {
                timeRemaining -= 1
                updateLiveActivity()
            } else {
                completeSession()
            }
        }
    }
    
    // --- LOGIC ---
    
    func toggleTimer() {
        isActive.toggle()
        if isActive {
            startLiveActivity()
        } else {
            updateLiveActivity()
        }
    }
    
    func resetTimer() {
        isActive = false
        timeRemaining = isWorkMode ? 25 * 60 : 5 * 60
        totalTime = timeRemaining
        stopLiveActivity()
    }
    
    func skipSession() {
        isActive = false
        isWorkMode.toggle()
        timeRemaining = isWorkMode ? 25 * 60 : 5 * 60
        totalTime = timeRemaining
        stopLiveActivity()
    }
    
    func completeSession() {
        isActive = false
        stopLiveActivity()
    }
    
    func formatTime(_ seconds: Int) -> String {
        let min = seconds / 60
        let sec = seconds % 60
        return String(format: "%02d:%02d", min, sec)
    }
    
    // --- LIVE ACTIVITY ---
    func startLiveActivity() {
        // Only run on physical device or simulator with Live Activities enabled
        if ActivityAuthorizationInfo().areActivitiesEnabled {
             let endTime = Date().addingTimeInterval(TimeInterval(timeRemaining))
             let attributes = TimerAttributes(timerName: "Pomodoro")
             let state = TimerAttributes.ContentState(estimatedEndTime: endTime, modeName: isWorkMode ? "Focus" : "Break")
             let content = ActivityContent(state: state, staleDate: nil)
             
             do {
                 currentActivity = try Activity.request(attributes: attributes, content: content, pushType: nil)
             } catch {
                 print("Error: \(error)")
             }
        }
    }
    
    func updateLiveActivity() {
        // Updates happen automatically via the timer in this simple version
    }
    
    func stopLiveActivity() {
        Task {
            await currentActivity?.end(nil, dismissalPolicy: .immediate)
        }
    }
}
