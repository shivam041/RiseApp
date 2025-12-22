import SwiftUI
import SwiftData

struct CalendarView: View {
    @Environment(\.modelContext) private var modelContext
    
    // Fetch Habits AND Tasks
    @Query private var habits: [Habit]
    @Query private var allTasks: [DailyTask]
    
    // STATE
    @State private var selectedDate: Date = Date()
    @State private var visibleMonth: Date = Date()
    @State private var newTaskTitle: String = ""
    
    let columns = Array(repeating: GridItem(.flexible()), count: 7)
    let daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                
                // --- 1. NAVIGATION HEADER ---
                HStack {
                    Button { changeMonth(by: -1) } label: {
                        Image(systemName: "chevron.left").imageScale(.large).foregroundStyle(.indigo)
                    }
                    Spacer()
                    Text(visibleMonth.formatted(.dateTime.month(.wide).year()))
                        .font(.title2).fontWeight(.bold)
                        .onTapGesture {
                            visibleMonth = Date()
                            selectedDate = Date()
                        }
                    Spacer()
                    Button { changeMonth(by: 1) } label: {
                        Image(systemName: "chevron.right").imageScale(.large).foregroundStyle(.indigo)
                    }
                }
                .padding(.horizontal)
                
                // --- 2. DAYS OF WEEK ---
                HStack {
                    ForEach(0..<daysOfWeek.count, id: \.self) { index in
                        Text(daysOfWeek[index])
                            .font(.caption).fontWeight(.bold).foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity)
                    }
                }
                
                // --- 3. CALENDAR GRID ---
                LazyVGrid(columns: columns, spacing: 15) {
                    ForEach(0..<startingSpaces(), id: \.self) { _ in Text("") }
                    
                    ForEach(1...daysInMonth(), id: \.self) { day in
                        let date = getDate(for: day)
                        let isSelected = Calendar.current.isDate(date, inSameDayAs: selectedDate)
                        let isToday = Calendar.current.isDateInToday(date)
                        
                        Button {
                            selectedDate = date
                        } label: {
                            VStack(spacing: 4) {
                                Text("\(day)")
                                    .fontWeight(isSelected || isToday ? .bold : .regular)
                                    .foregroundStyle(isSelected ? .white : .primary)
                                
                                // Dots (Habits + Tasks)
                                HStack(spacing: 2) {
                                    let count = countItems(on: date)
                                    ForEach(0..<min(count, 3), id: \.self) { _ in
                                        Circle()
                                            .fill(isSelected ? .white.opacity(0.8) : .indigo)
                                            .frame(width: 4, height: 4)
                                    }
                                }
                            }
                            .frame(height: 45)
                            .frame(maxWidth: .infinity)
                            .background(isSelected ? Color.indigo : Color.clear)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                            .overlay {
                                if isToday && !isSelected {
                                    RoundedRectangle(cornerRadius: 8).stroke(Color.indigo, lineWidth: 1)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
                .gesture(DragGesture().onEnded { value in
                    if value.translation.width < -30 { changeMonth(by: 1) }
                    if value.translation.width > 30 { changeMonth(by: -1) }
                })
                
                Divider().padding(.vertical)
                
                // --- 4. DAILY AGENDA ---
                VStack(alignment: .leading, spacing: 15) {
                    Text("Schedule for \(selectedDate.formatted(.dateTime.day().month()))")
                        .font(.headline).padding(.horizontal)
                    
                    // HABITS
                    if !habitsForSelectedDate().isEmpty {
                        Text("Recurring Habits").font(.caption).foregroundStyle(.secondary).padding(.horizontal)
                        ForEach(habitsForSelectedDate()) { habit in
                            HStack {
                                Image(systemName: isCompleted(habit, on: selectedDate) ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(isCompleted(habit, on: selectedDate) ? .indigo : .secondary)
                                    .font(.title2)
                                    .onTapGesture { toggleHabit(habit, on: selectedDate) }
                                Text(habit.name).strikethrough(isCompleted(habit, on: selectedDate))
                                Spacer()
                            }
                            .padding(.horizontal).padding(.vertical, 4)
                        }
                    }
                    
                    // TASKS
                    Text("One-Off Tasks").font(.caption).foregroundStyle(.secondary).padding(.horizontal).padding(.top, 10)
                    let daysTasks = tasksForSelectedDate()
                    if daysTasks.isEmpty {
                        Text("No tasks added yet.").font(.caption).foregroundStyle(.tertiary).padding(.horizontal)
                    } else {
                        ForEach(daysTasks) { task in
                            HStack {
                                Image(systemName: task.isCompleted ? "checkmark.square.fill" : "square")
                                    .foregroundStyle(task.isCompleted ? .green : .secondary)
                                    .font(.title2)
                                    .onTapGesture { toggleTask(task) }
                                Text(task.title).strikethrough(task.isCompleted)
                                Spacer()
                                Button { modelContext.delete(task) } label: { Image(systemName: "trash").foregroundStyle(.red.opacity(0.5)) }
                            }
                            .padding(.horizontal).padding(.vertical, 4)
                        }
                    }
                    
                    // ADD INPUT
                    HStack {
                        Image(systemName: "plus").foregroundStyle(.secondary)
                        TextField("Add a task for this day...", text: $newTaskTitle)
                            .onSubmit { addTask() }
                        Button("Add") { addTask() }.disabled(newTaskTitle.isEmpty)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .padding(.horizontal)
                }
                .padding(.bottom, 50)
            }
            .padding(.top)
        }
    }
    
    // MARK: - LOGIC
    
    func changeMonth(by value: Int) {
        if let newMonth = Calendar.current.date(byAdding: .month, value: value, to: visibleMonth) {
            withAnimation { visibleMonth = newMonth }
        }
    }
    
    func getDate(for day: Int) -> Date {
        let components = Calendar.current.dateComponents([.year, .month], from: visibleMonth)
        var newComponents = components
        newComponents.day = day
        return Calendar.current.date(from: newComponents) ?? Date()
    }
    
    func daysInMonth() -> Int {
        let range = Calendar.current.range(of: .day, in: .month, for: visibleMonth)!
        return range.count
    }
    
    func startingSpaces() -> Int {
        let components = Calendar.current.dateComponents([.year, .month], from: visibleMonth)
        let startOfMonth = Calendar.current.date(from: components)!
        return Calendar.current.component(.weekday, from: startOfMonth) - 1
    }
    
    // --- UPDATED LOGIC FOR TASKS ---
    
    func addTask() {
        guard !newTaskTitle.isEmpty else { return }
        
        let newTask = DailyTask(title: newTaskTitle)
        newTask.createdAt = selectedDate
        // Note: Creating from calendar doesn't set a reminder by default,
        // but 'createdAt' will serve as the fallback date.
        
        modelContext.insert(newTask)
        newTaskTitle = ""
    }
    
    func tasksForSelectedDate() -> [DailyTask] {
        allTasks.filter { task in
            // Use reminder date if available, otherwise creation date
            let effectiveDate = task.reminders.first ?? task.createdAt
            return Calendar.current.isDate(effectiveDate, inSameDayAs: selectedDate)
        }
    }
    
    func countItems(on date: Date) -> Int {
        let habitCount = habits.filter { isCompleted($0, on: date) }.count
        let taskCount = allTasks.filter { task in
            let effectiveDate = task.reminders.first ?? task.createdAt
            return Calendar.current.isDate(effectiveDate, inSameDayAs: date) && task.isCompleted
        }.count
        return habitCount + taskCount
    }
    
    // Unchanged Helpers
    func toggleTask(_ task: DailyTask) { task.isCompleted.toggle() }
    func habitsForSelectedDate() -> [Habit] {
        let weekdayIndex = Calendar.current.component(.weekday, from: selectedDate) - 1
        return habits.filter { $0.weekdays.contains(weekdayIndex) }
    }
    func isCompleted(_ habit: Habit, on date: Date) -> Bool {
        habit.completedDates.contains { Calendar.current.isDate($0, inSameDayAs: date) }
    }
    func toggleHabit(_ habit: Habit, on date: Date) {
        if isCompleted(habit, on: date) {
            habit.completedDates.removeAll { Calendar.current.isDate($0, inSameDayAs: date) }
        } else {
            habit.completedDates.append(date)
        }
    }
}
