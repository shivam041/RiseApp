import SwiftUI
import SwiftData

struct HabitsPageView: View {
    @Environment(\.modelContext) private var modelContext // <--- Needed for deletion
    @Query private var habits: [Habit]
    @State private var showingAddHabit = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                LinearGradient(colors: [.black, Color(uiColor: .darkGray)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
                
                List {
                    // --- HEADER SECTION ---
                    Section {
                        HStack {
                            Text("Your Habits")
                                .font(.system(size: 34, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.top, 20)
                        .padding(.bottom, 10)
                    }
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 0, leading: 20, bottom: 0, trailing: 20))
                    
                    // --- EMPTY STATE ---
                    if habits.isEmpty {
                        Section {
                            EmptyStateCard(icon: "flame.slash", text: "No habits yet. Start one!")
                        }
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                    }
                    
                    // --- HABITS LIST ---
                    ForEach(habits) { habit in
                        ZStack {
                            // 1. Hidden Navigation Link (Keeps row clickable, hides the arrow >)
                            NavigationLink(destination: HabitDetailView(habit: habit)) {
                                EmptyView()
                            }
                            .opacity(0)
                            
                            // 2. The Custom Habit Row
                            HabitRow3D(habit: habit, date: Date())
                        }
                        .listRowBackground(Color.clear) // Transparent row
                        .listRowSeparator(.hidden)      // Remove lines
                        .listRowInsets(EdgeInsets(top: 8, leading: 20, bottom: 8, trailing: 20)) // Mimic VStack spacing
                        
                        // 3. SWIPE TO DELETE ACTION
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                withAnimation {
                                    deleteHabit(habit)
                                }
                            } label: {
                                Label("Delete", systemImage: "trash.fill")
                            }
                            .tint(.red)
                        }
                    }
                    
                    // Spacer at bottom so FAB doesn't cover last item
                    Section {
                        Color.clear.frame(height: 100)
                    }
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                }
                .listStyle(.plain) // Removes default iOS styling
                .scrollContentBackground(.hidden) // Makes list transparent to show gradient
                
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
                        .padding(.bottom, 90)
                    }
                }
            }
            .sheet(isPresented: $showingAddHabit) {
                AddHabitView()
            }
        }
    }
    
    // --- DELETE FUNCTION ---
    func deleteHabit(_ habit: Habit) {
        modelContext.delete(habit)
    }
}
