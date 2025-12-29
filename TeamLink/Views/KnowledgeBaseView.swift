import SwiftUI

struct KnowledgeBaseView: View {
    @State private var articles: [KnowledgeArticle] = []
    @State private var searchText = ""
    @State private var selectedCategory: String?
    
    var categories: [String] {
        Array(Set(articles.map { $0.category })).sorted()
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding()
                
                // Category Filter
                if !categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            Button(action: { selectedCategory = nil }) {
                                Text("All")
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedCategory == nil ? Color.blue : Color(.systemGray5))
                                    .foregroundColor(selectedCategory == nil ? .white : .primary)
                                    .cornerRadius(20)
                            }
                            
                            ForEach(categories, id: \.self) { category in
                                Button(action: { selectedCategory = category }) {
                                    Text(category)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(selectedCategory == category ? Color.blue : Color(.systemGray5))
                                        .foregroundColor(selectedCategory == category ? .white : .primary)
                                        .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.bottom)
                }
                
                // Articles List
                List(filteredArticles) { article in
                    NavigationLink(destination: ArticleDetailView(article: article)) {
                        ArticleRow(article: article)
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Knowledge Base")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadArticles()
            }
        }
    }
    
    private var filteredArticles: [KnowledgeArticle] {
        var filtered = articles
        
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
        }
        
        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.content.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered
    }
    
    private func loadArticles() {
        articles = [
            KnowledgeArticle(
                id: "1",
                title: "Safety Protocols",
                content: "Complete guide to workplace safety protocols...",
                category: "Safety",
                createdAt: Date(),
                updatedAt: Date()
            ),
            KnowledgeArticle(
                id: "2",
                title: "Employee Handbook",
                content: "Company policies and procedures...",
                category: "HR",
                createdAt: Date(),
                updatedAt: Date()
            ),
            KnowledgeArticle(
                id: "3",
                title: "Equipment Usage",
                content: "How to properly use company equipment...",
                category: "Operations",
                createdAt: Date(),
                updatedAt: Date()
            )
        ]
    }
}

struct KnowledgeArticle: Identifiable {
    let id: String
    let title: String
    let content: String
    let category: String
    let createdAt: Date
    let updatedAt: Date
}

struct ArticleRow: View {
    let article: KnowledgeArticle
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(article.category)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .foregroundColor(.blue)
                    .cornerRadius(8)
                
                Spacer()
            }
            
            Text(article.title)
                .font(.headline)
            
            Text(article.content)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}

struct ArticleDetailView: View {
    let article: KnowledgeArticle
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(article.category)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .foregroundColor(.blue)
                    .cornerRadius(8)
                
                Text(article.title)
                    .font(.title)
                    .fontWeight(.bold)
                
                Text(article.content)
                    .font(.body)
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Article")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    KnowledgeBaseView()
}

