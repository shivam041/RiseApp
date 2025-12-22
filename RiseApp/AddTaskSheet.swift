import SwiftUI
import SwiftData

struct AddTaskSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var notes = ""
    @State private var wantsReminder = false
    @State private var reminderTime = Date()
    
    var body: some View {
        ZStack {
            // 1. Dark Gradient Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
                .onTapGesture {
                    // Tap anywhere on background to dismiss keyboard
                    hideKeyboard()
                }
            
            VStack(spacing: 10) {
                // Handle bar
                Capsule()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 4)
                    .padding(.top, 20)
                
                Text("New Task")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                    .padding(.bottom, 10)
                
                // 2. SCROLLABLE Input Area
                ScrollView {
                    VStack(spacing: 20) {
                        // Title Input
                        TextField("What needs to be done?", text: $title)
                            .padding()
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(12)
                            .foregroundStyle(.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(.white.opacity(0.1), lineWidth: 1)
                            )
                        
                        // Notes Input
                        TextField("Add extra notes...", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                            .padding()
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(12)
                            .foregroundStyle(.white.opacity(0.8))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(.white.opacity(0.1), lineWidth: 1)
                            )
                        
                        // Reminder Toggle
                        Toggle(isOn: $wantsReminder) {
                            HStack {
                                Image(systemName: "bell.fill")
                                    .foregroundStyle(.pink)
                                Text("Remind Me")
                                    .foregroundStyle(.white)
                            }
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                        
                        // Date Picker (Only shows if toggle is on)
                        if wantsReminder {
                            DatePicker("When?", selection: $reminderTime, displayedComponents: [.date, .hourAndMinute])
                                .datePickerStyle(.graphical)
                                .colorScheme(.dark)
                                .padding()
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(12)
                                .transition(.move(edge: .top).combined(with: .opacity))
                        }
                        
                        // Spacer at bottom of scroll content so you can scroll past the keyboard
                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal)
                }
                .scrollDismissesKeyboard(.interactively) // Allows swiping down to close keyboard
                
                // 3. Action Buttons (Pinned to bottom)
                HStack(spacing: 20) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(.white.opacity(0.6))
                    
                    Button {
                        saveTask()
                    } label: {
                        Text("Create Task")
                            .fontWeight(.bold)
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(title.isEmpty ? Color.gray : Color.pink)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(title.isEmpty)
                    .buttonStyle(BouncyButton())
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
                .padding(.top, 10)
                .background(Color.black.opacity(0.5).blur(radius: 5)) // Adds a subtle backing to buttons
            }
        }
    }
    
    func saveTask() {
        let initialReminders: [Date] = wantsReminder ? [reminderTime] : []
        let newTask = DailyTask(title: title, reminders: initialReminders, notes: notes)
        modelContext.insert(newTask)
        if wantsReminder {
            NotificationManager.shared.scheduleTaskNotification(for: newTask)
        }
        dismiss()
    }
    
    // Helper to dismiss keyboard
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}
