namespace BookCircle.Core.DTOs.ReadingLists;

public class ReadingListItemDto
{
    public int Id { get; set; }
    public int ReadingListId { get; set; }
    public int BookId { get; set; }

    // Frontend expects flat properties (title, author, etc.)
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;

    public DateTime AddedAt { get; set; }
}