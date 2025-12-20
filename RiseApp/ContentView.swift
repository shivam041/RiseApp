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
            }
            
            // THE NEON FLOATING BAR
            HStack(spacing: 0) {
                TabItem(icon: "square.grid.2x2.fill", title: "Home", color: .cyan, isActive: selectedTab == 0) { selectedTab = 0 }
                TabItem(icon: "flame.fill", title: "Habits", color: .orange, isActive: selectedTab == 1) { selectedTab = 1 }
                TabItem(icon: "checkmark.circle.fill", title: "Tasks", color: .pink, isActive: selectedTab == 2) { selectedTab = 2 }
            }
            .padding(12)
            .background(.ultraThinMaterial)
            .background(Color.black.opacity(0.4)) // Extra dark tint
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.4), radius: 10, y: 10)
            .overlay(Capsule().stroke(.white.opacity(0.15), lineWidth: 1))
            .padding(.horizontal, 20)
            .padding(.bottom, 10)
        }
        .ignoresSafeArea(.keyboard)
        .preferredColorScheme(.dark) // Force Dark Mode for the whole app
    }
}

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
                    .font(.system(size: 22, weight: isActive ? .bold : .medium))
                    .symbolEffect(.bounce, value: isActive)
                
                if isActive {
                    Text(title).font(.caption2).fontWeight(.bold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .foregroundStyle(isActive ? color : .white.opacity(0.4)) // Bright color vs Dim White
            .shadow(color: isActive ? color.opacity(0.5) : .clear, radius: 10) // Neon Glow effect
            .contentShape(Rectangle())
        }
        .buttonStyle(BouncyButton())
    }
}
