import Foundation
import SwiftUI

class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var notifications: [Notification] = []
    
    init() {
        // For demo purposes, set authenticated to true
        // In production, check authentication state
        isAuthenticated = true
        currentUser = User.sampleUser
    }
}

