import SwiftData
import SwiftUI

// 1. UPDATE THE STRUCT
struct WidgetData {
    var quoteText: String = "Keep Rising"
    var quoteAuthor: String = "RiseApp" // <--- ADDED THIS FIELD
    var completedHabits: Int = 0
    var totalHabits: Int = 0
    var topTasks: [String] = []
}

class WidgetDataManager {
    static let shared = WidgetDataManager()
    
    let modelContainer: ModelContainer
    
    init() {
        do {
            // Connect to the shared App Group database
            let fullSchema = Schema([DailyTask.self, Habit.self])
            let configuration = ModelConfiguration(isStoredInMemoryOnly: false)
            modelContainer = try ModelContainer(for: fullSchema, configurations: configuration)
        } catch {
            fatalError("Failed to create Widget Container: \(error)")
        }
    }
    
    func loadSnapshot() -> WidgetData {
        let context = ModelContext(modelContainer)
        
        // 1. FETCH TASKS (Newest First)
        var topTasks: [String] = []
        do {
            let descriptor = FetchDescriptor<DailyTask>(
                predicate: #Predicate { !$0.isCompleted },
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )
            let allTasks = try context.fetch(descriptor)
            topTasks = allTasks.prefix(3).map { $0.title }
        } catch {
            print("Widget Task Fetch Failed: \(error)")
        }
        
        // 2. FETCH HABITS (Smart Calendar Check)
        var completedCount = 0
        var totalCount = 0
        
        do {
            let descriptor = FetchDescriptor<Habit>()
            let habits = try context.fetch(descriptor)
            totalCount = habits.count
            
            let calendar = Calendar.current
            completedCount = habits.filter { habit in
                habit.completedDates.contains { date in
                    calendar.isDate(date, inSameDayAs: Date())
                }
            }.count
            
        } catch {
            print("Widget Habit Fetch Failed: \(error)")
        }
        
        // 3. RETURN DATA WITH AUTHOR
        return WidgetData(
            quoteText: "Discipline is freedom.",
            quoteAuthor: "Jocko Willink", // <--- ADDED THIS VALUE
            completedHabits: completedCount,
            totalHabits: totalCount,
            topTasks: topTasks
        )
    }
}
