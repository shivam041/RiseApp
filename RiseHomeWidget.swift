import WidgetKit
import SwiftUI

// 1. The Timeline Provider (Tells iOS when to update)
struct HomeProvider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: WidgetDataManager.shared.loadSnapshot())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), data: WidgetDataManager.shared.loadSnapshot())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Refresh every 30 minutes, or whenever the main app forces a reload
        let entry = SimpleEntry(date: Date(), data: WidgetDataManager.shared.loadSnapshot())
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// 2. The Widget View (UI)
struct RiseHomeWidgetEntryView : View {
    var entry: HomeProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            
            // TOP: Quote
            VStack(alignment: .leading, spacing: 4) {
                Text("Daily Inspiration")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundStyle(.indigo)
                
                Text("\"\(entry.data.quoteText)\"")
                    .font(.caption)
                    .italic()
                    .lineLimit(2) // Keep it short
                
                Text("- \(entry.data.quoteAuthor)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            
            Divider()
            
            // MIDDLE: Habits Progress
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(entry.data.completedHabits)/\(entry.data.totalHabits) Habits")
                    .font(.caption)
                    .fontWeight(.bold)
            }
            
            // BOTTOM: Tasks List
            VStack(alignment: .leading, spacing: 4) {
                if entry.data.topTasks.isEmpty {
                    Text("No tasks remaining!")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(entry.data.topTasks, id: \.self) { taskTitle in
                        HStack(spacing: 6) {
                            Circle().stroke(lineWidth: 1).frame(width: 8, height: 8)
                            Text(taskTitle)
                                .font(.caption)
                                .lineLimit(1)
                        }
                    }
                }
            }
        }
        .padding()
    }
}

// 3. The Widget Configuration
struct RiseHomeWidget: Widget {
    let kind: String = "RiseHomeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HomeProvider()) { entry in
            RiseHomeWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Rise Dashboard")
        .description("View your daily quote, habit progress, and top tasks.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
