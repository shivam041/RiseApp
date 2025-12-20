import Foundation
import SwiftData

@Model
final class Quote {
    var text: String
    var author: String
    var category: String
    var imageUrl: String // URL string for Unsplash
    
    init(text: String, author: String, category: String, imageUrl: String) {
        self.text = text
        self.author = author
        self.category = category
        self.imageUrl = imageUrl
    }
}
