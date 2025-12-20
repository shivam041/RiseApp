import Foundation
import SwiftData

@Model
final class Habit {
    var id: UUID
    var name: String
    var action: String
    var weekdays: [Int] // 0 = Sunday, 1 = Monday, etc.
    var startDate: Date
    var completedDates: [Date]
    var isRepeatable: Bool
    
    // Note: Storing time as a Date object is standard in iOS
    // We will ignore the Day/Month/Year components when using these for reminders
    var reminderTimes: [Date]
    
    init(name: String, action: String, weekdays: [Int] = [], startDate: Date = Date(), isRepeatable: Bool = true, reminderTimes: [Date] = []) {
        self.id = UUID()
        self.name = name
        self.action = action
        self.weekdays = weekdays
        self.startDate = startDate
        self.completedDates = []
        self.isRepeatable = isRepeatable
        self.reminderTimes = reminderTimes
    }
}
