import SwiftUI

struct MoreView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            List {
                // Profile Section
                Section {
                    HStack(spacing: 16) {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 60, height: 60)
                            .overlay(
                                Text(appState.currentUser?.name.prefix(1).uppercased() ?? "U")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.currentUser?.name ?? "User")
                                .font(.headline)
                            Text(appState.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                
                // Operations Hub
                Section("Operations Hub") {
                    NavigationLink(destination: FormsView()) {
                        Label("Forms & Checklists", systemImage: "doc.text.fill")
                    }
                    
                    NavigationLink(destination: ChatView()) {
                        Label("Chat", systemImage: "message.fill")
                    }
                }
                
                // Communications Hub
                Section("Communications") {
                    NavigationLink(destination: UpdatesView()) {
                        Label("Updates", systemImage: "bell.fill")
                    }
                    
                    NavigationLink(destination: DirectoryView()) {
                        Label("Directory", systemImage: "person.2.fill")
                    }
                    
                    NavigationLink(destination: KnowledgeBaseView()) {
                        Label("Knowledge Base", systemImage: "book.fill")
                    }
                }
                
                // HR Hub
                Section("HR Hub") {
                    NavigationLink(destination: TrainingView()) {
                        Label("Training", systemImage: "graduationcap.fill")
                    }
                    
                    NavigationLink(destination: DocumentsView()) {
                        Label("Documents", systemImage: "folder.fill")
                    }
                }
                
                // Settings
                Section("Settings") {
                    NavigationLink(destination: SettingsView()) {
                        Label("Settings", systemImage: "gearshape.fill")
                    }
                    
                    Button(action: {
                        appState.isAuthenticated = false
                    }) {
                        Label("Sign Out", systemImage: "arrow.right.square.fill")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("More")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

#Preview {
    MoreView()
        .environmentObject(AppState())
}

