import SwiftUI

struct TimeClockView: View {
    @State private var isClockedIn = false
    @State private var clockInTime: Date?
    @State private var currentShift: Shift?
    @State private var location: String = "Main Office"
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()
                
                // Clock Display
                VStack(spacing: 20) {
                    Text(currentTimeString)
                        .font(.system(size: 64, weight: .light, design: .rounded))
                        .monospacedDigit()
                    
                    if isClockedIn, let clockInTime = clockInTime {
                        Text("Clocked in at \(clockInTime, style: .time)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text("Duration: \(elapsedTimeString)")
                            .font(.title3)
                            .fontWeight(.medium)
                            .foregroundColor(.blue)
                    }
                }
                
                Spacer()
                
                // Location Picker
                if !isClockedIn {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Location")
                            .font(.headline)
                        Picker("Location", selection: $location) {
                            Text("Main Office").tag("Main Office")
                            Text("Warehouse").tag("Warehouse")
                            Text("Remote").tag("Remote")
                        }
                        .pickerStyle(.menu)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
                
                // Clock In/Out Button
                Button(action: toggleClock) {
                    HStack {
                        Image(systemName: isClockedIn ? "clock.fill" : "clock.badge.checkmark.fill")
                        Text(isClockedIn ? "Clock Out" : "Clock In")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isClockedIn ? Color.red : Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(16)
                }
                .padding(.horizontal)
                
                // Recent Shifts
                if !isClockedIn {
                    recentShiftsSection
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Time Clock")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear {
            loadCurrentShift()
        }
    }
    
    private var currentTimeString: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .medium
        return formatter.string(from: Date())
    }
    
    private var elapsedTimeString: String {
        guard let clockInTime = clockInTime else { return "0:00:00" }
        let elapsed = Date().timeIntervalSince(clockInTime)
        let hours = Int(elapsed) / 3600
        let minutes = Int(elapsed) / 60 % 60
        let seconds = Int(elapsed) % 60
        return String(format: "%d:%02d:%02d", hours, minutes, seconds)
    }
    
    private func toggleClock() {
        if isClockedIn {
            clockOut()
        } else {
            clockIn()
        }
    }
    
    private func clockIn() {
        clockInTime = Date()
        isClockedIn = true
        currentShift = Shift(
            id: UUID().uuidString,
            employeeId: "1",
            startTime: clockInTime!,
            endTime: nil,
            location: location,
            notes: nil
        )
    }
    
    private func clockOut() {
        guard let startTime = clockInTime else { return }
        let endTime = Date()
        // Save shift to backend
        isClockedIn = false
        clockInTime = nil
        currentShift = nil
    }
    
    private func loadCurrentShift() {
        // Load current shift from backend
        // For demo, check if there's an active shift
    }
    
    private var recentShiftsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Shifts")
                .font(.headline)
            
            VStack(spacing: 8) {
                ShiftRow(
                    date: Date(),
                    startTime: Date().addingTimeInterval(-28800),
                    endTime: Date().addingTimeInterval(-3600),
                    duration: 7.0,
                    location: "Main Office"
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct ShiftRow: View {
    let date: Date
    let startTime: Date
    let endTime: Date
    let duration: Double
    let location: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(date, style: .date)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("\(startTime, style: .time) - \(endTime, style: .time)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(location)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(String(format: "%.1f hrs", duration))
                .font(.headline)
                .foregroundColor(.blue)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

#Preview {
    TimeClockView()
}

