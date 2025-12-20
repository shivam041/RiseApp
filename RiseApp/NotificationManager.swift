import Foundation
import UserNotifications

class NotificationManager {
    static let shared = NotificationManager()
    
    // 1. Request Permission (KEPT OLD NAME to fix RiseAppApp error)
    func requestAuthorization() {
        let options: UNAuthorizationOptions = [.alert, .sound, .badge]
        UNUserNotificationCenter.current().requestAuthorization(options: options) { success, error in
            if let error = error {
                print("Error: \(error.localizedDescription)")
            } else {
                print("Permission granted: \(success)")
            }
        }
    }
    
    // 2. Schedule Notifications for a Habit
    func scheduleNotification(for habit: Habit) {
        cancelNotifications(for: habit)
        
        guard !habit.reminderTimes.isEmpty else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Time to Rise"
        content.body = "Don't forget to: \(habit.name)"
        content.sound = .default
        
        for weekday in habit.weekdays {
            for timeDate in habit.reminderTimes {
                var dateComponents = Calendar.current.dateComponents([.hour, .minute], from: timeDate)
                // Apple uses 1=Sunday, your Habit model uses 0=Sunday
                dateComponents.weekday = weekday + 1
                
                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
                let identifier = "\(habit.id.uuidString)-\(weekday)-\(dateComponents.hour!)-\(dateComponents.minute!)"
                
                let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
                
                UNUserNotificationCenter.current().add(request) { error in
                    if let error = error { print("Error scheduling: \(error)") }
                }
            }
        }
    }
    
    // 3. Cancel Notifications for Habit
    func cancelNotifications(for habit: Habit) {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            let habitIds = requests
                .filter { $0.identifier.starts(with: habit.id.uuidString) }
                .map { $0.identifier }
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: habitIds)
        }
    }
    
    // 4. Schedule Task Notifications (UPDATED for Multiple Reminders)
    func scheduleTaskNotification(for task: DailyTask) {
        // First, clear old reminders
        cancelTaskNotification(for: task)
        
        // Loop through the NEW 'reminders' array
        for (index, reminderDate) in task.reminders.enumerated() {
            if reminderDate > Date() && !task.isCompleted {
                let content = UNMutableNotificationContent()
                content.title = "Task Reminder"
                content.body = task.title
                content.sound = .default
                content.categoryIdentifier = "TASK_CATEGORY" // Allows "Mark as Done"

                let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: reminderDate)
                let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
                
                // Unique ID: TaskID + Index (so multiple reminders don't overwrite each other)
                let identifier = "task-\(task.id.uuidString)-\(index)"
                
                let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
                UNUserNotificationCenter.current().add(request)
            }
        }
    }
        
    // 5. Cancel Task Notification
    func cancelTaskNotification(for task: DailyTask) {
        // Cancel all potential reminder indices (0 to 20)
        var identifiers: [String] = []
        for i in 0..<20 {
            identifiers.append("task-\(task.id.uuidString)-\(i)")
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
    }
    
    // 6. Schedule Daily Quotes
    func scheduleDailyQuotes() {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            let quoteIds = requests
                .filter { $0.identifier.starts(with: "daily-quote-") }
                .map { $0.identifier }
            
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: quoteIds)
            self.queueQuotes()
        }
    }
    
    private func queueQuotes() {
        let shuffledQuotes = QuoteLibrary.allQuotes.shuffled()
        
        for (index, quote) in shuffledQuotes.enumerated() {
            let content = UNMutableNotificationContent()
            content.title = "Daily Inspiration"
            content.body = "\"\(quote.text)\" — \(quote.author)"
            content.sound = .default
            
            guard let triggerDate = Calendar.current.date(byAdding: .day, value: index + 1, to: Date()) else { continue }
            
            var dateComponents = Calendar.current.dateComponents([.year, .month, .day], from: triggerDate)
            dateComponents.hour = 7
            dateComponents.minute = 0
            
            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
            let identifier = "daily-quote-\(index)"
            
            let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request)
        }
        print("Scheduled \(shuffledQuotes.count) quotes starting tomorrow.")
    }
}
