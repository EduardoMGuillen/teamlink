import SwiftUI

struct DirectoryView: View {
    @State private var employees: [User] = []
    @State private var searchText = ""
    @State private var selectedDepartment: String?
    
    var departments: [String] {
        Array(Set(employees.compactMap { $0.department })).sorted()
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding()
                
                // Department Filter
                if !departments.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            Button(action: { selectedDepartment = nil }) {
                                Text("All")
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedDepartment == nil ? Color.blue : Color(.systemGray5))
                                    .foregroundColor(selectedDepartment == nil ? .white : .primary)
                                    .cornerRadius(20)
                            }
                            
                            ForEach(departments, id: \.self) { department in
                                Button(action: { selectedDepartment = department }) {
                                    Text(department)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(selectedDepartment == department ? Color.blue : Color(.systemGray5))
                                        .foregroundColor(selectedDepartment == department ? .white : .primary)
                                        .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.bottom)
                }
                
                // Employees List
                List(filteredEmployees) { employee in
                    EmployeeRow(employee: employee)
                }
                .listStyle(.plain)
            }
            .navigationTitle("Directory")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadEmployees()
            }
        }
    }
    
    private var filteredEmployees: [User] {
        var filtered = employees
        
        if let department = selectedDepartment {
            filtered = filtered.filter { $0.department == department }
        }
        
        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.email.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered
    }
    
    private func loadEmployees() {
        employees = [
            User(id: "1", name: "John Doe", email: "john@example.com", role: .employee, avatarURL: nil, department: "Operations"),
            User(id: "2", name: "Jane Smith", email: "jane@example.com", role: .employee, avatarURL: nil, department: "Operations"),
            User(id: "3", name: "Bob Johnson", email: "bob@example.com", role: .manager, avatarURL: nil, department: "Management"),
            User(id: "4", name: "Alice Williams", email: "alice@example.com", role: .admin, avatarURL: nil, department: "HR")
        ]
    }
}

struct EmployeeRow: View {
    let employee: User
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color.blue)
                .frame(width: 50, height: 50)
                .overlay(
                    Text(employee.name.prefix(1).uppercased())
                        .font(.headline)
                        .foregroundColor(.white)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(employee.name)
                    .font(.headline)
                
                Text(employee.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let department = employee.department {
                    Text(department)
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            Spacer()
            
            Button(action: {}) {
                Image(systemName: "message.fill")
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    DirectoryView()
}

