import SwiftUI
import SwiftData

struct EditTaskView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var task: DailyTask
    
    // Local state to handle the editing
    @State private var title = ""
    @State private var notes = ""
    @State private var wantsReminder = false
    @State private var reminderTime = Date()
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Custom Nav Bar
                HStack {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(.white.opacity(0.7))
                    Spacer()
                    Text("Edit Task")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Spacer()
                    Button("Save") { updateTask() }
                        .fontWeight(.bold)
                        .foregroundStyle(.pink)
                }
                .padding()
                .background(Color.black.opacity(0.2))
                
                ScrollView {
                    VStack(spacing: 25) {
                        
                        // 1. Task Info
                        VStack(alignment: .leading, spacing: 8) {
                            Text("TASK DETAILS")
                                .font(.caption).fontWeight(.bold).foregroundStyle(.gray)
                                .padding(.leading, 5)
                            
                            TextField("Title", text: $title)
                                .padding()
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(12)
                                .foregroundStyle(.white)
                            
                            TextField("Notes", text: $notes, axis: .vertical)
                                .lineLimit(3...6)
                                .padding()
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(12)
                                .foregroundStyle(.white)
                        }
                        
                        // 2. Schedule
                        VStack(alignment: .leading, spacing: 8) {
                            Text("SCHEDULE")
                                .font(.caption).fontWeight(.bold).foregroundStyle(.gray)
                                .padding(.leading, 5)
                            
                            Toggle(isOn: $wantsReminder) {
                                HStack {
                                    Image(systemName: "bell.fill")
                                        .foregroundStyle(.pink)
                                    Text("Set Reminder")
                                        .foregroundStyle(.white)
                                }
                            }
                            .padding()
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(12)
                            
                            if wantsReminder {
                                // This DatePicker allows changing both Date and Time
                                DatePicker("Time", selection: $reminderTime, displayedComponents: [.date, .hourAndMinute])
                                    .datePickerStyle(.graphical)
                                    .colorScheme(.dark)
                                    .padding()
                                    .background(Color.white.opacity(0.05))
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            // Load existing data when view opens
            title = task.title
            notes = task.notes
            if let existingDate = task.reminders.first {
                wantsReminder = true
                reminderTime = existingDate
            }
        }
    }
    
    func updateTask() {
        // 1. Cancel old notification first
        // FIXED: Using the function name from your existing NotificationManager
        NotificationManager.shared.cancelTaskNotification(for: task)
        
        // 2. Update Data
        task.title = title
        task.notes = notes
        
        if wantsReminder {
            // Overwrite reminders with the new single date
            task.reminders = [reminderTime]
            // Schedule new notification
            NotificationManager.shared.scheduleTaskNotification(for: task)
        } else {
            task.reminders = []
        }
        
        dismiss()
    }
}
