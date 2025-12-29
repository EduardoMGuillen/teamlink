import Foundation

struct Shift: Identifiable, Codable {
    let id: String
    let employeeId: String
    let startTime: Date
    let endTime: Date?
    let location: String?
    let notes: String?
    
    var duration: TimeInterval? {
        guard let endTime = endTime else { return nil }
        return endTime.timeIntervalSince(startTime)
    }
}

struct Schedule: Identifiable, Codable {
    let id: String
    let employeeId: String
    let date: Date
    let startTime: Date
    let endTime: Date
    let location: String
    let position: String?
}

