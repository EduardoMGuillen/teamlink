import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        if appState.isAuthenticated {
            MainTabView(selectedTab: $selectedTab)
        } else {
            LoginView()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}

