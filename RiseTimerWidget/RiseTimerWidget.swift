import WidgetKit
import SwiftUI

// 1. THE TIMELINE PROVIDER
// This tells the widget when to update and where to get data
struct Provider: AppIntentTimelineProvider {
    
    // Placeholder is what shows up in the "Gallery" before you add it
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), data: WidgetData(
            quoteText: "Rise & Grind",
            quoteAuthor: "You",
            completedHabits: 3,
            totalHabits: 5,
            topTasks: ["Build App", "Hit Gym"]
        ))
    }

    // Snapshot is a quick view for the system
    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let data = WidgetDataManager.shared.loadSnapshot()
        return SimpleEntry(date: Date(), configuration: configuration, data: data)
    }

    // Timeline is the schedule for updates
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        // Load real data from our shared manager
        let data = WidgetDataManager.shared.loadSnapshot()
        
        // Create an entry for "Now"
        let entry = SimpleEntry(date: Date(), configuration: configuration, data: data)
        
        // Refresh every 15 minutes automatically
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60)))
    }
}

// 2. THE DATA ENTRY
struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let data: WidgetData // Holds our Tasks/Habits/Quotes
}

// 3. THE WIDGET VIEW
struct RiseTimerWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            // GLOBAL BACKGROUND (Dark Gradient)
            ContainerRelativeShape()
                .fill(LinearGradient(
                    colors: [.black, Color(uiColor: .darkGray)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
            
            // SWITCH LAYOUT BASED ON SIZE
            switch family {
            case .systemSmall:
                SmallWidgetView(data: entry.data)
            case .systemMedium:
                MediumWidgetView(data: entry.data)
            default:
                SmallWidgetView(data: entry.data)
            }
        }
    }
}

// --- SMALL LAYOUT (Focus & Quote) ---
struct SmallWidgetView: View {
    let data: WidgetData
    
    var progress: Double {
        guard data.totalHabits > 0 else { return 0 }
        return Double(data.completedHabits) / Double(data.totalHabits)
    }
    
    var body: some View {
        VStack(spacing: 10) {
            // Header
            HStack {
                Text("RISE")
                    .font(.system(size: 12, weight: .black, design: .rounded))
                    .foregroundStyle(.cyan)
                    .tracking(2)
                Spacer()
                Image(systemName: "flame.fill")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            
            Spacer()
            
            // Progress Ring
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        LinearGradient(colors: [.cyan, .blue], startPoint: .top, endPoint: .bottom),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 0) {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                }
            }
            .frame(width: 55, height: 55)
            
            Spacer()
            
            // Quote (Truncated)
            Text(data.quoteText)
                .font(.system(size: 10, weight: .medium, design: .serif))
                .foregroundStyle(.white.opacity(0.7))
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// --- MEDIUM LAYOUT (Stats + Task List) ---
struct MediumWidgetView: View {
    let data: WidgetData
    
    var progress: Double {
        guard data.totalHabits > 0 else { return 0 }
        return Double(data.completedHabits) / Double(data.totalHabits)
    }
    
    var body: some View {
        HStack(spacing: 20) {
            // LEFT SIDE: Progress & Stats
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "chart.bar.fill")
                        .foregroundStyle(.cyan)
                    Text("STATUS")
                        .font(.system(size: 10, weight: .black))
                        .foregroundStyle(.white.opacity(0.5))
                }
                .padding(.bottom, 5)
                
                // Big Number
                HStack(alignment: .lastTextBaseline, spacing: 2) {
                    Text("\(data.completedHabits)")
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text("/\(data.totalHabits)")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.5))
                }
                Text("Habits Done")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                
                Spacer()
                
                // Mini Quote
                Text("\"\(data.quoteText)\"")
                    .font(.system(size: 9, design: .serif))
                    .foregroundStyle(.white.opacity(0.6))
                    .lineLimit(2)
            }
            .frame(maxWidth: 100)
            
            // DIVIDER
            Rectangle()
                .fill(LinearGradient(colors: [.clear, .white.opacity(0.2), .clear], startPoint: .top, endPoint: .bottom))
                .frame(width: 1)
            
            // RIGHT SIDE: Task List
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("UP NEXT")
                        .font(.system(size: 10, weight: .black))
                        .foregroundStyle(.pink)
                    Spacer()
                }
                
                if data.topTasks.isEmpty {
                    Text("All caught up!")
                        .font(.caption)
                        .italic()
                        .foregroundStyle(.white.opacity(0.5))
                } else {
                    ForEach(data.topTasks.prefix(3), id: \.self) { taskTitle in
                        HStack {
                            Circle()
                                .stroke(.pink, lineWidth: 1.5)
                                .frame(width: 8, height: 8)
                            Text(taskTitle)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(.white)
                                .lineLimit(1)
                            Spacer()
                        }
                        .padding(6)
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(6)
                    }
                }
                Spacer()
            }
        }
        .padding()
    }
}

// 4. THE WIDGET CONFIGURATION
@main
struct RiseTimerWidget: Widget {
    let kind: String = "RiseTimerWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            RiseTimerWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Rise Dashboard")
        .description("Track your daily habits and tasks.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// 5. PREVIEW HELPER (For Xcode Canvas)
#Preview(as: .systemSmall) {
    RiseTimerWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: .init(), data: WidgetData(
        quoteText: "Discipline equals Freedom",
        completedHabits: 2,
        totalHabits: 4,
        topTasks: ["Finish Code", "Read Book"]
    ))
}
