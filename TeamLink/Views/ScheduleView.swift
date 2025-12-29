import SwiftUI

struct ScheduleView: View {
    @State private var selectedDate = Date()
    @State private var schedules: [Schedule] = []
    @State private var showingAddSchedule = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Date Picker
                DatePicker(
                    "Select Date",
                    selection: $selectedDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .padding()
                
                Divider()
                
                // Schedule List
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(filteredSchedules) { schedule in
                            ScheduleCard(schedule: schedule)
                        }
                        
                        if filteredSchedules.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "calendar.badge.exclamationmark")
                                    .font(.system(size: 50))
                                    .foregroundColor(.secondary)
                                Text("No shifts scheduled")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                                Text("You don't have any shifts scheduled for this date")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(.top, 60)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Schedule")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddSchedule = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddSchedule) {
                AddScheduleView()
            }
            .onAppear {
                loadSchedules()
            }
        }
    }
    
    private var filteredSchedules: [Schedule] {
        let calendar = Calendar.current
        return schedules.filter { schedule in
            calendar.isDate(schedule.date, inSameDayAs: selectedDate)
        }
    }
    
    private func loadSchedules() {
        // Load schedules from backend
        // Sample data for demo
        schedules = [
            Schedule(
                id: "1",
                employeeId: "1",
                date: Date(),
                startTime: Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date())!,
                endTime: Calendar.current.date(bySettingHour: 17, minute: 0, second: 0, of: Date())!,
                location: "Main Office",
                position: "Operations"
            ),
            Schedule(
                id: "2",
                employeeId: "1",
                date: Calendar.current.date(byAdding: .day, value: 1, to: Date())!,
                startTime: Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Calendar.current.date(byAdding: .day, value: 1, to: Date())!)!,
                endTime: Calendar.current.date(bySettingHour: 16, minute: 0, second: 0, of: Calendar.current.date(byAdding: .day, value: 1, to: Date())!)!,
                location: "Warehouse",
                position: "Operations"
            )
        ]
    }
}

struct ScheduleCard: View {
    let schedule: Schedule
    
    var body: some View {
        HStack(spacing: 16) {
            // Time Indicator
            VStack(spacing: 4) {
                Text(schedule.startTime, style: .time)
                    .font(.headline)
                Text("-")
                    .foregroundColor(.secondary)
                Text(schedule.endTime, style: .time)
                    .font(.headline)
            }
            .frame(width: 80)
            
            Divider()
                .frame(height: 50)
            
            // Schedule Details
            VStack(alignment: .leading, spacing: 6) {
                Text(schedule.position ?? "Shift")
                    .font(.headline)
                
                HStack {
                    Image(systemName: "mappin.circle.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                    Text(schedule.location)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Text(durationString)
                    .font(.caption)
                    .foregroundColor(.blue)
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private var durationString: String {
        let duration = schedule.endTime.timeIntervalSince(schedule.startTime)
        let hours = Int(duration) / 3600
        return "\(hours) hours"
    }
}

struct AddScheduleView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedDate = Date()
    @State private var startTime = Date()
    @State private var endTime = Date()
    @State private var location = "Main Office"
    @State private var position = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Date & Time") {
                    DatePicker("Date", selection: $selectedDate, displayedComponents: .date)
                    DatePicker("Start Time", selection: $startTime, displayedComponents: .hourAndMinute)
                    DatePicker("End Time", selection: $endTime, displayedComponents: .hourAndMinute)
                }
                
                Section("Details") {
                    TextField("Location", text: $location)
                    TextField("Position (Optional)", text: $position)
                }
            }
            .navigationTitle("Add Schedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        // Save schedule
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ScheduleView()
}

