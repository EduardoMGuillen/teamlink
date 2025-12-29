import SwiftUI

struct TasksView: View {
    @State private var tasks: [Task] = []
    @State private var selectedFilter: TaskFilter = .all
    @State private var showingAddTask = false
    
    enum TaskFilter: String, CaseIterable {
        case all = "All"
        case pending = "Pending"
        case inProgress = "In Progress"
        case completed = "Completed"
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Filter Picker
                Picker("Filter", selection: $selectedFilter) {
                    ForEach(TaskFilter.allCases, id: \.self) { filter in
                        Text(filter.rawValue).tag(filter)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                
                Divider()
                
                // Tasks List
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(filteredTasks) { task in
                            TaskCard(task: task)
                        }
                        
                        if filteredTasks.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "checklist")
                                    .font(.system(size: 50))
                                    .foregroundColor(.secondary)
                                Text("No tasks")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                                Text("You don't have any tasks in this category")
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
            .navigationTitle("Tasks")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTask = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskView()
            }
            .onAppear {
                loadTasks()
            }
        }
    }
    
    private var filteredTasks: [Task] {
        switch selectedFilter {
        case .all:
            return tasks
        case .pending:
            return tasks.filter { $0.status == .pending }
        case .inProgress:
            return tasks.filter { $0.status == .inProgress }
        case .completed:
            return tasks.filter { $0.status == .completed }
        }
    }
    
    private func loadTasks() {
        // Load tasks from backend
        tasks = [
            Task(
                id: "1",
                title: "Complete daily safety checklist",
                description: "Review and complete all safety protocols",
                assignedTo: "1",
                dueDate: Date(),
                status: .pending,
                priority: .high,
                createdAt: Date().addingTimeInterval(-86400)
            ),
            Task(
                id: "2",
                title: "Update inventory records",
                description: "Verify and update warehouse inventory",
                assignedTo: "1",
                dueDate: Date().addingTimeInterval(86400),
                status: .inProgress,
                priority: .medium,
                createdAt: Date().addingTimeInterval(-172800)
            ),
            Task(
                id: "3",
                title: "Attend team meeting",
                description: "Weekly team sync at 2 PM",
                assignedTo: "1",
                dueDate: Date(),
                status: .completed,
                priority: .low,
                createdAt: Date().addingTimeInterval(-259200)
            )
        ]
    }
}

struct TaskCard: View {
    let task: Task
    @State private var isCompleted = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Status Indicator
            Button(action: { toggleStatus() }) {
                Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isCompleted ? .green : .gray)
                    .font(.title3)
            }
            
            // Task Details
            VStack(alignment: .leading, spacing: 6) {
                Text(task.title)
                    .font(.headline)
                    .strikethrough(isCompleted)
                
                if let description = task.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                HStack(spacing: 12) {
                    // Priority Badge
                    PriorityBadge(priority: task.priority)
                    
                    // Due Date
                    if let dueDate = task.dueDate {
                        Label(dueDate, style: .date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onAppear {
            isCompleted = task.status == .completed
        }
    }
    
    private func toggleStatus() {
        isCompleted.toggle()
        // Update task status in backend
    }
}

struct PriorityBadge: View {
    let priority: Task.TaskPriority
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(priorityColor)
                .frame(width: 6, height: 6)
            Text(priority.rawValue.capitalized)
                .font(.caption2)
                .foregroundColor(priorityColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(priorityColor.opacity(0.1))
        .cornerRadius(8)
    }
    
    private var priorityColor: Color {
        switch priority {
        case .low:
            return .gray
        case .medium:
            return .blue
        case .high:
            return .orange
        case .urgent:
            return .red
        }
    }
}

struct AddTaskView: View {
    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var description = ""
    @State private var dueDate = Date()
    @State private var priority: Task.TaskPriority = .medium
    @State private var hasDueDate = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Task Details") {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("Priority") {
                    Picker("Priority", selection: $priority) {
                        Text("Low").tag(Task.TaskPriority.low)
                        Text("Medium").tag(Task.TaskPriority.medium)
                        Text("High").tag(Task.TaskPriority.high)
                        Text("Urgent").tag(Task.TaskPriority.urgent)
                    }
                }
                
                Section("Due Date") {
                    Toggle("Set due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Due Date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        // Save task
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}

#Preview {
    TasksView()
}

