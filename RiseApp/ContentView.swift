import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    init() {
        UITabBar.appearance().isHidden = true
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // THE PAGES
            TabView(selection: $selectedTab) {
                DashboardView()
                    .tag(0)
                
                HabitsPageView()
                    .tag(1)
                
                TasksPageView()
                    .tag(2)
                
                AICoachView() // <--- NEW AI PAGE
                    .tag(3)
            }
            
            // THE NEON FLOATING BAR
            HStack(spacing: 0) {
                TabItem(icon: "square.grid.2x2.fill", title: "Home", color: .cyan, isActive: selectedTab == 0) { selectedTab = 0 }
                TabItem(icon: "flame.fill", title: "Habits", color: .orange, isActive: selectedTab == 1) { selectedTab = 1 }
                TabItem(icon: "checkmark.circle.fill", title: "Tasks", color: .pink, isActive: selectedTab == 2) { selectedTab = 2 }
                TabItem(icon: "brain.head.profile", title: "Rise AI", color: .purple, isActive: selectedTab == 3) { selectedTab = 3 } // <--- NEW BUTTON
            }
            .padding(12)
            .background(.ultraThinMaterial)
            .background(Color.black.opacity(0.4))
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.4), radius: 10, y: 10)
            .overlay(Capsule().stroke(.white.opacity(0.15), lineWidth: 1))
            .padding(.horizontal, 15) // Reduced padding slightly to fit 4 icons
            .padding(.bottom, 10)
        }
        .ignoresSafeArea(.keyboard)
        .preferredColorScheme(.dark)
    }
}

// (Keep the TabItem struct and BouncyButton exactly as they were)
struct TabItem: View {
    var icon: String
    var title: String
    var color: Color
    var isActive: Bool
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: isActive ? .bold : .medium)) // Slightly smaller icon
                    .symbolEffect(.bounce, value: isActive)
                
                if isActive {
                    Text(title).font(.caption2).fontWeight(.bold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .foregroundStyle(isActive ? color : .white.opacity(0.4))
            .shadow(color: isActive ? color.opacity(0.5) : .clear, radius: 10)
            .contentShape(Rectangle())
        }
        .buttonStyle(BouncyButton())
    }
}
