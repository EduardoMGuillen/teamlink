import Foundation

struct Form: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    let fields: [FormField]
    let createdAt: Date
    let updatedAt: Date
}

struct FormField: Identifiable, Codable {
    let id: String
    let type: FieldType
    let label: String
    let placeholder: String?
    let required: Bool
    let options: [String]? // For select/dropdown fields
    
    enum FieldType: String, Codable {
        case text
        case number
        case date
        case time
        case select
        case checkbox
        case textarea
        case signature
        case photo
    }
}

struct FormSubmission: Identifiable, Codable {
    let id: String
    let formId: String
    let submittedBy: String
    let submittedAt: Date
    let answers: [String: String]
}

