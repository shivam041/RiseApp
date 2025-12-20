import SwiftUI
import SwiftData

struct HabitCardView: View {
    @Bindable var habit: Habit
    
    var isCompletedToday: Bool {
        habit.completedDates.contains { Calendar.current.isDateInToday($0) }
    }
    
    var body: some View {
        HStack(spacing: 15) {
            
            // 1. CHECKBOX
            Button {
                toggleCompletion()
            } label: {
                ZStack {
                    Circle()
                        .stroke(isCompletedToday ? Color.indigo : Color.gray.opacity(0.3), lineWidth: 2)
                        .frame(width: 32, height: 32)
                    
                    if isCompletedToday {
                        Circle()
                            .fill(Color.indigo)
                            .frame(width: 20, height: 20)
                            .overlay {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(.white)
                            }
                            .transition(.scale)
                    }
                }
            }
            .buttonStyle(.plain)
            
            // 2. TEXT CONTENT
            VStack(alignment: .leading, spacing: 4) {
                Text(habit.name)
                    .font(.system(.headline, design: .rounded))
                    .strikethrough(isCompletedToday)
                    // Adaptive Color Fix
                    .foregroundStyle(isCompletedToday ? Color.secondary : Color.primary)
                
                Text(habit.action)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            // 3. STREAK
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(habit.completedDates.count > 0 ? Color.orange : Color.gray.opacity(0.3))
                Text("\(habit.completedDates.count)")
                    .font(.system(.subheadline, design: .rounded, weight: .bold))
                    .foregroundStyle(habit.completedDates.count > 0 ? Color.primary : Color.gray)
            }
            .padding(8)
            .background(Color(uiColor: .tertiarySystemFill))
            .clipShape(Capsule())
        }
        .padding()
        // Adaptive Background Fix
        .background(Color(uiColor: .secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    func toggleCompletion() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
            if isCompletedToday {
                habit.completedDates.removeAll { Calendar.current.isDateInToday($0) }
            } else {
                habit.completedDates.append(Date())
            }
        }
    }
}
