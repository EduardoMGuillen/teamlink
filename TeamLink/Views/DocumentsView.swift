import SwiftUI

struct DocumentsView: View {
    @State private var documents: [Document] = []
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding()
                
                // Documents List
                List(filteredDocuments) { document in
                    DocumentRow(document: document)
                }
                .listStyle(.plain)
            }
            .navigationTitle("Documents")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadDocuments()
            }
        }
    }
    
    private var filteredDocuments: [Document] {
        if searchText.isEmpty {
            return documents
        }
        return documents.filter {
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    private func loadDocuments() {
        documents = [
            Document(
                id: "1",
                name: "Employee Handbook.pdf",
                type: .pdf,
                size: 2048,
                uploadedAt: Date(),
                uploadedBy: "HR Team"
            ),
            Document(
                id: "2",
                name: "Safety Guidelines.docx",
                type: .document,
                size: 1024,
                uploadedAt: Date().addingTimeInterval(-86400),
                uploadedBy: "Safety Team"
            ),
            Document(
                id: "3",
                name: "Company Policies.pdf",
                type: .pdf,
                size: 3072,
                uploadedAt: Date().addingTimeInterval(-172800),
                uploadedBy: "Management"
            )
        ]
    }
}

struct Document: Identifiable {
    let id: String
    let name: String
    let type: DocumentType
    let size: Int // in KB
    let uploadedAt: Date
    let uploadedBy: String
    
    enum DocumentType {
        case pdf
        case document
        case image
        case other
        
        var icon: String {
            switch self {
            case .pdf: return "doc.fill"
            case .document: return "doc.text.fill"
            case .image: return "photo.fill"
            case .other: return "doc.fill"
            }
        }
    }
}

struct DocumentRow: View {
    let document: Document
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: document.type.icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(document.name)
                    .font(.headline)
                
                HStack {
                    Text("\(document.size) KB")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .foregroundColor(.secondary)
                    
                    Text(document.uploadedAt, style: .date)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text("Uploaded by \(document.uploadedBy)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button(action: {}) {
                Image(systemName: "arrow.down.circle.fill")
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    DocumentsView()
}

