import SwiftUI

// MARK: - 1. HAPTIC ENGINE
class HapticManager {
    static let shared = HapticManager()
    
    // Smooth vibration for simple taps
    func lightImpact() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
    
    // Strong vibration for success/completion
    func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}

// MARK: - 2. CONFETTI CANNON
struct ConfettiView: View {
    @Binding var trigger: Int // Whenever this changes, we fire!
    
    var body: some View {
        ZStack {
            ForEach(0..<50, id: \.self) { index in
                ConfettiParticle(trigger: $trigger, index: index)
            }
        }
    }
}

struct ConfettiParticle: View {
    @Binding var trigger: Int
    let index: Int
    
    // Physics State
    @State private var location: CGPoint = .zero
    @State private var opacity: Double = 0
    @State private var rotation: Double = 0
    @State private var scale: Double = 1
    
    // Random Properties
    let colors: [Color] = [.cyan, .pink, .orange, .purple, .yellow, .white]
    
    var body: some View {
        Circle()
            .fill(colors.randomElement()!)
            .frame(width: 8, height: 8)
            .scaleEffect(scale)
            .position(location)
            .opacity(opacity)
            .rotationEffect(.degrees(rotation))
            // 3D Spin Effect
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: Double.random(in: -1...1), y: Double.random(in: -1...1), z: 0)
            )
            .onChange(of: trigger) {
                fire()
            }
    }
    
    func fire() {
        // 1. Reset
        let screenWidth = UIScreen.main.bounds.width
        let screenHeight = UIScreen.main.bounds.height
        location = CGPoint(x: screenWidth / 2, y: screenHeight / 2) // Start center
        opacity = 1
        scale = 1
        
        // 2. Randomize Trajectory
        let randomX = Double.random(in: -200...200)
        let randomY = Double.random(in: -400...100) // Mostly UP
        let duration = Double.random(in: 1.0...2.0)
        
        // 3. Animate Explosion
        withAnimation(.easeOut(duration: duration)) {
            location = CGPoint(
                x: location.x + randomX,
                y: location.y + randomY + 200 // Gravity pull down at end
            )
            rotation = Double.random(in: 0...720)
        }
        
        // 4. Fade Out
        withAnimation(.easeIn(duration: 0.5).delay(duration - 0.5)) {
            opacity = 0
            scale = 0
        }
    }
}
