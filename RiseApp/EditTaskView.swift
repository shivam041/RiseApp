import SwiftUI

struct EditTaskView: View {
    @Bindable var task: DailyTask
    @Environment(\.dismiss) var dismiss
    
    // Temporary state for adding a new reminder
    @State private var newReminderDate = Date()
    @State private var showDatePicker = false

    var body: some View {
        Form {
            // SECTION 1: Basic Info
            Section(header: Text("Task Details")) {
                TextField("Task Title", text: $task.title)
                TextField("Notes", text: $task.notes, axis: .vertical) // Grows as you type
                    .lineLimit(3...6)
            }
            
            // SECTION 2: Reminders List
            Section(header: Text("Reminders")) {
                if task.reminders.isEmpty {
                    Text("No reminders set").foregroundStyle(.secondary)
                }
                
                // List existing reminders
                ForEach(task.reminders, id: \.self) { date in
                    HStack {
                        Image(systemName: "alarm")
                        Text(date.formatted(date: .omitted, time: .shortened))
                    }
                }
                .onDelete(perform: deleteReminder)
                
                // Add New Reminder Interface
                if showDatePicker {
                    VStack {
                        DatePicker("Time", selection: $newReminderDate, displayedComponents: .hourAndMinute)
                        Button("Save Reminder") {
                            addReminder()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                } else {
                    Button("Add Reminder") {
                        showDatePicker = true
                    }
                }
            }
        }
        .navigationTitle("Edit Task")
        .toolbar {
            Button("Done") { dismiss() }
        }
    }
    
    func addReminder() {
        task.reminders.append(newReminderDate)
        showDatePicker = false
        // Note: In a real app, you would schedule the NotificationCenter request here
    }
    
    func deleteReminder(at offsets: IndexSet) {
        task.reminders.remove(atOffsets: offsets)
    }
}
