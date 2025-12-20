import ActivityKit
import SwiftUI

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic data (changes every second/minute)
        var estimatedEndTime: Date
        var modeName: String
    }

    // Static data (never changes once started)
    var timerName: String
}
