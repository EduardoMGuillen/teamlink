import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var recentActivity: [ActivityItem] = []
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    headerSection
                    
                    // Quick Actions
                    quickActionsSection
                    
                    // Stats Cards
                    statsSection
                    
                    // Recent Activity
                    recentActivitySection
                }
                .padding()
            }
            .navigationTitle("TeamLink")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.blue)
                    }
                }
            }
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Welcome back,")
                .font(.subheadline)
                .foregroundColor(.secondary)
            Text(appState.currentUser?.name ?? "User")
                .font(.title)
                .fontWeight(.bold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.headline)
                .padding(.horizontal, 4)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                QuickActionCard(
                    icon: "clock.fill",
                    title: "Clock In",
                    color: .green
                ) {
                    // Navigate to time clock
                }
                
                QuickActionCard(
                    icon: "calendar",
                    title: "View Schedule",
                    color: .blue
                ) {
                    // Navigate to schedule
                }
                
                QuickActionCard(
                    icon: "checklist",
                    title: "My Tasks",
                    color: .orange
                ) {
                    // Navigate to tasks
                }
                
                QuickActionCard(
                    icon: "message.fill",
                    title: "Messages",
                    color: .purple
                ) {
                    // Navigate to messages
                }
            }
        }
    }
    
    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("This Week")
                .font(.headline)
                .padding(.horizontal, 4)
            
            HStack(spacing: 12) {
                StatCard(
                    title: "Hours",
                    value: "32.5",
                    icon: "clock.fill",
                    color: .blue
                )
                
                StatCard(
                    title: "Tasks",
                    value: "8",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
            }
        }
    }
    
    private var recentActivitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activity")
                .font(.headline)
                .padding(.horizontal, 4)
            
            VStack(spacing: 8) {
                ForEach(ActivityItem.sampleData) { item in
                    ActivityRow(item: item)
                }
            }
        }
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct ActivityItem: Identifiable {
    let id: String
    let type: ActivityType
    let title: String
    let subtitle: String
    let timestamp: Date
    let icon: String
    
    enum ActivityType {
        case shift
        case task
        case message
        case update
    }
    
    static let sampleData = [
        ActivityItem(
            id: "1",
            type: .shift,
            title: "Clocked in",
            subtitle: "8:45 AM",
            timestamp: Date(),
            icon: "clock.fill"
        ),
        ActivityItem(
            id: "2",
            type: .task,
            title: "Task completed",
            subtitle: "Daily checklist",
            timestamp: Date().addingTimeInterval(-3600),
            icon: "checkmark.circle.fill"
        ),
        ActivityItem(
            id: "3",
            type: .message,
            title: "New message",
            subtitle: "From Manager",
            timestamp: Date().addingTimeInterval(-7200),
            icon: "message.fill"
        )
    ]
}

struct ActivityRow: View {
    let item: ActivityItem
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.icon)
                .foregroundColor(.blue)
                .frame(width: 32, height: 32)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(item.subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(item.timestamp, style: .relative)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}

