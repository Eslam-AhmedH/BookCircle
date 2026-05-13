namespace BookCircle.Core.DTOs.Books;

public class BookDto
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string? Isbn { get; set; }
    public string Language { get; set; } = string.Empty;
    public DateTime? PublicationDate { get; set; }
    public decimal BorrowPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsApproved { get; set; }
    public int Likes { get; set; }
    public int Dislikes { get; set; }
    public DateTime CreatedAt { get; set; }
}
