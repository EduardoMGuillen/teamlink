import Foundation

struct Message: Identifiable, Codable {
    let id: String
    let senderId: String
    let senderName: String
    let content: String
    let timestamp: Date
    let isRead: Bool
    let attachments: [Attachment]?
}

struct Chat: Identifiable, Codable {
    let id: String
    let name: String
    let participants: [String]
    let lastMessage: Message?
    let isGroup: Bool
    let avatarURL: String?
}

struct Attachment: Identifiable, Codable {
    let id: String
    let type: AttachmentType
    let url: String
    let name: String
    let size: Int?
    
    enum AttachmentType: String, Codable {
        case image
        case document
        case video
        case audio
    }
}

