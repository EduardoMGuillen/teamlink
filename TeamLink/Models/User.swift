import Foundation

struct User: Identifiable, Codable {
    let id: String
    let name: String
    let email: String
    let role: UserRole
    let avatarURL: String?
    let department: String?
    
    static let sampleUser = User(
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: .employee,
        avatarURL: nil,
        department: "Operations"
    )
}

enum UserRole: String, Codable {
    case admin
    case manager
    case employee
}

