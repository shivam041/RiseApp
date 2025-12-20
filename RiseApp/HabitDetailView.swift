import SwiftUI
import SwiftData

struct HabitDetailView: View {
    @Bindable var habit: Habit
    @State private var showingEditSheet = false // <--- NEW STATE
    
    let columns = Array(repeating: GridItem(.flexible()), count: 6)
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header Info
                VStack(alignment: .leading) {
                    Text(habit.action)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                    
                    Text("Day \(currentStreak()) / 66")
                        .font(.headline)
                        .foregroundStyle(.indigo)
                }
                .padding(.horizontal)
                
                // GRID
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(0..<66) { dayOffset in
                        let dateForCell = date(for: dayOffset)
                        let isCompleted = isHabitCompleted(on: dateForCell)
                        let isFuture = dateForCell > Date()
                        
                        Button {
                            toggleCompletion(on: dateForCell)
                        } label: {
                            VStack {
                                Text("\(dayOffset + 1)")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                
                                Circle()
                                    .fill(cellColor(isCompleted: isCompleted, isFuture: isFuture))
                                    .frame(width: 35, height: 35)
                                    .overlay {
                                        if isCompleted {
                                            Image(systemName: "checkmark")
                                                .foregroundStyle(.white)
                                                .font(.caption.bold())
                                        }
                                    }
                            }
                        }
                        .disabled(isFuture)
                    }
                }
                .padding()
            }
        }
        .navigationTitle(habit.name)
        .navigationBarTitleDisplayMode(.large)
        // --- NEW TOOLBAR BUTTON ---
        .toolbar {
            Button("Edit") {
                showingEditSheet = true
            }
        }
        // --- NEW EDIT SHEET ---
        .sheet(isPresented: $showingEditSheet) {
            EditHabitView(habit: habit)
        }
    }
    
    // ... Keep your existing helper functions (date, isHabitCompleted, toggleCompletion, etc.) ...
    func date(for offset: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: offset, to: habit.startDate) ?? Date()
    }
    func isHabitCompleted(on date: Date) -> Bool {
        habit.completedDates.contains { Calendar.current.isDate($0, inSameDayAs: date) }
    }
    func toggleCompletion(on date: Date) {
        if isHabitCompleted(on: date) {
            habit.completedDates.removeAll { Calendar.current.isDate($0, inSameDayAs: date) }
        } else {
            habit.completedDates.append(date)
        }
    }
    func cellColor(isCompleted: Bool, isFuture: Bool) -> Color {
        if isCompleted { return .indigo }
        if isFuture { return Color(.systemGray6) }
        return Color(.systemGray4)
    }
    func currentStreak() -> Int {
        return habit.completedDates.count
    }
}
