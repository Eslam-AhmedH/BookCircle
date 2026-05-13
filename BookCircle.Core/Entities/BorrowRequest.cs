using BookCircle.Core.Enums;

namespace BookCircle.Core.Entities;

public class BorrowRequest
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string RequesterId { get; set; } = string.Empty;
    public BorrowRequestStatus Status { get; set; } = BorrowRequestStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }

    public Book Book { get; set; } = null!;
    public User Requester { get; set; } = null!;
}
