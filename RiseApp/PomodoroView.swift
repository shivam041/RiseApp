import SwiftUI
import ActivityKit
import Combine

struct PomodoroView: View {
    // --- SETTINGS STATE ---
    @AppStorage("workMinutes") private var workMinutes: Int = 25
    @AppStorage("restMinutes") private var restMinutes: Int = 5
    
    // --- TIMER STATE ---
    @State private var timeRemaining: Int = 25 * 60
    @State private var totalTime: Int = 25 * 60
    @State private var isActive = false
    @State private var isWorkMode = true
    @State private var distractionCount = 0
    
    // --- UI STATE ---
    @State private var showingSettings = false
    
    // --- LIVE ACTIVITY ---
    @State private var currentActivity: Activity<TimerAttributes>? = nil
    
    // --- ENVIRONMENT (For Distraction Detection) ---
    @Environment(\.scenePhase) var scenePhase
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var progress: Double {
        guard totalTime > 0 else { return 0 }
        return Double(totalTime - timeRemaining) / Double(totalTime)
    }
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                
                // --- TOP BAR (Title & Settings) ---
                HStack {
                    Spacer()
                    Text(isWorkMode ? "DEEP WORK" : "RECHARGE")
                        .font(.system(size: 16, weight: .black, design: .monospaced))
                        .foregroundStyle(isWorkMode ? .cyan : .green)
                        .tracking(3)
                    Spacer()
                    
                    // Settings Button
                    Button {
                        showingSettings = true
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.5))
                    }
                }
                .padding(.horizontal, 30)
                .padding(.top, 20)
                
                // --- CIRCULAR TIMER ---
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
                    
                    // Time Text & Distractions
                    VStack(spacing: 10) {
                        Text(formatTime(timeRemaining))
                            .font(.system(size: 64, weight: .thin, design: .monospaced))
                            .foregroundStyle(.white)
                            .contentTransition(.numericText())
                        
                        if isWorkMode {
                            HStack(spacing: 5) {
                                Image(systemName: "eye.trianglebadge.exclamationmark")
                                    .foregroundStyle(distractionCount > 0 ? .red : .secondary)
                                Text("Distractions: \(distractionCount)")
                                    .font(.caption)
                                    .foregroundStyle(distractionCount > 0 ? .red : .secondary)
                            }
                            .padding(8)
                            .background(.white.opacity(0.05))
                            .clipShape(Capsule())
                        }
                    }
                }
                .padding(40)
                
                // --- CONTROLS ---
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
        // --- 1. INITIAL SETUP ---
        .onAppear {
            // Initialize timer with saved settings
            if !isActive {
                resetTimer()
            }
        }
        // --- 2. TIMER TICK ---
        .onReceive(timer) { _ in
            guard isActive else { return }
            if timeRemaining > 0 {
                timeRemaining -= 1
                // updateLiveActivity() // Optional: Update activity frequently if needed
            } else {
                completeSession()
            }
        }
        // --- 3. DISTRACTION DETECTION ---
        .onChange(of: scenePhase) { newPhase in
            if isActive && isWorkMode {
                if newPhase == .background || newPhase == .inactive {
                    distractionCount += 1
                    print("Distraction detected! Total: \(distractionCount)")
                }
            }
        }
        // --- 4. SETTINGS SHEET ---
        .sheet(isPresented: $showingSettings) {
            PomodoroSettingsSheet(workMinutes: $workMinutes, restMinutes: $restMinutes) {
                // When settings close, reset the timer to apply changes
                resetTimer()
            }
            .presentationDetents([.fraction(0.4)])
            .presentationCornerRadius(30)
        }
    }
    
    // --- LOGIC ---
    
    func toggleTimer() {
        isActive.toggle()
        if isActive {
            startLiveActivity()
        } else {
            // Keep activity alive but paused state logic could go here
        }
    }
    
    func resetTimer() {
        isActive = false
        timeRemaining = (isWorkMode ? workMinutes : restMinutes) * 60
        totalTime = timeRemaining
        // Only reset distractions if we are restarting a work session
        if isWorkMode { distractionCount = 0 }
        stopLiveActivity()
    }
    
    func skipSession() {
        isActive = false
        isWorkMode.toggle()
        // Apply the new duration based on mode
        timeRemaining = (isWorkMode ? workMinutes : restMinutes) * 60
        totalTime = timeRemaining
        stopLiveActivity()
    }
    
    func completeSession() {
        isActive = false
        stopLiveActivity()
        // Play sound or vibration here
    }
    
    func formatTime(_ seconds: Int) -> String {
        let min = seconds / 60
        let sec = seconds % 60
        return String(format: "%02d:%02d", min, sec)
    }
    
    // --- LIVE ACTIVITY HELPERS ---
    func startLiveActivity() {
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
    
    func stopLiveActivity() {
        Task {
            await currentActivity?.end(nil, dismissalPolicy: .immediate)
        }
    }
}

// --- MODERN GLASS SETTINGS SHEET ---
struct PomodoroSettingsSheet: View {
    @Binding var workMinutes: Int
    @Binding var restMinutes: Int
    var onDismiss: () -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // Dark Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Capsule().fill(Color.white.opacity(0.2)).frame(width: 40, height: 4).padding(.top, 20)
                
                Text("Timer Calibration")
                    .font(.headline)
                    .foregroundStyle(.white)
                
                // WORK DURATION
                VStack(spacing: 15) {
                    Text("Focus Duration")
                        .font(.caption).fontWeight(.bold).foregroundStyle(.cyan)
                        .textCase(.uppercase)
                    
                    HStack {
                        Button(action: { if workMinutes > 5 { workMinutes -= 5 } }) {
                            Image(systemName: "minus").frame(width: 40, height: 40).background(Color.white.opacity(0.1)).clipShape(Circle())
                        }
                        
                        Text("\(workMinutes) min")
                            .font(.system(size: 32, weight: .thin, design: .monospaced))
                            .foregroundStyle(.white)
                            .frame(width: 120)
                        
                        Button(action: { if workMinutes < 90 { workMinutes += 5 } }) {
                            Image(systemName: "plus").frame(width: 40, height: 40).background(Color.white.opacity(0.1)).clipShape(Circle())
                        }
                    }
                    .foregroundStyle(.white)
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(20)
                
                // REST DURATION
                VStack(spacing: 15) {
                    Text("Rest Duration")
                        .font(.caption).fontWeight(.bold).foregroundStyle(.green)
                        .textCase(.uppercase)
                    
                    HStack {
                        Button(action: { if restMinutes > 1 { restMinutes -= 1 } }) {
                            Image(systemName: "minus").frame(width: 40, height: 40).background(Color.white.opacity(0.1)).clipShape(Circle())
                        }
                        
                        Text("\(restMinutes) min")
                            .font(.system(size: 32, weight: .thin, design: .monospaced))
                            .foregroundStyle(.white)
                            .frame(width: 120)
                        
                        Button(action: { if restMinutes < 30 { restMinutes += 1 } }) {
                            Image(systemName: "plus").frame(width: 40, height: 40).background(Color.white.opacity(0.1)).clipShape(Circle())
                        }
                    }
                    .foregroundStyle(.white)
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(20)
                
                Spacer()
                
                Button {
                    onDismiss()
                    dismiss()
                } label: {
                    Text("Save Configuration")
                        .fontWeight(.bold)
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(BouncyButton())
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            .padding(.horizontal)
        }
    }
}
