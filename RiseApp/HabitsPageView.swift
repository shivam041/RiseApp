import SwiftUI
import SwiftData

struct HabitsPageView: View {
    @Query private var habits: [Habit]
    @State private var showingAddHabit = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Header
                        HStack {
                            Text("Your Rituals")
                                .font(.system(size: 34, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.horizontal)
                        .padding(.top, 20)
                        
                        // The Grid/List
                        if habits.isEmpty {
                            EmptyStateCard(icon: "flame.slash", text: "No habits yet. Start one!")
                        } else {
                            LazyVStack(spacing: 15) {
                                ForEach(habits) { habit in
                                    NavigationLink(destination: HabitDetailView(habit: habit)) {
                                        HabitRow3D(habit: habit, date: Date()) // Reusing our 3D Row
                                    }
                                }
                            }
                        }
                        
                        Spacer(minLength: 100)
                    }
                }
                
                // Floating Action Button (FAB)
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button {
                            showingAddHabit = true
                        } label: {
                            Image(systemName: "plus")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundStyle(.black)
                                .frame(width: 60, height: 60)
                                .background(Color.orange)
                                .clipShape(Circle())
                                .shadow(color: .orange.opacity(0.5), radius: 10, y: 5)
                        }
                        .buttonStyle(BouncyButton())
                        .padding(.trailing, 20)
                        .padding(.bottom, 90) // Above tab bar
                    }
                }
            }
            .sheet(isPresented: $showingAddHabit) {
                AddHabitView()
            }
        }
    }
}
