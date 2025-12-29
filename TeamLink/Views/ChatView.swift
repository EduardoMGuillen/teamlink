import SwiftUI

struct ChatView: View {
    @State private var chats: [Chat] = []
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding()
                
                // Chats List
                List(filteredChats) { chat in
                    NavigationLink(destination: ChatDetailView(chat: chat)) {
                        ChatRow(chat: chat)
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Chat")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .onAppear {
                loadChats()
            }
        }
    }
    
    private var filteredChats: [Chat] {
        if searchText.isEmpty {
            return chats
        }
        return chats.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }
    
    private func loadChats() {
        chats = [
            Chat(
                id: "1",
                name: "Team Channel",
                participants: ["1", "2", "3"],
                lastMessage: Message(
                    id: "1",
                    senderId: "2",
                    senderName: "Jane Smith",
                    content: "Meeting at 3 PM today",
                    timestamp: Date(),
                    isRead: false,
                    attachments: nil
                ),
                isGroup: true,
                avatarURL: nil
            ),
            Chat(
                id: "2",
                name: "Manager",
                participants: ["1", "4"],
                lastMessage: Message(
                    id: "2",
                    senderId: "4",
                    senderName: "Manager",
                    content: "Great work on the project!",
                    timestamp: Date().addingTimeInterval(-3600),
                    isRead: true,
                    attachments: nil
                ),
                isGroup: false,
                avatarURL: nil
            )
        ]
    }
}

struct ChatRow: View {
    let chat: Chat
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            Circle()
                .fill(Color.blue)
                .frame(width: 50, height: 50)
                .overlay(
                    Text(chat.name.prefix(1).uppercased())
                        .font(.headline)
                        .foregroundColor(.white)
                )
            
            // Chat Info
            VStack(alignment: .leading, spacing: 4) {
                Text(chat.name)
                    .font(.headline)
                
                if let lastMessage = chat.lastMessage {
                    Text(lastMessage.content)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            // Timestamp
            if let lastMessage = chat.lastMessage {
                VStack(alignment: .trailing, spacing: 4) {
                    Text(lastMessage.timestamp, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if !lastMessage.isRead {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 8, height: 8)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct ChatDetailView: View {
    let chat: Chat
    @State private var messages: [Message] = []
    @State private var messageText = ""
    
    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }
                .padding()
            }
            
            // Message Input
            HStack(spacing: 12) {
                TextField("Type a message...", text: $messageText)
                    .textFieldStyle(.roundedBorder)
                
                Button(action: sendMessage) {
                    Image(systemName: "paperplane.fill")
                        .foregroundColor(.blue)
                }
                .disabled(messageText.isEmpty)
            }
            .padding()
        }
        .navigationTitle(chat.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            loadMessages()
        }
    }
    
    private func loadMessages() {
        messages = [
            Message(
                id: "1",
                senderId: "2",
                senderName: "Jane Smith",
                content: "Hey, how's it going?",
                timestamp: Date().addingTimeInterval(-3600),
                isRead: true,
                attachments: nil
            ),
            Message(
                id: "2",
                senderId: "1",
                senderName: "You",
                content: "Great! Working on the new project.",
                timestamp: Date().addingTimeInterval(-1800),
                isRead: true,
                attachments: nil
            )
        ]
    }
    
    private func sendMessage() {
        let newMessage = Message(
            id: UUID().uuidString,
            senderId: "1",
            senderName: "You",
            content: messageText,
            timestamp: Date(),
            isRead: false,
            attachments: nil
        )
        messages.append(newMessage)
        messageText = ""
    }
}

struct MessageBubble: View {
    let message: Message
    @EnvironmentObject var appState: AppState
    
    private var isFromCurrentUser: Bool {
        message.senderId == appState.currentUser?.id
    }
    
    var body: some View {
        HStack {
            if isFromCurrentUser {
                Spacer()
            }
            
            VStack(alignment: isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                if !isFromCurrentUser {
                    Text(message.senderName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(message.content)
                    .padding()
                    .background(isFromCurrentUser ? Color.blue : Color(.systemGray5))
                    .foregroundColor(isFromCurrentUser ? .white : .primary)
                    .cornerRadius(16)
                
                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: UIScreen.main.bounds.width * 0.7, alignment: isFromCurrentUser ? .trailing : .leading)
            
            if !isFromCurrentUser {
                Spacer()
            }
        }
    }
}

struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            
            TextField("Search", text: $text)
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

#Preview {
    ChatView()
        .environmentObject(AppState())
}

