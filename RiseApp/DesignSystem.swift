import SwiftUI

// 1. TACTILE BUTTON STYLE (Bouncy 3D Press)
struct BouncyButton: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
    }
}

// 2. GLASS CARD MODIFIER
struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial)
            .environment(\.colorScheme, .dark) // Force dark glass for contrast
            .cornerRadius(20)
            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(.white.opacity(0.2), lineWidth: 1)
            )
    }
}

// 3. 3D PARALLAX CARD (The "Wow" Factor)
struct ParallaxMotionCard<Content: View>: View {
    var content: Content
    @State private var offset = CGSize.zero
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .rotation3DEffect(
                .degrees(Double(offset.width / 10)),
                axis: (x: 0, y: 1, z: 0)
            )
            .rotation3DEffect(
                .degrees(Double(-offset.height / 10)),
                axis: (x: 1, y: 0, z: 0)
            )
            .gesture(
                DragGesture()
                    .onChanged { value in
                        withAnimation(.interactiveSpring) {
                            offset = value.translation
                        }
                    }
                    .onEnded { _ in
                        withAnimation(.spring) {
                            offset = .zero
                        }
                    }
            )
    }
}

// Extension to make applying easier
extension View {
    func glassEffect() -> some View {
        modifier(GlassCard())
    }
}
