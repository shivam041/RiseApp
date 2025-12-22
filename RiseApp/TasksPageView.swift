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
                // Background Gradient
                LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
                
                // MARK: - Main List
                List {
                    // 1. Header (Inside List so it scrolls)
                    Section {
                        HStack {
                            Text("Tasks")
                                .font(.system(size: 34, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.top, 10)
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                    }
                    
                    if tasks.isEmpty {
                        // Empty State
                        Section {
                            EmptyStateCard(icon: "checkmark.circle.trianglebadge.exclamationmark", text: "All caught up!")
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                        }
                    } else {
                        // 2. Task List
                        ForEach(tasks) { task in
                            ZStack {
                                // Navigation Link for Editing
                                NavigationLink(destination: EditTaskView(task: task)) {
                                    EmptyView()
                                }
                                .opacity(0) // Hide the arrow
                                
                                // Display Logic
                                VStack(alignment: .leading, spacing: 4) {
                                    TaskRow3D(task: task) {
                                        toggleTask(task)
                                    }
                                    
                                    // Reminder Date Text
                                    if let reminder = task.reminders.first {
                                        HStack {
                                            Image(systemName: "clock.fill")
                                                .font(.caption2)
                                            Text(reminder.formatted(date: .abbreviated, time: .shortened))
                                                .font(.caption)
                                                .fontWeight(.medium)
                                        }
                                        .foregroundStyle(.white.opacity(0.5))
                                        .padding(.leading, 12)
                                    }
                                }
                            }
                            .listRowBackground(Color.clear) // Transparent Row
                            .listRowSeparator(.hidden)      // No Lines
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16)) // Custom Padding
                        }
                        .onDelete(perform: deleteItems) // <--- THIS ENABLES SWIPE TO DELETE
                    }
                    
                    // Spacer at bottom for floating button
                    Section {
                        Spacer().frame(height: 100)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden) // <--- Makes the List transparent
                
                // MARK: - Floating Add Button
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
    
    // Logic to delete tasks from SwiftData
    func deleteItems(at offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                let taskToDelete = tasks[index]
                modelContext.delete(taskToDelete)
            }
        }
    }
    
    func toggleTask(_ task: DailyTask) {
        withAnimation {
            task.isCompleted.toggle()
            if task.isCompleted {
                HapticManager.shared.success()
                confettiTrigger += 1
            } else {
                HapticManager.shared.lightImpact()
            }
        }
    }
}
