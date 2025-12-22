import WidgetKit
import SwiftUI
import ActivityKit

// NOTE: We removed the 'TimerAttributes' struct from here because
// it is already defined in your 'TimeAttributes.swift' file.

// MARK: - 1. THE STANDARD WIDGET (Home Screen)
struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), data: WidgetData(
            quoteText: "Rise & Grind", quoteAuthor: "You", completedHabits: 3, totalHabits: 5, topTasks: ["Build App", "Hit Gym"]
        ))
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let data = WidgetDataManager.shared.loadSnapshot()
        return SimpleEntry(date: Date(), configuration: configuration, data: data)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let data = WidgetDataManager.shared.loadSnapshot()
        let entry = SimpleEntry(date: Date(), configuration: configuration, data: data)
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60)))
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let data: WidgetData
}

struct RiseTimerWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .topLeading, endPoint: .bottomTrailing))
            
            switch family {
            case .systemSmall: SmallWidgetView(data: entry.data)
            case .systemMedium: MediumWidgetView(data: entry.data)
            default: SmallWidgetView(data: entry.data)
            }
        }
    }
}

// --- WIDGET VIEWS ---

struct SmallWidgetView: View {
    let data: WidgetData
    var progress: Double {
        guard data.totalHabits > 0 else { return 0 }
        return Double(data.completedHabits) / Double(data.totalHabits)
    }
    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Text("RISE").font(.system(size: 12, weight: .black, design: .rounded)).foregroundStyle(.cyan).tracking(2)
                Spacer()
                Image(systemName: "flame.fill").font(.caption2).foregroundStyle(.orange)
            }
            Spacer()
            ZStack {
                Circle().stroke(Color.white.opacity(0.1), lineWidth: 6)
                Circle().trim(from: 0, to: progress)
                    .stroke(LinearGradient(colors: [.cyan, .blue], startPoint: .top, endPoint: .bottom), style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text("\(Int(progress * 100))%").font(.system(size: 14, weight: .bold, design: .rounded)).foregroundStyle(.white)
            }
            .frame(width: 55, height: 55)
            Spacer()
            Text(data.quoteText).font(.system(size: 10, weight: .medium, design: .serif)).foregroundStyle(.white.opacity(0.7)).lineLimit(2).multilineTextAlignment(.center)
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    let data: WidgetData
    var body: some View {
        HStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 4) {
                HStack { Image(systemName: "chart.bar.fill").foregroundStyle(.cyan); Text("STATUS").font(.system(size: 10, weight: .black)).foregroundStyle(.white.opacity(0.5)) }
                HStack(alignment: .lastTextBaseline, spacing: 2) {
                    Text("\(data.completedHabits)").font(.system(size: 34, weight: .bold, design: .rounded)).foregroundStyle(.white)
                    Text("/\(data.totalHabits)").font(.caption).foregroundStyle(.white.opacity(0.5))
                }
                Text("Habits Done").font(.caption2).foregroundStyle(.secondary)
                Spacer()
                Text("\"\(data.quoteText)\"").font(.system(size: 9, design: .serif)).foregroundStyle(.white.opacity(0.6)).lineLimit(2)
            }.frame(maxWidth: 100)
            Rectangle().fill(LinearGradient(colors: [.clear, .white.opacity(0.2), .clear], startPoint: .top, endPoint: .bottom)).frame(width: 1)
            VStack(alignment: .leading, spacing: 8) {
                Text("UP NEXT").font(.system(size: 10, weight: .black)).foregroundStyle(.pink)
                if data.topTasks.isEmpty { Text("All caught up!").font(.caption).italic().foregroundStyle(.white.opacity(0.5)) }
                else {
                    ForEach(data.topTasks.prefix(3), id: \.self) { taskTitle in
                        HStack { Circle().stroke(.pink, lineWidth: 1.5).frame(width: 8, height: 8); Text(taskTitle).font(.system(size: 12, weight: .medium)).foregroundStyle(.white).lineLimit(1); Spacer() }
                        .padding(6).background(Color.white.opacity(0.05)).cornerRadius(6)
                    }
                }
                Spacer()
            }
        }.padding()
    }
}

struct RiseTimerWidget: Widget {
    let kind: String = "RiseTimerWidget"
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            RiseTimerWidgetEntryView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Rise Dashboard")
        .description("Track your daily habits and tasks.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 2. THE LIVE ACTIVITY (Lock Screen)
struct RiseLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // --- LOCK SCREEN UI ---
            HStack {
                // Left: Icon & Mode
                VStack(alignment: .leading) {
                    HStack {
                        Image(systemName: context.state.modeName == "Focus" ? "brain.head.profile" : "cup.and.saucer.fill")
                            .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
                        Text(context.state.modeName)
                            .font(.headline)
                            .foregroundStyle(.white)
                    }
                    Text("Stay Hard.")
                        .font(.caption)
                        .foregroundStyle(.gray)
                }
                
                Spacer()
                
                // Right: The Timer
                Text(timerInterval: Date()...context.state.estimatedEndTime, countsDown: true)
                    .multilineTextAlignment(.trailing)
                    .monospacedDigit()
                    .font(.system(size: 34, weight: .bold))
                    .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8))
            .activitySystemActionForegroundColor(Color.cyan)
            
        } dynamicIsland: { context in
            // --- DYNAMIC ISLAND UI ---
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.state.modeName, systemImage: "timer")
                        .font(.caption)
                        .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: Date()...context.state.estimatedEndTime, countsDown: true)
                        .monospacedDigit()
                        .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text("Rise Pomodoro")
                        .font(.caption)
                        .foregroundStyle(.gray)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    // Optional Progress Bar or Quote
                }
            } compactLeading: {
                Image(systemName: context.state.modeName == "Focus" ? "brain" : "cup.and.saucer")
                    .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
            } compactTrailing: {
                Text(timerInterval: Date()...context.state.estimatedEndTime, countsDown: true)
                    .monospacedDigit()
                    .frame(width: 40)
                    .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
            } minimal: {
                Image(systemName: "timer")
                    .foregroundStyle(context.state.modeName == "Focus" ? .cyan : .green)
            }
        }
    }
}

// MARK: - 3. THE WIDGET BUNDLE
@main
struct RiseWidgetBundle: WidgetBundle {
    var body: some Widget {
        RiseTimerWidget()        // Home Screen Widget
        RiseLiveActivityWidget() // Lock Screen Live Activity
    }
}
