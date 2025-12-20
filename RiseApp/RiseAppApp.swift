import SwiftUI
import SwiftData

@main
struct RiseAppApp: App {
    // This acts like a Schema migration manager.
    // We tell it which models we want to store.
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Habit.self,
            Quote.self,
            DailyTask.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
                        .onAppear {
                            // Request Permission
                            NotificationManager.shared.requestAuthorization()
                            
                            // Refresh the Quote Queue
                            NotificationManager.shared.scheduleDailyQuotes()
                        }
        }
        .modelContainer(sharedModelContainer)
    }
}
