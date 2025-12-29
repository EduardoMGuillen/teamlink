import SwiftUI

struct UpdatesView: View {
    @State private var updates: [Update] = []
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(updates) { update in
                        UpdateCard(update: update)
                    }
                }
                .padding()
            }
            .navigationTitle("Updates")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .onAppear {
                loadUpdates()
            }
        }
    }
    
    private func loadUpdates() {
        updates = [
            Update(
                id: "1",
                authorId: "4",
                authorName: "Manager",
                title: "New Safety Protocols",
                content: "Please review the updated safety protocols in the knowledge base. All employees must complete the training by end of week.",
                createdAt: Date().addingTimeInterval(-86400),
                attachments: nil,
                likes: 12,
                comments: [],
                isPinned: true
            ),
            Update(
                id: "2",
                authorId: "2",
                authorName: "Jane Smith",
                title: "Team Meeting Reminder",
                content: "Don't forget about our team meeting tomorrow at 2 PM. We'll be discussing the Q4 goals.",
                createdAt: Date().addingTimeInterval(-3600),
                attachments: nil,
                likes: 5,
                comments: [
                    Comment(
                        id: "1",
                        authorId: "3",
                        authorName: "Bob Johnson",
                        content: "Looking forward to it!",
                        createdAt: Date().addingTimeInterval(-1800)
                    )
                ],
                isPinned: false
            )
        ]
    }
}

struct UpdateCard: View {
    let update: Update
    @State private var isLiked = false
    @State private var likeCount: Int
    
    init(update: Update) {
        self.update = update
        _likeCount = State(initialValue: update.likes)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Circle()
                    .fill(Color.blue)
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(update.authorName.prefix(1).uppercased())
                            .foregroundColor(.white)
                    )
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(update.authorName)
                        .font(.headline)
                    Text(update.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if update.isPinned {
                    Image(systemName: "pin.fill")
                        .foregroundColor(.blue)
                        .font(.caption)
                }
            }
            
            // Content
            VStack(alignment: .leading, spacing: 8) {
                Text(update.title)
                    .font(.title3)
                    .fontWeight(.semibold)
                
                Text(update.content)
                    .font(.body)
            }
            
            // Actions
            HStack(spacing: 20) {
                Button(action: { toggleLike() }) {
                    HStack(spacing: 4) {
                        Image(systemName: isLiked ? "heart.fill" : "heart")
                            .foregroundColor(isLiked ? .red : .secondary)
                        Text("\(likeCount)")
                            .font(.subheadline)
                    }
                }
                
                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "bubble.right")
                            .foregroundColor(.secondary)
                        Text("\(update.comments.count)")
                            .font(.subheadline)
                    }
                }
                
                Spacer()
            }
            .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func toggleLike() {
        isLiked.toggle()
        likeCount += isLiked ? 1 : -1
    }
}

#Preview {
    UpdatesView()
}

