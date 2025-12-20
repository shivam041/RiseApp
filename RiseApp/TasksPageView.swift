import SwiftUI
import SwiftData

struct TasksPageView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \DailyTask.createdAt, order: .reverse) private var tasks: [DailyTask]
    @State private var showingAddTask = false
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        HStack {
                            Text("Master List")
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
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskSheet()
            }
        }
    }
    
    func toggleTask(_ task: DailyTask) {
        withAnimation {
            task.isCompleted.toggle()
        }
    }
}

// --- RESTORED ADD TASK SHEET ---
struct AddTaskSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var wantsReminder = false
    @State private var reminderTime = Date()
    @State private var notes = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Details")) {
                    TextField("Task Title", text: $title)
                    TextField("Notes (Optional)", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
                
                Section(header: Text("Reminders")) {
                    Toggle("Set Initial Reminder", isOn: $wantsReminder)
                    if wantsReminder {
                        DatePicker("Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
                    }
                }
            }
            .navigationTitle("New Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        saveTask()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
    
    func saveTask() {
        // Create the initial reminders array
        let initialReminders: [Date] = wantsReminder ? [reminderTime] : []
        
        let newTask = DailyTask(title: title, reminders: initialReminders, notes: notes)
        modelContext.insert(newTask)
        
        if wantsReminder {
            NotificationManager.shared.scheduleTaskNotification(for: newTask)
        }
        
        dismiss()
    }
}
