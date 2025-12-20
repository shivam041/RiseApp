import ActivityKit
import WidgetKit
import SwiftUI

struct RiseTimerWidgetLiveActivity: Widget {
    // We explicitly tell it to use "TimerAttributes"
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // -------------------------------------------------
            // 1. THE LOCK SCREEN UI
            // -------------------------------------------------
            HStack {
                // Left side: Status Icon & Text
                VStack(alignment: .leading) {
                    HStack {
                        Image(systemName: context.state.modeName == "Focus" ? "brain.head.profile" : "cup.and.saucer.fill")
                            .foregroundStyle(.white)
                        Text(context.state.modeName)
                            .font(.headline)
                            .foregroundStyle(.white)
                    }
                    Text(context.attributes.timerName)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.8))
                }
                
                Spacer()
                
                // Right side: The Countdown
                Text(context.state.estimatedEndTime, style: .timer)
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundStyle(.yellow)
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8)) // Dark background
            .activitySystemActionForegroundColor(Color.white) // White text for system buttons
            
        } dynamicIsland: { context in
            // -------------------------------------------------
            // 2. THE DYNAMIC ISLAND (If you have an iPhone 14/15 Pro)
            // -------------------------------------------------
            DynamicIsland {
                // Expanded View (Long press)
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.modeName).font(.caption).foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.estimatedEndTime, style: .timer).foregroundStyle(.yellow)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    // Optional: Add a progress bar here later
                }
            } compactLeading: {
                Image(systemName: "timer").foregroundStyle(.yellow)
            } compactTrailing: {
                Text(context.state.estimatedEndTime, style: .timer)
                    .foregroundStyle(.yellow)
                    .frame(width: 45)
            } minimal: {
                Image(systemName: "timer").foregroundStyle(.yellow)
            }
        }
    }
}
