import SwiftData
import Foundation

@Model
class DailyTask {
    var id: UUID
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    var reminders: [Date] // <--- CHANGED: Now holds multiple dates
    var notes: String     // <--- NEW: Stores extra details

    init(title: String, reminders: [Date] = [], notes: String = "") {
        self.id = UUID()
        self.title = title
        self.isCompleted = false
        self.createdAt = Date()
        self.reminders = reminders
        self.notes = notes
    }
}
