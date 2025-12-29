import SwiftUI

struct TrainingView: View {
    @State private var courses: [TrainingCourse] = []
    
    var body: some View {
        NavigationView {
            List {
                Section("Available Courses") {
                    ForEach(courses) { course in
                        NavigationLink(destination: CourseDetailView(course: course)) {
                            CourseRow(course: course)
                        }
                    }
                }
                
                Section("Completed") {
                    ForEach(completedCourses) { course in
                        CourseRow(course: course)
                    }
                }
            }
            .navigationTitle("Training")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadCourses()
            }
        }
    }
    
    private var completedCourses: [TrainingCourse] {
        courses.filter { $0.isCompleted }
    }
    
    private func loadCourses() {
        courses = [
            TrainingCourse(
                id: "1",
                title: "Safety Training",
                description: "Learn about workplace safety protocols",
                duration: 30,
                isCompleted: false,
                progress: 0.0
            ),
            TrainingCourse(
                id: "2",
                title: "Equipment Operation",
                description: "How to safely operate company equipment",
                duration: 45,
                isCompleted: false,
                progress: 0.5
            ),
            TrainingCourse(
                id: "3",
                title: "Company Policies",
                description: "Overview of company policies and procedures",
                duration: 20,
                isCompleted: true,
                progress: 1.0
            )
        ]
    }
}

struct TrainingCourse: Identifiable {
    let id: String
    let title: String
    let description: String
    let duration: Int // in minutes
    let isCompleted: Bool
    let progress: Double
}

struct CourseRow: View {
    let course: TrainingCourse
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(course.title)
                    .font(.headline)
                
                Spacer()
                
                if course.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }
            
            Text(course.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Label("\(course.duration) min", systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if !course.isCompleted {
                    ProgressView(value: course.progress)
                        .frame(width: 100)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct CourseDetailView: View {
    let course: TrainingCourse
    @State private var currentProgress: Double
    
    init(course: TrainingCourse) {
        self.course = course
        _currentProgress = State(initialValue: course.progress)
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Progress
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Progress")
                            .font(.headline)
                        Spacer()
                        Text("\(Int(currentProgress * 100))%")
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                    
                    ProgressView(value: currentProgress)
                        .tint(.blue)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Course Content
                VStack(alignment: .leading, spacing: 16) {
                    Text("Course Content")
                        .font(.headline)
                    
                    ForEach(0..<5) { index in
                        HStack {
                            Image(systemName: currentProgress > Double(index) / 5.0 ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(currentProgress > Double(index) / 5.0 ? .green : .gray)
                            
                            Text("Lesson \(index + 1): Introduction to \(course.title)")
                                .font(.subheadline)
                            
                            Spacer()
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                }
                
                // Complete Button
                if !course.isCompleted {
                    Button(action: {}) {
                        Text("Mark as Complete")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
            }
            .padding()
        }
        .navigationTitle(course.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    TrainingView()
}

