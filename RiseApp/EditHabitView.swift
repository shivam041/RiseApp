import SwiftUI
import SwiftData

struct EditHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    // We bind directly to the existing habit
    @Bindable var habit: Habit
    
    // Local state for the form inputs
    @State private var name = ""
    @State private var action = ""
    @State private var selectedWeekdays: Set<Int> = []
    
    @State private var wantsReminder = false
    @State private var reminderTimes: [Date] = []
    @State private var tempDate = Date()
    
    let weekdays = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Name", text: $name)
                    TextField("Action", text: $action)
                }
                
                Section("Frequency") {
                    HStack {
                        ForEach(0..<7, id: \.self) { index in
                            Button {
                                if selectedWeekdays.contains(index) {
                                    selectedWeekdays.remove(index)
                                } else {
                                    selectedWeekdays.insert(index)
                                }
                            } label: {
                                Text(weekdays[index])
                                    .font(.caption).fontWeight(.bold)
                                    .frame(width: 30, height: 30)
                                    .background(selectedWeekdays.contains(index) ? Color.indigo : Color(.systemGray5))
                                    .foregroundStyle(selectedWeekdays.contains(index) ? .white : .primary)
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                
                Section("Reminders") {
                    Toggle("Enable Reminders", isOn: $wantsReminder)
                    
                    if wantsReminder {
                        HStack {
                            DatePicker("Time", selection: $tempDate, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                            Spacer()
                            Button("Add Time") {
                                if !reminderTimes.contains(where: { Calendar.current.compare($0, to: tempDate, toGranularity: .minute) == .orderedSame }) {
                                    reminderTimes.append(tempDate)
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                        
                        ForEach(reminderTimes.sorted(by: { $0 < $1 }), id: \.self) { time in
                            HStack {
                                Text(time.formatted(date: .omitted, time: .shortened))
                                Spacer()
                                Button {
                                    reminderTimes.removeAll { $0 == time }
                                } label: {
                                    Image(systemName: "minus.circle.fill").foregroundStyle(.red)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Edit Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveChanges() }
                }
            }
            .onAppear {
                // LOAD EXISTING DATA
                name = habit.name
                action = habit.action
                selectedWeekdays = Set(habit.weekdays)
                reminderTimes = habit.reminderTimes
                wantsReminder = !habit.reminderTimes.isEmpty
            }
        }
    }
    
    func saveChanges() {
        // 1. Update the object
        habit.name = name
        habit.action = action
        habit.weekdays = Array(selectedWeekdays).sorted()
        habit.reminderTimes = wantsReminder ? reminderTimes : []
        
        // 2. Reschedule Notifications
        NotificationManager.shared.scheduleNotification(for: habit)
        
        dismiss()
    }
}
