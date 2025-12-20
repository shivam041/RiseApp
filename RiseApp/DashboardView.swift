import SwiftUI
import SwiftData
import WidgetKit

struct DashboardView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var allHabits: [Habit]
    @Query private var allTasks: [DailyTask]
    
    // STATE
    @State private var selectedDate: Date = Date()
    @State private var isAnimating = false
    
    func updateWidget() { WidgetCenter.shared.reloadAllTimelines() }
    
    var body: some View {
        NavigationView {
            ZStack {
                // 1. BACKGROUND GRADIENT
                LinearGradient(colors: [Color.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing)
                    .ignoresSafeArea()
                
                // 2. MAIN SCROLLABLE CONTENT
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 25) {
                        
                        // --- HEADER: 3D PROGRESS CARD ---
                        ParallaxMotionCard {
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(Date().formatted(date: .complete, time: .omitted).uppercased())
                                            .font(.caption)
                                            .fontWeight(.bold)
                                            .foregroundStyle(.white.opacity(0.6))
                                        
                                        Text("Rise & Grind")
                                            .font(.system(size: 32, weight: .black, design: .rounded))
                                            .foregroundStyle(.white)
                                    }
                                    Spacer()
                                    // Progress Ring
                                    ZStack {
                                        Circle().stroke(.white.opacity(0.2), lineWidth: 8)
                                        Circle()
                                            .trim(from: 0, to: calculateProgress())
                                            .stroke(
                                                LinearGradient(colors: [.indigo, .purple], startPoint: .top, endPoint: .bottom),
                                                style: StrokeStyle(lineWidth: 8, lineCap: .round)
                                            )
                                            .rotationEffect(.degrees(-90))
                                        
                                        Text("\(Int(calculateProgress() * 100))%")
                                            .font(.caption).fontWeight(.bold).foregroundStyle(.white)
                                    }
                                    .frame(width: 60, height: 60)
                                }
                            }
                            .padding(25)
                            .background(
                                LinearGradient(colors: [Color.indigo.opacity(0.8), Color.purple.opacity(0.6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .cornerRadius(25)
                            .shadow(color: .indigo.opacity(0.4), radius: 15, x: 0, y: 10)
                        }
                        .padding(.horizontal)
                        
                        // --- HORIZONTAL CALENDAR ---
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(getWeekDays(), id: \.self) { date in
                                    DayPill(date: date, isSelected: Calendar.current.isDate(date, inSameDayAs: selectedDate)) {
                                        withAnimation(.spring(response: 0.3)) {
                                            selectedDate = date
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                        
                        // --- FOCUS TIMER CARD (NEW) ---
                        NavigationLink(destination: PomodoroView()) {
                            HStack {
                                VStack(alignment: .leading, spacing: 5) {
                                    Text("Deep Focus")
                                    .font(.headline)
                                    .foregroundStyle(.white)
                                    Text("Start a 25m session")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                                                        }
                                Spacer()
                                Image(systemName: "timer")
                                .font(.system(size: 30))
                                .foregroundStyle(.cyan)
                                .symbolEffect(.pulse.byLayer, options: .repeating)
                                                    }
                                .padding()
                                .glassEffect()
                                .padding(.horizontal)
                                                }
                                .buttonStyle(BouncyButton())
                        
                        
                        
                        
                        
                        // --- TASKS SECTION ---
                        VStack(alignment: .leading, spacing: 15) {
                            Text("TASKS").font(.caption).fontWeight(.black).foregroundStyle(.secondary).padding(.horizontal)
                            
                            if selectedDateTasks.isEmpty {
                                EmptyStateCard(icon: "checkmark.circle", text: "No Tasks Today")
                            } else {
                                ForEach(selectedDateTasks) { task in
                                    TaskRow3D(task: task) {
                                        toggleTask(task)
                                    }
                                }
                            }
                        }
                        
                        // --- HABITS SECTION ---
                        VStack(alignment: .leading, spacing: 15) {
                            Text("HABITS").font(.caption).fontWeight(.black).foregroundStyle(.secondary).padding(.horizontal)
                            
                            if selectedDateHabits.isEmpty {
                                EmptyStateCard(icon: "flame.slash", text: "No Habits Scheduled")
                            } else {
                                ForEach(selectedDateHabits) { habit in
                                    HabitRow3D(habit: habit, date: selectedDate)
                                }
                            }
                        }
                        
                        Spacer(minLength: 100) // Space for floating tab bar
                    }
                    .padding(.top)
                }
            }
        }
    }
    
    // --- HELPERS ---
    
    func calculateProgress() -> Double {
        let total = selectedDateTasks.count + selectedDateHabits.count
        if total == 0 { return 0 }
        let completedTasks = selectedDateTasks.filter { $0.isCompleted }.count
        let completedHabits = selectedDateHabits.filter {
            $0.completedDates.contains { Calendar.current.isDate($0, inSameDayAs: selectedDate) }
        }.count
        return Double(completedTasks + completedHabits) / Double(total)
    }
    
    func getWeekDays() -> [Date] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        var days: [Date] = []
        for i in -2...4 { // Show 2 days ago -> 4 days future
            if let date = calendar.date(byAdding: .day, value: i, to: today) {
                days.append(date)
            }
        }
        return days
    }
    
    var selectedDateTasks: [DailyTask] {
        allTasks.filter { Calendar.current.isDate($0.createdAt, inSameDayAs: selectedDate) }
    }
    
    var selectedDateHabits: [Habit] {
        let weekdayIndex = Calendar.current.component(.weekday, from: selectedDate) - 1
        return allHabits.filter { $0.weekdays.contains(weekdayIndex) }
    }
    
    func toggleTask(_ task: DailyTask) {
        withAnimation {
            task.isCompleted.toggle()
            if task.isCompleted {
                NotificationManager.shared.cancelTaskNotification(for: task)
            } else {
                NotificationManager.shared.scheduleTaskNotification(for: task)
            }
            updateWidget()
        }
    }
}

// --- SUBVIEWS ---

struct DayPill: View {
    let date: Date
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 5) {
                Text(date.formatted(.dateTime.weekday(.abbreviated)).uppercased())
                    .font(.caption2)
                    .fontWeight(.bold)
                
                Text(date.formatted(.dateTime.day()))
                    .font(.title3)
                    .fontWeight(.black)
            }
            .frame(width: 60, height: 80)
            .background(isSelected ? Color.indigo : Color.white.opacity(0.1))
            .foregroundStyle(isSelected ? .white : .secondary)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.white.opacity(0.5) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(BouncyButton())
    }
}

struct TaskRow3D: View {
    let task: DailyTask
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(task.isCompleted ? .green : .secondary)
                    .contentTransition(.symbolEffect(.replace))
                
                Text(task.title)
                    .strikethrough(task.isCompleted)
                    .foregroundStyle(task.isCompleted ? .secondary : .primary)
                    .fontWeight(.medium)
                
                Spacer()
            }
            .padding()
            .glassEffect()
            .padding(.horizontal)
        }
        .buttonStyle(BouncyButton())
    }
}

struct HabitRow3D: View {
    let habit: Habit
    let date: Date
    @State private var isCompleted = false
    
    var body: some View {
        Button {
            toggle()
        } label: {
            HStack {
                VStack(alignment: .leading) {
                    Text(habit.name)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(habit.action)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                
                Image(systemName: "flame.fill")
                    .font(.title)
                    .foregroundStyle(isCompleted ? LinearGradient(colors: [.orange, .red], startPoint: .bottom, endPoint: .top) : LinearGradient(colors: [.gray], startPoint: .top, endPoint: .bottom))
                    .scaleEffect(isCompleted ? 1.2 : 1.0)
                    .animation(.spring(response: 0.4, dampingFraction: 0.5), value: isCompleted)
            }
            .padding()
            .glassEffect()
            .padding(.horizontal)
        }
        .buttonStyle(BouncyButton())
        .onAppear { checkStatus() }
        .onChange(of: date) { checkStatus() }
    }
    
    func toggle() {
        // Toggle logic
        if isCompleted {
            habit.completedDates.removeAll { Calendar.current.isDate($0, inSameDayAs: date) }
        } else {
            habit.completedDates.append(date)
        }
        withAnimation { isCompleted.toggle() }
        WidgetCenter.shared.reloadAllTimelines()
    }
    
    func checkStatus() {
        isCompleted = habit.completedDates.contains { Calendar.current.isDate($0, inSameDayAs: date) }
    }
}

struct EmptyStateCard: View {
    let icon: String
    let text: String
    var body: some View {
        HStack {
            Image(systemName: icon)
            Text(text)
        }
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}
