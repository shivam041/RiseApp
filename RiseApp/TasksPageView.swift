import SwiftUI
import SwiftData

struct TasksPageView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \DailyTask.createdAt, order: .reverse) private var tasks: [DailyTask]
    @State private var showingAddTask = false
    @State private var confettiTrigger = 0
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        HStack {
                            Text("Tasks")
                                .font(.system(size: 34, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.horizontal)
                        .padding(.top, 20)
                        
                        if tasks.isEmpty {
                            EmptyStateCard(icon: "checkmark.circle.trianglebadge.exclamationmark", text: "All caught up!")
                        } else {
                            LazyVStack(spacing: 12) {
                                ForEach(tasks) { task in
                                    NavigationLink(destination: EditTaskView(task: task)) {
                                        TaskRow3D(task: task) {
                                            toggleTask(task)
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer(minLength: 100)
                    }
                }
                
                // Floating Add Button
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button {
                            showingAddTask = true
                        } label: {
                            Image(systemName: "plus")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                                .frame(width: 60, height: 60)
                                .background(Color.pink)
                                .clipShape(Circle())
                                .shadow(color: .pink.opacity(0.5), radius: 10, y: 5)
                        }
                        .buttonStyle(BouncyButton())
                        .padding(.trailing, 20)
                        .padding(.bottom, 90)
                    }
                }
                ConfettiView(trigger: $confettiTrigger).allowsHitTesting(false)
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskSheet()
            }
        }
    }
    
    func toggleTask(_ task: DailyTask) {
            withAnimation {
                task.isCompleted.toggle()
                
                // NEW GAMIFICATION LOGIC
                if task.isCompleted {
                    HapticManager.shared.success()
                    confettiTrigger += 1
                } else {
                    HapticManager.shared.lightImpact()
                }
            }
        }
}


// --- MODERN GLASS ADD TASK SHEET ---
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
            
            VStack(spacing: 25) {
                // Handle bar
                Capsule()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 4)
                    .padding(.top, 20)
                
                Text("New Task")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                
                // 2. Input Fields (Glass)
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
                        DatePicker("Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
                            .datePickerStyle(.compact)
                            .colorScheme(.dark) // Force dark picker
                            .padding()
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(12)
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
                .padding(.horizontal)
                
                Spacer()
                
                // 3. Action Buttons
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
}
