import Foundation

struct Task: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    let assignedTo: String
    let dueDate: Date?
    let status: TaskStatus
    let priority: TaskPriority
    let createdAt: Date
    
    enum TaskStatus: String, Codable {
        case pending
        case inProgress
        case completed
        case cancelled
    }
    
    enum TaskPriority: String, Codable {
        case low
        case medium
        case high
        case urgent
    }
}

