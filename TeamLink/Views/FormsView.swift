import SwiftUI

struct FormsView: View {
    @State private var forms: [Form] = []
    @State private var submissions: [FormSubmission] = []
    
    var body: some View {
        NavigationView {
            List {
                Section("Available Forms") {
                    ForEach(forms) { form in
                        NavigationLink(destination: FormDetailView(form: form)) {
                            FormRow(form: form)
                        }
                    }
                }
                
                Section("My Submissions") {
                    ForEach(submissions) { submission in
                        SubmissionRow(submission: submission)
                    }
                }
            }
            .navigationTitle("Forms & Checklists")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadForms()
            }
        }
    }
    
    private func loadForms() {
        forms = [
            Form(
                id: "1",
                title: "Daily Safety Checklist",
                description: "Complete this checklist at the start of each shift",
                fields: [
                    FormField(
                        id: "1",
                        type: .checkbox,
                        label: "Safety equipment checked",
                        placeholder: nil,
                        required: true,
                        options: nil
                    ),
                    FormField(
                        id: "2",
                        type: .text,
                        label: "Notes",
                        placeholder: "Any safety concerns?",
                        required: false,
                        options: nil
                    )
                ],
                createdAt: Date(),
                updatedAt: Date()
            ),
            Form(
                id: "2",
                title: "Incident Report",
                description: "Report any workplace incidents",
                fields: [
                    FormField(
                        id: "3",
                        type: .text,
                        label: "Incident Description",
                        placeholder: "Describe what happened",
                        required: true,
                        options: nil
                    ),
                    FormField(
                        id: "4",
                        type: .date,
                        label: "Date of Incident",
                        placeholder: nil,
                        required: true,
                        options: nil
                    )
                ],
                createdAt: Date(),
                updatedAt: Date()
            )
        ]
    }
}

struct FormRow: View {
    let form: Form
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(form.title)
                .font(.headline)
            if let description = form.description {
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct FormDetailView: View {
    let form: Form
    @State private var answers: [String: String] = [:]
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        Form {
            Section {
                if let description = form.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            Section("Form Fields") {
                ForEach(form.fields) { field in
                    FormFieldView(field: field, answer: Binding(
                        get: { answers[field.id] ?? "" },
                        set: { answers[field.id] = $0 }
                    ))
                }
            }
            
            Section {
                Button("Submit") {
                    // Submit form
                    dismiss()
                }
                .frame(maxWidth: .infinity)
            }
        }
        .navigationTitle(form.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FormFieldView: View {
    let field: FormField
    @Binding var answer: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(field.label)
                .font(.headline)
            if field.required {
                Text("Required")
                    .font(.caption2)
                    .foregroundColor(.red)
            }
            
            switch field.type {
            case .text:
                TextField(field.placeholder ?? "Enter text", text: $answer)
            case .textarea:
                TextField(field.placeholder ?? "Enter text", text: $answer, axis: .vertical)
                    .lineLimit(3...6)
            case .number:
                TextField(field.placeholder ?? "Enter number", text: $answer)
                    .keyboardType(.numberPad)
            case .date:
                DatePicker("", selection: Binding(
                    get: { Date() },
                    set: { _ in }
                ), displayedComponents: .date)
            case .time:
                DatePicker("", selection: Binding(
                    get: { Date() },
                    set: { _ in }
                ), displayedComponents: .hourAndMinute)
            case .select:
                Picker("", selection: $answer) {
                    ForEach(field.options ?? [], id: \.self) { option in
                        Text(option).tag(option)
                    }
                }
            case .checkbox:
                Toggle("", isOn: Binding(
                    get: { answer == "true" },
                    set: { answer = $0 ? "true" : "false" }
                ))
            default:
                TextField("Not implemented", text: $answer)
            }
        }
    }
}

struct SubmissionRow: View {
    let submission: FormSubmission
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Form Submission")
                .font(.headline)
            Text(submission.submittedAt, style: .date)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    FormsView()
}

