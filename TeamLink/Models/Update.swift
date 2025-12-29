import Foundation

struct Update: Identifiable, Codable {
    let id: String
    let authorId: String
    let authorName: String
    let title: String
    let content: String
    let createdAt: Date
    let attachments: [Attachment]?
    let likes: Int
    let comments: [Comment]
    let isPinned: Bool
}

struct Comment: Identifiable, Codable {
    let id: String
    let authorId: String
    let authorName: String
    let content: String
    let createdAt: Date
}

struct Notification: Identifiable, Codable {
    let id: String
    let type: NotificationType
    let title: String
    let message: String
    let timestamp: Date
    let isRead: Bool
    let actionURL: String?
    
    enum NotificationType: String, Codable {
        case shift
        case task
        case message
        case update
        case system
    }
}

