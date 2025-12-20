import SwiftUI
import SwiftData

struct AddHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var action = ""
    @State private var selectedWeekdays: Set<Int> = []
    
    // NEW: Manage multiple times
    @State private var wantsReminder = false
    @State private var reminderTimes: [Date] = []
    @State private var tempDate = Date() // The picker controls this temporary date
    
    let weekdays = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        NavigationStack {
            Form {
                // Section 1: Basic Info
                Section("What do you want to do?") {
                    TextField("Habit Name (e.g., Drink Water)", text: $name)
                    TextField("Action (e.g., 1 Glass)", text: $action)
                }
                
                // Section 2: Schedule
                Section("Frequency") {
                    HStack {
                        ForEach(0..<7, id: \.self) { index in
                            Button {
                                toggleDay(index)
                            } label: {
                                Text(weekdays[index])
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .frame(width: 30, height: 30)
                                    .background(selectedWeekdays.contains(index) ? Color.indigo : Color(.systemGray5))
                                    .foregroundStyle(selectedWeekdays.contains(index) ? .white : .primary)
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                
                // Section 3: Multiple Reminders
                Section("Reminders") {
                    Toggle("Enable Reminders", isOn: $wantsReminder)
                    
                    if wantsReminder {
                        // The Time Picker
                        HStack {
                            DatePicker("Select Time", selection: $tempDate, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                            
                            Spacer()
                            
                            Button("Add Time") {
                                addTime()
                            }
                            .buttonStyle(.bordered)
                        }
                        
                        // The List of Added Times
                        if !reminderTimes.isEmpty {
                            ForEach(reminderTimes.sorted(by: { $0 < $1 }), id: \.self) { time in
                                HStack {
                                    Text(time.formatted(date: .omitted, time: .shortened))
                                    Spacer()
                                    Button {
                                        deleteTime(time)
                                    } label: {
                                        Image(systemName: "minus.circle.fill")
                                            .foregroundStyle(.red)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        } else {
                            Text("No times set yet")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("New Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        saveHabit()
                    }
                    .disabled(name.isEmpty || selectedWeekdays.isEmpty)
                }
            }
        }
    }
    
    // MARK: - Logic
    
    func toggleDay(_ index: Int) {
        if selectedWeekdays.contains(index) {
            selectedWeekdays.remove(index)
        } else {
            selectedWeekdays.insert(index)
        }
    }
    
    func addTime() {
        // Prevent duplicate times (roughly)
        let isDuplicate = reminderTimes.contains { existingTime in
            Calendar.current.compare(existingTime, to: tempDate, toGranularity: .minute) == .orderedSame
        }
        
        if !isDuplicate {
            reminderTimes.append(tempDate)
        }
    }
    
    func deleteTime(_ time: Date) {
        reminderTimes.removeAll { $0 == time }
    }
    
    func saveHabit() {
        let newHabit = Habit(
            name: name,
            action: action,
            weekdays: Array(selectedWeekdays).sorted(),
            // Pass the full array here
            reminderTimes: wantsReminder ? reminderTimes : []
        )
        
        modelContext.insert(newHabit)
        
        // Schedule all notifications immediately
        NotificationManager.shared.scheduleNotification(for: newHabit)
        
        dismiss()
    }
}

#Preview {
    AddHabitView()
}
