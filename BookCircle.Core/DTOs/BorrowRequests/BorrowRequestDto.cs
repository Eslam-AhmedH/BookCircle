namespace BookCircle.Core.DTOs.BorrowRequests;

public class BorrowRequestDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string? BookCoverImageUrl { get; set; }

    // Reader info (frontend calls them "reader")
    public string ReaderId { get; set; } = string.Empty;
    public string ReaderName { get; set; } = string.Empty;
    public string? ReaderAvatarUrl { get; set; }

    // Owner info
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;

    // Status & dates
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }   // ← frontend expects "requestedAt"
    public DateTime? RespondedAt { get; set; }
}