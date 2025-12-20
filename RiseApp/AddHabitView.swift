import SwiftUI
import SwiftData

struct AddHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    // --- STATE ---
    @State private var name = ""
    @State private var action = ""
    @State private var selectedWeekdays: Set<Int> = [0, 1, 2, 3, 4, 5, 6] // Default to every day
    
    // Multiple Reminders State
    @State private var wantsReminder = false
    @State private var tempDate = Date()
    @State private var reminderTimes: [Date] = []
    
    let weekdays = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        ZStack {
            // 1. BACKGROUND: Dark Gradient
            LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Handle Bar
                Capsule()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 4)
                    .padding(.top, 20)
                    .padding(.bottom, 20)
                
                Text("New Habit")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                    .padding(.bottom, 30)
                
                // 2. SCROLLABLE FORM CONTENT
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 25) {
                        
                        // --- SECTION: DETAILS ---
                        VStack(spacing: 15) {
                            TextField("Habit Name (e.g. Drink Water)", text: $name)
                                .padding()
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(12)
                                .foregroundStyle(.white)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(.white.opacity(0.1), lineWidth: 1))
                            
                            TextField("Action (e.g. 1 Bottle)", text: $action)
                                .padding()
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(12)
                                .foregroundStyle(.white)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(.white.opacity(0.1), lineWidth: 1))
                        }
                        .padding(.horizontal)
                        
                        // --- SECTION: FREQUENCY ---
                        VStack(alignment: .leading, spacing: 10) {
                            Text("FREQUENCY")
                                .font(.caption).fontWeight(.bold).foregroundStyle(.orange)
                                .padding(.leading)
                            
                            HStack(spacing: 0) {
                                ForEach(0..<7, id: \.self) { index in
                                    Button {
                                        toggleDay(index)
                                    } label: {
                                        Text(weekdays[index])
                                            .font(.caption).fontWeight(.bold)
                                            .frame(maxWidth: .infinity)
                                            .frame(height: 45)
                                            .background(selectedWeekdays.contains(index) ? Color.orange : Color.white.opacity(0.05))
                                            .foregroundStyle(selectedWeekdays.contains(index) ? .black : .white)
                                            .clipShape(Circle())
                                    }
                                    .padding(4)
                                }
                            }
                            .padding(.horizontal)
                        }
                        
                        // --- SECTION: REMINDERS ---
                        VStack(alignment: .leading, spacing: 15) {
                            HStack {
                                Text("REMINDERS")
                                    .font(.caption).fontWeight(.bold).foregroundStyle(.cyan)
                                Spacer()
                                Toggle("", isOn: $wantsReminder)
                                    .labelsHidden()
                                    .tint(.cyan)
                            }
                            .padding(.horizontal)
                            
                            if wantsReminder {
                                VStack(spacing: 15) {
                                    // Time Picker Row
                                    HStack {
                                        DatePicker("Select Time", selection: $tempDate, displayedComponents: .hourAndMinute)
                                            .labelsHidden()
                                            .colorScheme(.dark)
                                        
                                        Spacer()
                                        
                                        Button {
                                            addTime()
                                        } label: {
                                            HStack {
                                                Image(systemName: "plus")
                                                Text("Add")
                                            }
                                            .font(.caption).fontWeight(.bold)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 8)
                                            .background(Color.cyan.opacity(0.2))
                                            .foregroundStyle(.cyan)
                                            .clipShape(Capsule())
                                        }
                                    }
                                    .padding()
                                    .background(Color.white.opacity(0.05))
                                    .cornerRadius(12)
                                    
                                    // List of Added Times
                                    if !reminderTimes.isEmpty {
                                        ForEach(reminderTimes.sorted(by: { $0 < $1 }), id: \.self) { time in
                                            HStack {
                                                Image(systemName: "alarm.fill")
                                                    .foregroundStyle(.cyan)
                                                Text(time.formatted(date: .omitted, time: .shortened))
                                                    .foregroundStyle(.white)
                                                    .fontWeight(.medium)
                                                Spacer()
                                                Button {
                                                    deleteTime(time)
                                                } label: {
                                                    Image(systemName: "xmark.circle.fill")
                                                        .foregroundStyle(.white.opacity(0.3))
                                                }
                                            }
                                            .padding()
                                            .background(Color.white.opacity(0.05))
                                            .cornerRadius(10)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                                .transition(.move(edge: .top).combined(with: .opacity))
                            }
                        }
                        
                        Spacer(minLength: 50)
                    }
                }
                
                // 3. SAVE BUTTON (Pinned to bottom)
                Button {
                    saveHabit()
                } label: {
                    Text("Create Ritual")
                        .fontWeight(.bold)
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(name.isEmpty ? Color.white.opacity(0.2) : Color.orange)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .disabled(name.isEmpty)
                .buttonStyle(BouncyButton()) // Using our custom bounce style
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
        }
    }
    
    // MARK: - LOGIC (Kept from your original file)
    
    func toggleDay(_ index: Int) {
        if selectedWeekdays.contains(index) {
            selectedWeekdays.remove(index)
        } else {
            selectedWeekdays.insert(index)
        }
    }
    
    func addTime() {
        let isDuplicate = reminderTimes.contains { existingTime in
            Calendar.current.compare(existingTime, to: tempDate, toGranularity: .minute) == .orderedSame
        }
        if !isDuplicate {
            withAnimation {
                reminderTimes.append(tempDate)
            }
        }
    }
    
    func deleteTime(_ time: Date) {
        withAnimation {
            reminderTimes.removeAll { $0 == time }
        }
    }
    
    func saveHabit() {
        let newHabit = Habit(
            name: name,
            action: action,
            weekdays: Array(selectedWeekdays).sorted(),
            reminderTimes: wantsReminder ? reminderTimes : []
        )
        
        modelContext.insert(newHabit)
        
        // Schedule notifications
        NotificationManager.shared.scheduleNotification(for: newHabit)
        
        dismiss()
    }
}
