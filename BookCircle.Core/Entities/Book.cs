using BookCircle.Core.Enums;

namespace BookCircle.Core.Entities;

public class Book
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string? Isbn { get; set; }
    public string Language { get; set; } = string.Empty;
    public DateTime? PublicationDate { get; set; }
    public decimal BorrowPrice { get; set; }
    public BookStatus Status { get; set; } = BookStatus.Available;
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Owner { get; set; } = null!;
    public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<BookReaction> Reactions { get; set; } = new List<BookReaction>();
    public ICollection<ReadingListItem> ReadingListItems { get; set; } = new List<ReadingListItem>();
}
